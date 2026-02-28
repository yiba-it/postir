#!/usr/bin/env python3
"""
Postir V2 — AI Image Generation Endpoint
Uses Gemini 2.0 Flash (experimental) to generate social media images.
Vercel serverless function. Supabase helpers inlined.
"""
import json
import os
import urllib.request
import urllib.error
import base64
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlencode


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


def _check_tokens(user_id, required=1):
    profile = _get_user_profile(user_id)
    if not profile:
        return False, None
    if profile.get("plan") == "pro":
        return True, profile
    if (profile.get("tokens_total", 0) - profile.get("tokens_used", 0)) >= required:
        return True, profile
    return False, profile


def _update_user_tokens(user_id, increment):
    profile = _get_user_profile(user_id)
    if not profile:
        return False
    new_used = profile.get("tokens_used", 0) + increment
    resp = _sb_request("PATCH", "/rest/v1/profiles",
                       data={"tokens_used": new_used, "updated_at": "now()"},
                       use_service_key=True, params={"id": f"eq.{user_id}"})
    return not (resp and resp.get("_error"))


def _log_generation(user_id, gen_type, platform=None, prompt_summary=None, tokens_consumed=1):
    data = {"user_id": user_id, "type": gen_type, "tokens_consumed": tokens_consumed}
    if platform:
        data["platform"] = platform
    if prompt_summary:
        data["prompt_summary"] = prompt_summary
    resp = _sb_request("POST", "/rest/v1/generations", data=data, use_service_key=True)
    return not (resp and resp.get("_error"))


# ===== CONFIG =====
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_IMAGE_MODEL = "gemini-2.0-flash-exp"
GEMINI_IMAGE_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_IMAGE_MODEL}:generateContent"
TOKENS_PER_IMAGE = 1

PLATFORM_SPECS = {
    "instagram": {"aspect": "square (1:1, 1080x1080px)", "style": "vibrant, lifestyle-focused"},
    "instagram_story": {"aspect": "portrait (9:16, 1080x1920px)", "style": "bold, full-bleed visual"},
    "x": {"aspect": "landscape (16:9, 1200x675px)", "style": "clean, minimal, high contrast"},
    "linkedin": {"aspect": "landscape (1.91:1, 1200x627px)", "style": "professional, corporate"},
    "snapchat": {"aspect": "portrait (9:16, 1080x1920px)", "style": "playful, colorful, casual"},
    "tiktok": {"aspect": "portrait (9:16, 1080x1920px)", "style": "trendy, dynamic, eye-catching"},
    "facebook": {"aspect": "landscape (16:9, 1200x630px)", "style": "engaging, clear message"},
}


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_POST(self):
        token = self._get_bearer_token()
        if not token:
            self._send_json(401, {"error": "Authentication required. Please log in."})
            return
        user = _verify_token(token)
        if not user:
            self._send_json(401, {"error": "Invalid or expired token. Please log in again."})
            return

        user_id = user["id"]
        has_tokens, profile = _check_tokens(user_id, required=TOKENS_PER_IMAGE)
        if not has_tokens:
            self._send_json(402, {
                "error": "Insufficient tokens for image generation. Upgrade your plan.",
                "upgrade_required": True,
            })
            return

        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body_raw = self.rfile.read(content_length) if content_length > 0 else b'{}'
            body = json.loads(body_raw)
        except Exception as e:
            self._send_json(400, {"error": f"Invalid request: {str(e)}"})
            return

        prompt = body.get("prompt", "").strip()
        platform = body.get("platform", "instagram").lower()
        style_override = body.get("style", "").strip()
        business_name = body.get("business_name", "").strip()
        language = body.get("language", "ar")

        if not prompt:
            self._send_json(400, {"error": "prompt is required"})
            return
        if not GEMINI_API_KEY:
            self._send_json(500, {"error": "Gemini API key not configured"})
            return

        try:
            image_data, alt_text = generate_image_with_gemini(prompt, platform, business_name, style_override, language)
        except Exception as e:
            self._send_json(500, {"error": f"Image generation failed: {str(e)}"})
            return

        if not image_data:
            self._send_json(500, {"error": "No image returned from Gemini."})
            return

        _update_user_tokens(user_id, TOKENS_PER_IMAGE)
        _log_generation(user_id, "image", platform, prompt[:200], tokens_consumed=TOKENS_PER_IMAGE)

        tokens_remaining = max(0, (profile.get("tokens_total", 3) - profile.get("tokens_used", 0)) - TOKENS_PER_IMAGE)
        self._send_json(200, {
            "image_data": image_data, "mime_type": "image/png", "alt_text": alt_text,
            "platform": platform, "tokens_remaining": tokens_remaining,
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


def generate_image_with_gemini(prompt, platform, business_name="", style_override="", language="ar"):
    spec = PLATFORM_SPECS.get(platform, PLATFORM_SPECS["instagram"])
    business_context = f" for {business_name}" if business_name else ""
    style = style_override if style_override else spec["style"]

    full_prompt = (
        f"Create a professional social media image{business_context}. "
        f"Description: {prompt}. Style: {style}. Format: {spec['aspect']}. "
        f"High-quality, visually striking, suitable for Saudi Arabian market. "
        f"Modern, clean design. No text overlays unless specifically requested. "
        f"Warm and premium colors. Culturally appropriate for Saudi/Gulf audience."
    )

    request_body = {
        "contents": [{"parts": [{"text": full_prompt}]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    }

    url = f"{GEMINI_IMAGE_URL}?key={GEMINI_API_KEY}"
    req = urllib.request.Request(url, data=json.dumps(request_body).encode("utf-8"),
                                headers={"Content-Type": "application/json"}, method="POST")

    with urllib.request.urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    image_b64 = None
    alt_text = ""
    candidates = result.get("candidates", [])
    if not candidates:
        raise ValueError("No candidates in Gemini response")

    parts = candidates[0].get("content", {}).get("parts", [])
    for part in parts:
        inline = part.get("inlineData") or part.get("inline_data")
        if inline:
            image_b64 = inline.get("data")
        if part.get("text"):
            alt_text = part["text"].strip()

    if not alt_text:
        alt_text = f"AI-generated social media image for {platform}: {prompt[:100]}"
    return image_b64, alt_text
