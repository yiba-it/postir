#!/usr/bin/env python3
"""
Postir V2 — Usage Tracking Endpoint
Returns user's current plan, token usage, and generation history.
Vercel serverless function. Supabase helpers inlined.
"""
import json
import os
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlencode
import urllib.request
import urllib.error


# ══════════════════════════════════════════════════════════════════════
#  Inlined Supabase helpers
# ══════════════════════════════════════════════════════════════════════

def _sb_config():
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    sk = os.environ.get("SUPABASE_SERVICE_KEY", "")
    ak = os.environ.get("SUPABASE_ANON_KEY", "")
    return url, sk, ak


def _sb_request(method, path, data=None, token=None, use_service_key=False, params=None):
    sb_url, sk, ak = _sb_config()
    if not sb_url:
        raise ValueError("SUPABASE_URL not configured")
    full_url = f"{sb_url}{path}"
    if params:
        full_url += "?" + urlencode(params)
    headers = {"Content-Type": "application/json", "apikey": ak, "Accept": "application/json"}
    if use_service_key and sk:
        headers["Authorization"] = f"Bearer {sk}"
        headers["apikey"] = sk
    elif token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(full_url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8") if e.fp else ""
        try:
            return {"_error": True, "_status": e.code, "_body": json.loads(raw)}
        except Exception:
            return {"_error": True, "_status": e.code, "_body": raw}


def _verify_token(token):
    if not token:
        return None
    resp = _sb_request("GET", "/auth/v1/user", token=token)
    if resp and not resp.get("_error") and resp.get("id"):
        return resp
    return None


def _get_user_profile(user_id):
    resp = _sb_request("GET", "/rest/v1/profiles", use_service_key=True,
                       params={"id": f"eq.{user_id}", "limit": "1"})
    if isinstance(resp, list) and len(resp) > 0:
        return resp[0]
    return None


# ══════════════════════════════════════════════════════════════════════
#  Handler
# ══════════════════════════════════════════════════════════════════════

class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        token = self._get_bearer_token()
        if not token:
            self._send_json(401, {"error": "Authentication required. Please log in."})
            return
        user = _verify_token(token)
        if not user:
            self._send_json(401, {"error": "Invalid or expired token. Please log in again."})
            return

        user_id = user["id"]
        profile = _get_user_profile(user_id)
        if not profile:
            self._send_json(404, {"error": "User profile not found."})
            return

        plan = profile.get("plan", "free")
        tokens_total = profile.get("tokens_total", 3)
        tokens_used = profile.get("tokens_used", 0)
        tokens_remaining = max(0, tokens_total - tokens_used)

        generations = []
        try:
            resp = _sb_request("GET", "/rest/v1/generations", use_service_key=True, params={
                "user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": "20",
                "select": "id,type,platform,tokens_consumed,prompt_summary,created_at",
            })
            if isinstance(resp, list):
                generations = resp
        except Exception:
            generations = []

        payments = []
        try:
            resp = _sb_request("GET", "/rest/v1/payments", use_service_key=True, params={
                "user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": "5",
                "select": "id,plan,amount_sar,status,created_at",
            })
            if isinstance(resp, list):
                payments = resp
        except Exception:
            payments = []

        self._send_json(200, {
            "plan": plan, "tokens_total": tokens_total, "tokens_used": tokens_used,
            "tokens_remaining": tokens_remaining,
            "plan_started_at": profile.get("plan_started_at"),
            "plan_expires_at": profile.get("plan_expires_at"),
            "generations": generations, "payments": payments,
        })

    def _get_bearer_token(self):
        auth = self.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            return auth[7:].strip()
        return None

    def _send_json(self, status_code, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
