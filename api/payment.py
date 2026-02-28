#!/usr/bin/env python3
"""
Postir — Airwallex Payment Integration
Creates Payment Intent via Airwallex API for SAR subscriptions.

Deploy on Vercel as a Python serverless function.
"""

import json
import os
import uuid
from http.server import BaseHTTPRequestHandler

try:
    import urllib.request
except ImportError:
    pass


# ---- CONFIG ----
AIRWALLEX_BASE = "https://api.airwallex.com"
AIRWALLEX_DEMO = "https://demo-api.airwallex.com"  # sandbox


def get_airwallex_token() -> str:
    """Authenticate with Airwallex and get bearer token."""
    client_id = os.environ.get("AIRWALLEX_CLIENT_ID", "")
    api_key   = os.environ.get("AIRWALLEX_API_KEY", "")

    if not client_id or not api_key:
        raise ValueError("Missing Airwallex credentials")

    base = AIRWALLEX_DEMO if os.environ.get("AIRWALLEX_SANDBOX") else AIRWALLEX_BASE
    url  = f"{base}/api/v1/authentication/login"

    req = urllib.request.Request(
        url,
        headers={
            "x-client-id":  client_id,
            "x-api-key":    api_key,
            "Content-Type": "application/json",
        },
        method="POST",
        data=b"{}",
    )

    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())
        return data["token"]


def create_payment_intent(payload: dict) -> dict:
    """Create a Payment Intent and return the checkout URL."""
    token    = get_airwallex_token()
    plan     = payload.get("plan", "pro")
    price    = float(payload.get("price", 49))
    email    = payload.get("email", "")
    name     = payload.get("name", "")
    currency = payload.get("currency", "SAR")

    base     = AIRWALLEX_DEMO if os.environ.get("AIRWALLEX_SANDBOX") else AIRWALLEX_BASE
    url      = f"{base}/api/v1/pa/payment_intents/create"

    intent_body = json.dumps({
        "request_id":       str(uuid.uuid4()),
        "amount":           price,
        "currency":         currency,
        "merchant_order_id": f"postir-{plan}-{uuid.uuid4().hex[:8]}",
        "descriptor":       f"Postir {plan.capitalize()} Plan",
        "metadata": {
            "plan":  plan,
            "email": email,
            "name":  name,
        },
        "return_url": os.environ.get("RETURN_URL", "https://postir.vercel.app/?payment=success"),
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type":  "application/json",
        },
        method="POST",
        data=intent_body,
    )

    with urllib.request.urlopen(req, timeout=10) as resp:
        intent = json.loads(resp.read())

    # Build hosted checkout URL
    intent_id     = intent["id"]
    client_secret = intent["client_secret"]
    checkout_url  = (
        f"https://checkout.airwallex.com/?intent_id={intent_id}"
        f"&client_secret={client_secret}"
        f"&currency={currency}"
    )

    return {"checkout_url": checkout_url, "intent_id": intent_id}


# ---- MOCK (when no API keys) ----
def mock_payment(payload: dict) -> dict:
    """Simulate successful payment for dev/demo."""
    return {"success": True, "message": "Demo mode — no real charge"}


# ---- VERCEL HANDLER ----
class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body   = self.rfile.read(length)
            payload = json.loads(body)
        except Exception:
            self._error(400, "Invalid request body")
            return

        # Validate
        if not payload.get("email") or not payload.get("name"):
            self._error(400, "email and name are required")
            return

        try:
            result = create_payment_intent(payload)
            self._json(200, result)
        except ValueError:
            # No API keys — use mock
            result = mock_payment(payload)
            self._json(200, result)
        except Exception as e:
            print(f"Payment error: {e}")
            self._error(500, f"Payment processing failed: {str(e)}")

    def _cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, code: int, data: dict):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self._cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _error(self, code: int, msg: str):
        self._json(code, {"error": msg})
