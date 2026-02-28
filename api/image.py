#!/usr/bin/env python3
"""
Postir V2 — AI Image Generation Endpoint
Uses Gemini 2.0 Flash (experimental) to generate social media images.
Vercel serverless function (BaseHTTPRequestHandler format).
No external dependencies — stdlib only.
"""
import json
import os
import urllib.request
import urllib.error
import base64
from http.server import BaseHTTPRequestHandler

from _supabase import (
    verify_token,
    check_tokens,
    update_user_tokens,
    log_generation,
)

# ===== CONFIG =====
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# Gemini model that supports image generation via responseModalities
GEMINI_IMAGE_MODEL = "gemini-2.0-flash-exp"
GEMINI_IMAGE_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_IMAGE_MODEL}:generateContent"
)

# Tokens consumed per image generation
TOKENS_PER_IMAGE = 1

# Platform-specific image specs
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

        # ── Token check ─────────────────────────────────────────
        has_tokens, profile = check_tokens(user_id, required=TOKENS_PER_IMAGE)
        if not has_tokens:
            plan = profile.get("plan", "free") if profile else "free"
            self._send_json(402, {
                "error": "Insufficient tokens for image generation. Upgrade your plan to continue.",
                "plan": plan,
                "tokens_used": profile.get("tokens_used", 0) if profile else 0,
                "tokens_total": profile.get("tokens_total", 0) if profile else 0,
                "upgrade_required": True,
            })
            return

        # ── Parse request body ──────────────────────────────────
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

        # ── Generate image ──────────────────────────────────────
        try:
            image_data, alt_text = generate_image_with_gemini(
                prompt, platform, business_name, style_override, language
            )
        except Exception as e:
            self._send_json(500, {"error": f"Image generation failed: {str(e)}"})
            return

        if not image_data:
            self._send_json(500, {"error": "No image returned from Gemini. The model may not have generated an image for this prompt."})
            return

        # ── Deduct tokens ────────────────────────────────────────
        update_user_tokens(user_id, TOKENS_PER_IMAGE)

        # ── Log generation ──────────────────────────────────────
        log_generation(
            user_id,
            "image",
            platform,
            prompt[:200],
            tokens_consumed=TOKENS_PER_IMAGE,
        )

        tokens_remaining = max(
            0,
            (profile.get("tokens_total", 3) - profile.get("tokens_used", 0)) - TOKENS_PER_IMAGE
        )

        self._send_json(200, {
            "image_data": image_data,          # base64-encoded PNG/JPEG
            "mime_type": "image/png",
            "alt_text": alt_text,
            "platform": platform,
            "tokens_remaining": tokens_remaining,
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


# ══════════════════════════════════════════════════════════════════════
#  Gemini Image Generation
# ══════════════════════════════════════════════════════════════════════

def generate_image_with_gemini(prompt, platform, business_name="", style_override="", language="ar"):
    """
    Generate an image using Gemini 2.0 Flash (experimental) with IMAGE responseModality.
    Returns (base64_image_data, alt_text).
    """
    spec = PLATFORM_SPECS.get(platform, PLATFORM_SPECS["instagram"])

    # Build a rich, detailed prompt for better image quality
    business_context = f" for {business_name}" if business_name else ""
    style = style_override if style_override else spec["style"]

    full_prompt = (
        f"Create a professional social media image{business_context}. "
        f"Description: {prompt}. "
        f"Style: {style}. "
        f"Format: {spec['aspect']}. "
        f"The image should be high-quality, visually striking, and suitable for Saudi Arabian market. "
        f"Modern, clean design. No text overlays unless the prompt specifically requests text. "
        f"Colors should feel warm and premium. Cultural sensitivity: appropriate for Saudi/Gulf audience."
    )

    request_body = {
        "contents": [
            {
                "parts": [{"text": full_prompt}]
            }
        ],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
        },
    }

    url = f"{GEMINI_IMAGE_URL}?key={GEMINI_API_KEY}"
    req = urllib.request.Request(
        url,
        data=json.dumps(request_body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    # Extract image data from response
    image_b64 = None
    alt_text = ""

    candidates = result.get("candidates", [])
    if not candidates:
        raise ValueError("No candidates in Gemini response")

    parts = candidates[0].get("content", {}).get("parts", [])
    for part in parts:
        # Image part has inline_data with base64
        inline = part.get("inlineData") or part.get("inline_data")
        if inline:
            image_b64 = inline.get("data")
        # Text part may contain a description
        if part.get("text"):
            alt_text = part["text"].strip()

    if not alt_text:
        alt_text = f"AI-generated social media image for {platform}: {prompt[:100]}"

    return image_b64, alt_text
