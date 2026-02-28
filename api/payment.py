#!/usr/bin/env python3
"""
Postir — Airwallex Payment Integration
Creates PaymentIntents and returns checkout data for the Airwallex Hosted Payment Page.
Vercel serverless function (BaseHTTPRequestHandler format).
"""
import json
import os
import urllib.request
import urllib.error
import uuid
import time
from http.server import BaseHTTPRequestHandler

# ===== AIRWALLEX CONFIG =====
AIRWALLEX_BASE_URL = "https://api.airwallex.com"
AIRWALLEX_CLIENT_ID = os.environ.get("AIRWALLEX_CLIENT_ID", "")
AIRWALLEX_API_KEY = os.environ.get("AIRWALLEX_API_KEY", "")

# Cache token in memory (expires after ~30 min)
_token_cache = {"token": None, "expires_at": 0}


def get_auth_token():
    """Authenticate with Airwallex and get access token."""
    now = time.time()
    if _token_cache["token"] and _token_cache["expires_at"] > now + 60:
        return _token_cache["token"]

    url = f"{AIRWALLEX_BASE_URL}/api/v1/authentication/login"
    req = urllib.request.Request(
        url,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-api-key": AIRWALLEX_API_KEY,
            "x-client-id": AIRWALLEX_CLIENT_ID,
        },
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    _token_cache["token"] = data["token"]
    # Parse expiry — it's an ISO string but we just set 25 min from now for safety
    _token_cache["expires_at"] = now + 25 * 60
    return data["token"]


def create_payment_intent(amount, currency, description, merchant_order_id, return_url):
    """Create an Airwallex PaymentIntent."""
    token = get_auth_token()
    url = f"{AIRWALLEX_BASE_URL}/api/v1/pa/payment_intents/create"

    payload = {
        "request_id": str(uuid.uuid4()),
        "amount": amount,
        "currency": currency,
        "merchant_order_id": merchant_order_id,
        "descriptor": description,
        "return_url": return_url,
        "metadata": {
            "product": "postir",
            "plan": description,
        },
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body_raw = self.rfile.read(content_length) if content_length > 0 else b'{}'
            body = json.loads(body_raw)
        except Exception as e:
            self._send_json(400, {"error": f"Invalid request: {str(e)}"})
            return

        plan = body.get("plan", "ppu")  # "ppu" or "pro"
        return_url = body.get("return_url", "")

        # Define plans — amounts in SAR
        plans = {
            "ppu": {
                "amount": 10.00,
                "currency": "SAR",
                "description": "Postir - Pay Per Use (10 Posts)",
                "order_prefix": "PPU",
            },
            "pro": {
                "amount": 99.00,
                "currency": "SAR",
                "description": "Postir - Monthly Pro (Unlimited)",
                "order_prefix": "PRO",
            },
        }

        if plan not in plans:
            self._send_json(400, {"error": f"Unknown plan: {plan}. Use 'ppu' or 'pro'."})
            return

        plan_data = plans[plan]
        order_id = f"{plan_data['order_prefix']}-{int(time.time())}-{uuid.uuid4().hex[:6]}"

        try:
            intent = create_payment_intent(
                amount=plan_data["amount"],
                currency=plan_data["currency"],
                description=plan_data["description"],
                merchant_order_id=order_id,
                return_url=return_url or "https://postir.co/#payment-success",
            )

            # Return what the frontend needs for Airwallex JS SDK
            result = {
                "intent_id": intent["id"],
                "client_secret": intent["client_secret"],
                "currency": plan_data["currency"],
                "amount": plan_data["amount"],
                "order_id": order_id,
                "plan": plan,
            }

            self._send_json(200, result)

        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8") if e.fp else ""
            self._send_json(e.code, {"error": f"Payment service error: {error_body}"})

        except Exception as e:
            self._send_json(500, {"error": f"Server error: {str(e)}"})

    def _send_json(self, status_code, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
