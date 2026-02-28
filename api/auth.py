#!/usr/bin/env python3
"""
Postir V2 — Authentication endpoints
Handles user signup, login, logout, token refresh, and profile retrieval.
Vercel serverless function (BaseHTTPRequestHandler format).
No external dependencies — stdlib only + internal _supabase module.
"""
import json
import os
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Import shared Supabase helpers
from _supabase import (
    get_supabase_config,
    supabase_request,
    verify_token,
    get_user_profile,
    create_profile,
)


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        # Strip leading /api/auth
        sub = parsed.path.replace("/api/auth", "").strip("/")

        if sub == "me":
            self._handle_me()
        else:
            self._send_json(404, {"error": "Not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        # Strip leading /api/auth
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

    # ─────────────────────────── Handlers ────────────────────────────────

    def _handle_signup(self, body):
        """POST /api/auth/signup — Register a new user."""
        email = body.get("email", "").strip()
        password = body.get("password", "")

        if not email or not password:
            self._send_json(400, {"error": "email and password are required"})
            return

        if len(password) < 6:
            self._send_json(400, {"error": "Password must be at least 6 characters"})
            return

        # Call Supabase Auth signup
        resp = supabase_request(
            "POST",
            "/auth/v1/signup",
            data={"email": email, "password": password},
        )

        if resp and resp.get("_error"):
            status = resp.get("_status", 400)
            err_body = resp.get("_body", {})
            if isinstance(err_body, dict):
                msg = err_body.get("msg") or err_body.get("message") or str(err_body)
            else:
                msg = str(err_body)
            self._send_json(status, {"error": msg})
            return

        # Extract user and session
        user = resp.get("user") or resp  # Supabase returns user directly or nested
        session = resp.get("session", {})
        access_token = session.get("access_token") if session else resp.get("access_token")
        refresh_token = session.get("refresh_token") if session else resp.get("refresh_token")
        user_id = user.get("id") if isinstance(user, dict) else resp.get("id")
        user_email = user.get("email") if isinstance(user, dict) else email

        # Create profile row (also handled by DB trigger, but do it here as fallback)
        if user_id:
            create_profile(user_id, user_email)

        self._send_json(200, {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user_id,
                "email": user_email,
            },
            "message": "Registration successful. Please check your email to confirm your account."
        })

    def _handle_login(self, body):
        """POST /api/auth/login — Authenticate user with email/password."""
        email = body.get("email", "").strip()
        password = body.get("password", "")

        if not email or not password:
            self._send_json(400, {"error": "email and password are required"})
            return

        resp = supabase_request(
            "POST",
            "/auth/v1/token",
            data={"email": email, "password": password},
            params={"grant_type": "password"},
        )

        if resp and resp.get("_error"):
            status = resp.get("_status", 401)
            err_body = resp.get("_body", {})
            if isinstance(err_body, dict):
                msg = err_body.get("error_description") or err_body.get("msg") or err_body.get("message") or "Invalid credentials"
            else:
                msg = "Invalid credentials"
            self._send_json(status, {"error": msg})
            return

        access_token = resp.get("access_token")
        refresh_token = resp.get("refresh_token")
        user = resp.get("user", {})

        self._send_json(200, {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.get("id"),
                "email": user.get("email"),
            },
        })

    def _handle_me(self):
        """GET /api/auth/me — Get current user profile."""
        token = self._get_bearer_token()
        if not token:
            self._send_json(401, {"error": "Authorization header required"})
            return

        user = verify_token(token)
        if not user:
            self._send_json(401, {"error": "Invalid or expired token"})
            return

        user_id = user.get("id")
        profile = get_user_profile(user_id)

        if not profile:
            # Create profile if it doesn't exist
            from _supabase import create_profile
            create_profile(user_id, user.get("email", ""))
            profile = {
                "id": user_id,
                "email": user.get("email", ""),
                "plan": "free",
                "tokens_total": 3,
                "tokens_used": 0,
            }

        self._send_json(200, {
            "id": user_id,
            "email": user.get("email"),
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
        """POST /api/auth/logout — Invalidate current session."""
        token = self._get_bearer_token()
        if not token:
            self._send_json(400, {"error": "Authorization header required"})
            return

        supabase_request(
            "POST",
            "/auth/v1/logout",
            token=token,
        )

        self._send_json(200, {"message": "Logged out successfully"})

    def _handle_refresh(self, body):
        """POST /api/auth/refresh — Exchange refresh token for new access token."""
        refresh_token = body.get("refresh_token", "").strip()

        if not refresh_token:
            self._send_json(400, {"error": "refresh_token is required"})
            return

        resp = supabase_request(
            "POST",
            "/auth/v1/token",
            data={"refresh_token": refresh_token},
            params={"grant_type": "refresh_token"},
        )

        if resp and resp.get("_error"):
            status = resp.get("_status", 401)
            self._send_json(status, {"error": "Token refresh failed. Please log in again."})
            return

        self._send_json(200, {
            "access_token": resp.get("access_token"),
            "refresh_token": resp.get("refresh_token"),
            "user": {
                "id": resp.get("user", {}).get("id"),
                "email": resp.get("user", {}).get("email"),
            },
        })

    # ─────────────────────────── Helpers ─────────────────────────────────

    def _get_bearer_token(self):
        """Extract Bearer token from Authorization header."""
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
