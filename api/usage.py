#!/usr/bin/env python3
"""
Postir V2 — Usage Tracking Endpoint
Returns user's current plan, token usage, and generation history.
Vercel serverless function (BaseHTTPRequestHandler format).
No external dependencies — stdlib only.
"""
import json
import os
from http.server import BaseHTTPRequestHandler

from _supabase import (
    verify_token,
    get_user_profile,
    supabase_request,
)


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        # ── Auth check ──────────────────────────────────────────
        token = self._get_bearer_token()
        if not token:
            self._send_json(401, {"error": "Authentication required. Please log in."})
            return

        user = verify_token(token)
        if not user:
            self._send_json(401, {"error": "Invalid or expired token. Please log in again."})
            return

        user_id = user["id"]

        # ── Fetch profile ─────────────────────────────────────
        profile = get_user_profile(user_id)
        if not profile:
            self._send_json(404, {"error": "User profile not found."})
            return

        plan = profile.get("plan", "free")
        tokens_total = profile.get("tokens_total", 3)
        tokens_used = profile.get("tokens_used", 0)
        tokens_remaining = max(0, tokens_total - tokens_used)

        # ── Fetch recent generations ──────────────────────────
        generations = []
        try:
            resp = supabase_request(
                "GET",
                "/rest/v1/generations",
                use_service_key=True,
                params={
                    "user_id": f"eq.{user_id}",
                    "order": "created_at.desc",
                    "limit": "20",
                    "select": "id,type,platform,tokens_consumed,prompt_summary,created_at",
                },
            )
            if isinstance(resp, list):
                generations = resp
        except Exception:
            generations = []  # Non-fatal: usage summary still works

        # ── Fetch recent payments ───────────────────────────
        payments = []
        try:
            resp = supabase_request(
                "GET",
                "/rest/v1/payments",
                use_service_key=True,
                params={
                    "user_id": f"eq.{user_id}",
                    "order": "created_at.desc",
                    "limit": "5",
                    "select": "id,plan,amount_sar,status,created_at",
                },
            )
            if isinstance(resp, list):
                payments = resp
        except Exception:
            payments = []

        self._send_json(200, {
            "plan": plan,
            "tokens_total": tokens_total,
            "tokens_used": tokens_used,
            "tokens_remaining": tokens_remaining,
            "plan_started_at": profile.get("plan_started_at"),
            "plan_expires_at": profile.get("plan_expires_at"),
            "generations": generations,
            "payments": payments,
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
