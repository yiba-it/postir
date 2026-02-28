#!/usr/bin/env python3
"""
Postir V2 — Airwallex Payment Integration
Creates PaymentIntents and returns checkout data.
Vercel serverless function. Supabase helpers inlined.
"""
import json
import os
import urllib.request
import urllib.error
import uuid
import time
from http.server import BaseHTTPRequestHandler
from datetime import datetime, timezone, timedelta
from urllib.parse import urlencode


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


def _update_user_plan(user_id, plan, tokens_total, tokens_used=0, plan_expires_at=None, airwallex_customer_id=None):
    data = {"plan": plan, "tokens_total": tokens_total, "tokens_used": tokens_used, "updated_at": "now()"}
    if plan_expires_at:
        data["plan_expires_at"] = plan_expires_at
    if airwallex_customer_id:
        data["airwallex_customer_id"] = airwallex_customer_id
    resp = _sb_request("PATCH", "/rest/v1/profiles", data=data, use_service_key=True,
                       params={"id": f"eq.{user_id}"})
    return not (resp and resp.get("_error"))


def _log_payment(user_id, plan, amount_sar, airwallex_intent_id=None, status="completed"):
    data = {"user_id": user_id, "plan": plan, "amount_sar": amount_sar, "status": status}
    if airwallex_intent_id:
        data["airwallex_intent_id"] = airwallex_intent_id
    resp = _sb_request("POST", "/rest/v1/payments", data=data, use_service_key=True)
    return not (resp and resp.get("_error"))


AIRWALLEX_BASE_URL = "https://api.airwallex.com"
AIRWALLEX_CLIENT_ID = os.environ.get("AIRWALLEX_CLIENT_ID", "")
AIRWALLEX_API_KEY = os.environ.get("AIRWALLEX_API_KEY", "")

_token_cache = {"token": None, "expires_at": 0}

PLANS = {
    "starter": {
        "amount": 10.00, "currency": "SAR",
        "description": "Postir - Starter Plan (10 Posts)", "order_prefix": "STR",
        "tokens_total": 10, "plan_name": "starter", "expires_days": None,
    },
    "pro": {
        "amount": 99.00, "currency": "SAR",
        "description": "Postir - Pro Plan (Monthly Unlimited)", "order_prefix": "PRO",
        "tokens_total": 999999, "plan_name": "pro", "expires_days": 30,
    },
    "ppu": {
        "amount": 10.00, "currency": "SAR",
        "description": "Postir - Pay Per Use (10 Posts)", "order_prefix": "PPU",
        "tokens_total": 10, "plan_name": "starter", "expires_days": None,
    },
}


def get_auth_token():
    now = time.time()
    if _token_cache["token"] and _token_cache["expires_at"] > now + 60:
        return _token_cache["token"]
    url = f"{AIRWALLEX_BASE_URL}/api/v1/authentication/login"
    req = urllib.request.Request(url, method="POST", headers={
        "Content-Type": "application/json",
        "x-api-key": AIRWALLEX_API_KEY, "x-client-id": AIRWALLEX_CLIENT_ID,
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    _token_cache["token"] = data["token"]
    _token_cache["expires_at"] = now + 25 * 60
    return data["token"]


def create_payment_intent(amount, currency, description, merchant_order_id, return_url, metadata=None):
    token = get_auth_token()
    url = f"{AIRWALLEX_BASE_URL}/api/v1/pa/payment_intents/create"
    payload = {
        "request_id": str(uuid.uuid4()), "amount": amount, "currency": currency,
        "merchant_order_id": merchant_order_id, "descriptor": description,
        "return_url": return_url, "metadata": metadata or {"product": "postir"},
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={
        "Content-Type": "application/json", "Authorization": f"Bearer {token}",
    }, method="POST")
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_POST(self):
        token = self._get_bearer_token()
        if not token:
            self._send_json(401, {"error": "Authentication required. Please log in to purchase a plan."})
            return
        user = _verify_token(token)
        if not user:
            self._send_json(401, {"error": "Invalid or expired token. Please log in again."})
            return

        user_id = user["id"]
        user_email = user.get("email", "")

        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body_raw = self.rfile.read(content_length) if content_length > 0 else b'{}'
            body = json.loads(body_raw)
        except Exception as e:
            self._send_json(400, {"error": f"Invalid request: {str(e)}"})
            return

        plan = body.get("plan", "starter")
        return_url = body.get("return_url", "")

        if plan not in PLANS:
            self._send_json(400, {"error": f"Unknown plan: '{plan}'. Valid plans: {', '.join(PLANS.keys())}."})
            return

        plan_data = PLANS[plan]
        order_id = f"{plan_data['order_prefix']}-{int(time.time())}-{uuid.uuid4().hex[:6]}"

        try:
            intent = create_payment_intent(
                amount=plan_data["amount"], currency=plan_data["currency"],
                description=plan_data["description"], merchant_order_id=order_id,
                return_url=return_url or "https://postir.co/#payment-success",
                metadata={"product": "postir", "plan": plan_data["plan_name"],
                          "user_id": user_id, "user_email": user_email},
            )

            plan_expires_at = None
            if plan_data.get("expires_days"):
                expires = datetime.now(timezone.utc) + timedelta(days=plan_data["expires_days"])
                plan_expires_at = expires.isoformat()

            _update_user_plan(user_id=user_id, plan=plan_data["plan_name"],
                              tokens_total=plan_data["tokens_total"], tokens_used=0,
                              plan_expires_at=plan_expires_at)

            _log_payment(user_id=user_id, plan=plan_data["plan_name"],
                         amount_sar=plan_data["amount"],
                         airwallex_intent_id=intent.get("id"), status="pending")

            result = {
                "intent_id": intent["id"], "client_secret": intent["client_secret"],
                "currency": plan_data["currency"], "amount": plan_data["amount"],
                "order_id": order_id, "plan": plan_data["plan_name"],
                "tokens_granted": plan_data["tokens_total"] if plan_data["tokens_total"] < 999999 else "unlimited",
            }
            self._send_json(200, result)

        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8") if e.fp else ""
            self._send_json(e.code, {"error": f"Payment service error: {error_body}"})
        except Exception as e:
            self._send_json(500, {"error": f"Server error: {str(e)}"})

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
