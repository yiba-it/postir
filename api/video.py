#!/usr/bin/env python3
"""
Postir V2 — Video Reel Data Endpoint
Generates script + fetches Pexels video clips for social media reels.
Vercel serverless function. Supabase helpers inlined.
"""
import json
import os
import urllib.request
import urllib.error
from urllib.parse import quote, urlencode
from http.server import BaseHTTPRequestHandler


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
PEXELS_API_KEY = os.environ.get("PEXELS_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
PEXELS_VIDEO_API = "https://api.pexels.com/videos/search"
TOKENS_PER_VIDEO = 3


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
        has_tokens, profile = _check_tokens(user_id, required=TOKENS_PER_VIDEO)
        if not has_tokens:
            self._send_json(402, {
                "error": f"Video reel requires {TOKENS_PER_VIDEO} tokens. Upgrade your plan.",
                "tokens_required": TOKENS_PER_VIDEO, "upgrade_required": True,
            })
            return

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

        try:
            slides = generate_video_script(business_name, business_type, target_audience, platform, tone, language)
        except Exception as e:
            self._send_json(500, {"error": f"Script generation failed: {str(e)}"})
            return

        slides_with_video = []
        for slide in slides:
            keyword = slide.get("visual_keyword", business_type)
            video_url = None
            if PEXELS_API_KEY:
                try:
                    video_url = fetch_pexels_video(keyword)
                except Exception:
                    video_url = None
            slide["video_url"] = video_url
            slides_with_video.append(slide)

        _update_user_tokens(user_id, TOKENS_PER_VIDEO)
        prompt_summary = f"{business_name} | {business_type} | {platform} reel"
        _log_generation(user_id, "video", platform, prompt_summary, tokens_consumed=TOKENS_PER_VIDEO)

        total_duration = sum(s.get("duration_seconds", 3) for s in slides_with_video)
        tokens_remaining = max(0, (profile.get("tokens_total", 3) - profile.get("tokens_used", 0)) - TOKENS_PER_VIDEO)

        self._send_json(200, {
            "slides": slides_with_video, "total_duration": total_duration,
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


# ══════════════════════════════════════════════════════════════════════
#  Gemini Script Generation
# ══════════════════════════════════════════════════════════════════════

def generate_video_script(name, btype, audience, platform, tone, language):
    tone_map = {
        "professional": ("احترافي", "professional"), "friendly": ("ودّي", "friendly"),
        "formal": ("رسمي", "formal"), "inspirational": ("ملهم", "inspirational"),
        "playful": ("مرح", "playful"),
    }
    btype_map = {
        "restaurant": "restaurant/food", "online_store": "e-commerce/retail",
        "real_estate": "real estate/property", "beauty": "beauty/skincare",
        "fashion": "fashion/clothing", "technology": "technology/software",
        "education": "education/training", "health": "health/wellness",
        "tourism": "tourism/travel", "general": "business/services",
    }
    tone_ar, tone_en = tone_map.get(tone, ("ودّي", "friendly"))
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
- First slide is a hook (grabs attention instantly)
- Last slide has a clear call-to-action
- Reference Saudi culture where appropriate
- visual_keyword: 1-2 English words for Pexels stock video search
- {lang_note}
- duration_seconds: 2, 3, or 4

Return ONLY valid JSON array:
[{{"slide": 1, "text_ar": "...", "text_en": "...", "visual_keyword": "...", "duration_seconds": 3}}]"""

    request_body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.85, "topP": 0.9, "maxOutputTokens": 2048, "responseMimeType": "application/json"},
    }

    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    req = urllib.request.Request(url, data=json.dumps(request_body).encode("utf-8"),
                                headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=45) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:]) if len(lines) > 1 else text[3:]
    if text.endswith("```"):
        text = text[:-3].strip()

    slides = json.loads(text)
    if isinstance(slides, dict):
        slides = slides.get("slides", list(slides.values())[0])

    cleaned = []
    for i, slide in enumerate(slides):
        cleaned.append({
            "slide": slide.get("slide", i + 1),
            "text_ar": slide.get("text_ar", ""),
            "text_en": slide.get("text_en", ""),
            "visual_keyword": slide.get("visual_keyword", btype_label.split("/")[0]),
            "duration_seconds": int(slide.get("duration_seconds", 3)),
            "video_url": None,
        })
    return cleaned


def fetch_pexels_video(keyword):
    if not PEXELS_API_KEY:
        return None
    encoded_query = quote(keyword)
    url = f"{PEXELS_VIDEO_API}?query={encoded_query}&orientation=portrait&per_page=3&size=small"
    req = urllib.request.Request(url, headers={"Authorization": PEXELS_API_KEY}, method="GET")
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    videos = data.get("videos", [])
    if not videos:
        return None
    for video in videos:
        video_files = video.get("video_files", [])
        for vf in sorted(video_files, key=lambda x: x.get("width", 0)):
            link = vf.get("link")
            if link and "video/mp4" in vf.get("file_type", ""):
                return link
        if video_files and video_files[0].get("link"):
            return video_files[0]["link"]
    return None
