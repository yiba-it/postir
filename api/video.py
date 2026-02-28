#!/usr/bin/env python3
"""
Postir V2 — Video Reel Data Endpoint
Generates script + fetches Pexels video clips for social media reels.
The frontend handles actual video assembly using Canvas + MediaRecorder.
Vercel serverless function (BaseHTTPRequestHandler format).
No external dependencies — stdlib only.
"""
import json
import os
import urllib.request
import urllib.error
from urllib.parse import quote
from http.server import BaseHTTPRequestHandler

from _supabase import (
    verify_token,
    check_tokens,
    update_user_tokens,
    log_generation,
)

# ===== CONFIG =====
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
PEXELS_API_KEY = os.environ.get("PEXELS_API_KEY", "")

GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_API_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)
PEXELS_VIDEO_API = "https://api.pexels.com/videos/search"

# Tokens consumed per video reel
TOKENS_PER_VIDEO = 3


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
        has_tokens, profile = check_tokens(user_id, required=TOKENS_PER_VIDEO)
        if not has_tokens:
            plan = profile.get("plan", "free") if profile else "free"
            self._send_json(402, {
                "error": f"Video reel generation requires {TOKENS_PER_VIDEO} tokens. Upgrade your plan to continue.",
                "plan": plan,
                "tokens_used": profile.get("tokens_used", 0) if profile else 0,
                "tokens_total": profile.get("tokens_total", 0) if profile else 0,
                "tokens_required": TOKENS_PER_VIDEO,
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

        business_name = body.get("business_name", "").strip() or "My Business"
        business_type = body.get("business_type", "general")
        target_audience = body.get("target_audience", "").strip()
        platform = body.get("platform", "instagram").lower()
        tone = body.get("tone", "friendly")
        language = body.get("language", "both")

        if not GEMINI_API_KEY:
            self._send_json(500, {"error": "Gemini API key not configured"})
            return

        # ── Step 1: Generate video script via Gemini ────────────
        try:
            slides = generate_video_script(
                business_name, business_type, target_audience,
                platform, tone, language
            )
        except Exception as e:
            self._send_json(500, {"error": f"Script generation failed: {str(e)}"})
            return

        # ── Step 2: Fetch Pexels videos for each slide ──────────
        slides_with_video = []
        for slide in slides:
            keyword = slide.get("visual_keyword", business_type)
            video_url = None

            if PEXELS_API_KEY:
                try:
                    video_url = fetch_pexels_video(keyword)
                except Exception:
                    video_url = None  # graceful degradation

            slide["video_url"] = video_url
            slides_with_video.append(slide)

        # ── Step 3: Deduct tokens ────────────────────────────
        update_user_tokens(user_id, TOKENS_PER_VIDEO)

        # ── Step 4: Log generation ──────────────────────────
        prompt_summary = f"{business_name} | {business_type} | {platform} reel"
        log_generation(user_id, "video", platform, prompt_summary, tokens_consumed=TOKENS_PER_VIDEO)

        # Compute total duration
        total_duration = sum(s.get("duration_seconds", 3) for s in slides_with_video)

        tokens_remaining = max(
            0,
            (profile.get("tokens_total", 3) - profile.get("tokens_used", 0)) - TOKENS_PER_VIDEO
        )

        self._send_json(200, {
            "slides": slides_with_video,
            "total_duration": total_duration,
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
#  Gemini Script Generation
# ══════════════════════════════════════════════════════════════════════

def generate_video_script(name, btype, audience, platform, tone, language):
    """
    Generate a reel script as a JSON array of slide objects using Gemini.
    Each slide has: text_ar, text_en, visual_keyword, duration_seconds.
    """
    tone_map = {
        "professional": ("احترافي", "professional"),
        "friendly": ("ودّي", "friendly"),
        "formal": ("رسمي", "formal"),
        "inspirational": ("ملهم", "inspirational"),
        "playful": ("مرح", "playful"),
    }
    tone_ar, tone_en = tone_map.get(tone, ("ودّي", "friendly"))

    btype_map = {
        "restaurant": "restaurant/food",
        "online_store": "e-commerce/retail",
        "real_estate": "real estate/property",
        "beauty": "beauty/skincare",
        "fashion": "fashion/clothing",
        "technology": "technology/software",
        "education": "education/training",
        "health": "health/wellness",
        "tourism": "tourism/travel",
        "general": "business/services",
    }
    btype_label = btype_map.get(btype, "business")

    lang_note = {
        "both": "provide BOTH text_ar (Gulf/Saudi Arabic dialect) and text_en (English)",
        "ar": "provide text_ar (Gulf/Saudi Arabic dialect) only, set text_en to empty string",
        "en": "provide text_en (English) only, set text_ar to empty string",
    }.get(language, "provide both Arabic and English")

    prompt = f"""Create a short video reel script for social media ({platform}) for this business:

Business: {name}
Type: {btype_label}
Target Audience: {audience or 'Saudi/Gulf consumers'}
Tone: {tone_ar} / {tone_en}

Generate 6-8 caption slides for a 15-30 second vertical video reel.
Each slide should be displayed for 2-4 seconds.

Requirements:
- Short, punchy text (max 8 words per slide in Arabic, 10 in English)
- The first slide is a hook (grabs attention instantly)
- Last slide has a clear call-to-action
- Reference Saudi culture where appropriate
- visual_keyword: 1-2 English words for Pexels stock video search (e.g., "coffee shop", "fashion model", "city skyline", "team work")
- {lang_note}
- duration_seconds: 2, 3, or 4

Return ONLY valid JSON array:
[
  {{
    "slide": 1,
    "text_ar": "...",
    "text_en": "...",
    "visual_keyword": "...",
    "duration_seconds": 3
  }}
]"""

    request_body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.85,
            "topP": 0.9,
            "maxOutputTokens": 2048,
            "responseMimeType": "application/json",
        },
    }

    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    req = urllib.request.Request(
        url,
        data=json.dumps(request_body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=45) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    text = result["candidates"][0]["content"]["parts"][0]["text"].strip()

    # Clean markdown code blocks if present
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:]) if len(lines) > 1 else text[3:]
    if text.endswith("```"):
        text = text[:-3].strip()

    slides = json.loads(text)
    if isinstance(slides, dict):
        # Sometimes model wraps in {"slides": [...]}
        slides = slides.get("slides", list(slides.values())[0])

    # Validate and sanitize
    cleaned = []
    for i, slide in enumerate(slides):
        cleaned.append({
            "slide": slide.get("slide", i + 1),
            "text_ar": slide.get("text_ar", ""),
            "text_en": slide.get("text_en", ""),
            "visual_keyword": slide.get("visual_keyword", btype_label.split("/")[0]),
            "duration_seconds": int(slide.get("duration_seconds", 3)),
            "video_url": None,  # will be filled by Pexels step
        })

    return cleaned


# ══════════════════════════════════════════════════════════════════════
#  Pexels Video Fetching
# ══════════════════════════════════════════════════════════════════════

def fetch_pexels_video(keyword):
    """
    Search Pexels for a vertical video clip matching the keyword.
    Returns video URL string, or None if not found.
    """
    if not PEXELS_API_KEY:
        return None

    encoded_query = quote(keyword)
    url = f"{PEXELS_VIDEO_API}?query={encoded_query}&orientation=portrait&per_page=3&size=small"

    req = urllib.request.Request(
        url,
        headers={"Authorization": PEXELS_API_KEY},
        method="GET",
    )

    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    videos = data.get("videos", [])
    if not videos:
        return None

    # Pick the first video with a usable link
    for video in videos:
        video_files = video.get("video_files", [])
        # Prefer SD quality for faster loading
        for vf in sorted(video_files, key=lambda x: x.get("width", 0)):
            link = vf.get("link")
            file_type = vf.get("file_type", "")
            if link and "video/mp4" in file_type:
                return link
        # Fallback: take first available link
        if video_files and video_files[0].get("link"):
            return video_files[0]["link"]

    return None
