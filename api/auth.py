#!/usr/bin/env python3
"""
Postir V2 — Authentication endpoints
Handles user signup, login, logout, token refresh, and profile retrieval.
Vercel serverless function (BaseHTTPRequestHandler format).
No external dependencies — stdlib only. Supabase helpers inlined.
"""
import json
import os
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, urlencode


# ══════════════════════════════════════════════════════════════════════
#  Inlined Supabase helpers (avoid cross-module import on Vercel)
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
    if isinstance(resp, dict) and not resp.get("_error"):
        return resp
    return None


def _create_profile(user_id, email):
    data = {"id": user_id, "email": email, "plan": "free", "tokens_total": 3, "tokens_used": 0}
    resp = _sb_request("POST", "/rest/v1/profiles", data=data, use_service_key=True)
    return not (resp and resp.get("_error"))


# ══════════════════════════════════════════════════════════════════════
#  Handler
# ══════════════════════════════════════════════════════════════════════

class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        sub = parsed.path.replace("/api/auth", "").strip("/")
        if sub == "me":
            self._handle_me()
        else:
            self._send_json(404, {"error": "Not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        sub = parsed.path.replace("/api/auth", "").strip("/")
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body_raw = self.rfile.read(content_length) if content_length > 0 else b'{}'
            body = json.loads(body_raw)
        except Exception as e:
            self._send_json(400, {"error": f"Invalid JSON: {str(e)}"})
            return

        if sub == "signup":
            self._handle_signup(body)
        elif sub == "login":
            self._handle_login(body)
        elif sub == "logout":
            self._handle_logout()
        elif sub == "refresh":
            self._handle_refresh(body)
        else:
            self._send_json(404, {"error": f"Unknown auth endpoint: /{sub}"})

    # ─────────────────────────── Handlers ────────────────────────────

    def _handle_signup(self, body):
        email = body.get("email", "").strip()
        password = body.get("password", "")
        if not email or not password:
            self._send_json(400, {"error": "email and password are required"})
            return
        if len(password) < 6:
            self._send_json(400, {"error": "Password must be at least 6 characters"})
            return

        resp = _sb_request("POST", "/auth/v1/signup", data={"email": email, "password": password})
        if resp and resp.get("_error"):
            status = resp.get("_status", 400)
            err_body = resp.get("_body", {})
            msg = err_body.get("msg") or err_body.get("message") or str(err_body) if isinstance(err_body, dict) else str(err_body)
            self._send_json(status, {"error": msg})
            return

        user = resp.get("user") or resp
        session = resp.get("session", {})
        access_token = session.get("access_token") if session else resp.get("access_token")
        refresh_token = session.get("refresh_token") if session else resp.get("refresh_token")
        user_id = user.get("id") if isinstance(user, dict) else resp.get("id")
        user_email = user.get("email") if isinstance(user, dict) else email

        if user_id:
            _create_profile(user_id, user_email)

        self._send_json(200, {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {"id": user_id, "email": user_email},
            "message": "Registration successful. Please check your email to confirm your account."
        })

    def _handle_login(self, body):
        email = body.get("email", "").strip()
        password = body.get("password", "")
        if not email or not password:
            self._send_json(400, {"error": "email and password are required"})
            return

        resp = _sb_request("POST", "/auth/v1/token", data={"email": email, "password": password},
                           params={"grant_type": "password"})
        if resp and resp.get("_error"):
            status = resp.get("_status", 401)
            err_body = resp.get("_body", {})
            msg = err_body.get("error_description") or err_body.get("msg") or "Invalid credentials" if isinstance(err_body, dict) else "Invalid credentials"
            self._send_json(status, {"error": msg})
            return

        self._send_json(200, {
            "access_token": resp.get("access_token"),
            "refresh_token": resp.get("refresh_token"),
            "user": {"id": resp.get("user", {}).get("id"), "email": resp.get("user", {}).get("email")},
        })

    def _handle_me(self):
        token = self._get_bearer_token()
        if not token:
            self._send_json(401, {"error": "Authorization header required"})
            return
        user = _verify_token(token)
        if not user:
            self._send_json(401, {"error": "Invalid or expired token"})
            return

        user_id = user.get("id")
        profile = _get_user_profile(user_id)
        if not profile:
            _create_profile(user_id, user.get("email", ""))
            profile = {"id": user_id, "email": user.get("email", ""), "plan": "free",
                       "tokens_total": 3, "tokens_used": 0}

        self._send_json(200, {
            "id": user_id, "email": user.get("email"),
            "plan": profile.get("plan", "free"),
            "tokens_total": profile.get("tokens_total", 3),
            "tokens_used": profile.get("tokens_used", 0),
            "tokens_remaining": max(0, profile.get("tokens_total", 3) - profile.get("tokens_used", 0)),
            "display_name": profile.get("display_name"),
            "plan_started_at": profile.get("plan_started_at"),
            "plan_expires_at": profile.get("plan_expires_at"),
            "created_at": profile.get("created_at"),
        })

    def _handle_logout(self):
        token = self._get_bearer_token()
        if not token:
            self._send_json(400, {"error": "Authorization header required"})
            return
        _sb_request("POST", "/auth/v1/logout", token=token)
        self._send_json(200, {"message": "Logged out successfully"})

    def _handle_refresh(self, body):
        refresh_token = body.get("refresh_token", "").strip()
        if not refresh_token:
            self._send_json(400, {"error": "refresh_token is required"})
            return

        resp = _sb_request("POST", "/auth/v1/token",
                           data={"refresh_token": refresh_token},
                           params={"grant_type": "refresh_token"})
        if resp and resp.get("_error"):
            self._send_json(resp.get("_status", 401), {"error": "Token refresh failed. Please log in again."})
            return

        self._send_json(200, {
            "access_token": resp.get("access_token"),
            "refresh_token": resp.get("refresh_token"),
            "user": {"id": resp.get("user", {}).get("id"), "email": resp.get("user", {}).get("email")},
        })

    # ─────────────────────────── Helpers ─────────────────────────────

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
