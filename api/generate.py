#!/usr/bin/env python3
"""
Postir — AI Social Media Content Generator Backend
Uses Google Gemini API to generate social media posts.
Falls back to templates if API fails.
Vercel serverless function (BaseHTTPRequestHandler format).
"""
import json
import os
import random
import urllib.request
import urllib.error
import hashlib
import time
from http.server import BaseHTTPRequestHandler

# ===== CONFIG =====
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        # Stats endpoint — returns static data (stateless serverless)
        result = {"total_generations": 0, "today": 0}
        body = json.dumps(result).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
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
        platforms = body.get("platforms", ["instagram"])
        tone = body.get("tone", "friendly")
        language = body.get("language", "both")
        num_posts = min(max(int(body.get("num_posts", 7)), 1), 30)
        mode = body.get("mode", "demo")

        # DEMO MODE
        if mode == "demo":
            posts = get_demo_posts(business_name, language, platforms)
            self._send_json(200, {"posts": posts, "mode": "demo"})
            return

        # AI MODE — try Gemini, fallback to templates
        used_mode = "ai"
        try:
            posts = generate_with_gemini(
                business_name, business_type, target_audience,
                platforms, tone, language, num_posts
            )
        except Exception:
            posts = generate_with_templates(
                business_name, business_type, platforms, tone, language, num_posts
            )
            used_mode = "template"

        self._send_json(200, {"posts": posts, "mode": used_mode})

    def _send_json(self, status_code, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def generate_with_gemini(name, btype, audience, platforms, tone, language, num_posts):
    """Generate posts using Google Gemini API."""

    tone_map = {
        "professional": ("احترافي ومصقول", "professional and polished"),
        "friendly": ("ودّي وقريب", "warm and approachable"),
        "formal": ("رسمي", "formal and corporate"),
        "inspirational": ("ملهم وتحفيزي", "inspirational and motivational"),
        "playful": ("مرح وخفيف", "fun and lighthearted")
    }

    btype_map = {
        "restaurant": "مطعم / Restaurant",
        "online_store": "متجر إلكتروني / Online Store",
        "real_estate": "عقارات / Real Estate",
        "beauty": "تجميل / Beauty & Skincare",
        "fashion": "أزياء / Fashion",
        "technology": "تقنية / Technology",
        "education": "تعليم / Education",
        "health": "صحة / Health",
        "tourism": "سياحة / Tourism",
        "general": "عام / General Business"
    }

    tone_ar, tone_en = tone_map.get(tone, ("ودّي", "friendly"))
    btype_label = btype_map.get(btype, btype)
    platform_str = ", ".join(platforms)

    lang_instruction = {
        "both": 'For EACH post provide BOTH "text_ar" (Gulf Saudi dialect, NOT formal MSA) and "text_en" (professional English). Also provide "hashtags_ar" and "hashtags_en".',
        "ar": 'Write all posts in Arabic ONLY using Gulf/Saudi dialect. Provide "text_ar" and "hashtags_ar" only. Do NOT include English fields.',
        "en": 'Write all posts in English ONLY. Provide "text_en" and "hashtags_en" only. Do NOT include Arabic fields.'
    }.get(language, 'Provide both Arabic and English.')

    prompt = f"""You are an expert Saudi social media content strategist. Generate exactly {num_posts} social media posts.

BUSINESS: {name}
TYPE: {btype_label}
AUDIENCE: {audience or 'General Saudi audience'}
PLATFORMS: {platform_str}
TONE: {tone_ar} / {tone_en}

{lang_instruction}

RULES:
- Each post MUST be unique, creative, and engaging
- 3-5 relevant hashtags per post — use Saudi-specific tags (#السعودية #الرياض #جدة #رؤية_2030 etc.)
- Mix content types: promotional, educational, behind-the-scenes, testimonial-style, engagement questions, seasonal content
- Platform-appropriate: short for X/Twitter (< 280 chars), descriptive for Instagram, professional for LinkedIn, casual for Snapchat/TikTok
- Reference Saudi culture: Ramadan, Eid, National Day, Founding Day, Riyadh Season, coffee culture
- NO emojis — clean text only
- Distribute posts evenly across platforms
- Arabic MUST be Gulf/Saudi dialect — natural and conversational, NOT formal MSA

Return ONLY valid JSON:
{{"posts":[{{"day":1,"platform":"instagram","text_ar":"...","text_en":"...","hashtags_ar":["#..."],"hashtags_en":["#..."]}}]}}

Generate exactly {num_posts} posts, days 1 through {num_posts}."""

    request_body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.95,
            "topP": 0.95,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json"
        }
    }

    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    req = urllib.request.Request(
        url,
        data=json.dumps(request_body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=55) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    text = result["candidates"][0]["content"]["parts"][0]["text"]
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    parsed = json.loads(text)
    posts = parsed.get("posts", parsed) if isinstance(parsed, dict) else parsed
    return posts


def get_demo_posts(name, language, platforms):
    """Hardcoded demo posts."""
    name = name or "نشاطك التجاري"
    p1 = platforms[0] if platforms else "instagram"
    p2 = platforms[1] if len(platforms) > 1 else p1
    p3 = platforms[2] if len(platforms) > 2 else p1

    posts = [
        {
            "day": 1, "platform": p1,
            "text_ar": f"في {name}، نؤمن بأن التميز مو مجرد كلام — هو أسلوب حياة. كل يوم نسعى نقدم لكم الأفضل لأنكم تستاهلون. جربونا وشوفوا الفرق بأنفسكم.",
            "text_en": f"At {name}, we believe excellence isn't just a word — it's how we operate. Every day we push to bring you the best, because you deserve nothing less. Come see the difference for yourself.",
            "hashtags_ar": ["#السعودية", "#تميز", "#جودة", "#الرياض", "#رؤية_2030"],
            "hashtags_en": ["#SaudiArabia", "#Excellence", "#Quality", "#Riyadh", "#Vision2030"]
        },
        {
            "day": 2, "platform": p2,
            "text_ar": f"عملاؤنا الكرام هم سر نجاحنا. شكراً لثقتكم في {name} — نعدكم إننا دايماً نطور ونتحسن عشان نكون عند حسن ظنكم.",
            "text_en": f"Our valued customers are the secret to our success. Thank you for trusting {name} — we promise to continuously improve and exceed your expectations.",
            "hashtags_ar": ["#عملاء", "#ثقة", "#نجاح", "#الرياض", "#خدمات"],
            "hashtags_en": ["#CustomerFirst", "#Trust", "#Success", "#Riyadh", "#Services"]
        },
        {
            "day": 3, "platform": p3,
            "text_ar": f"تبي جودة واحترافية؟ {name} وجهتك الأولى. تعال واكتشف ليش عملاؤنا يرجعون لنا كل مرة.",
            "text_en": f"Looking for quality and professionalism? {name} is your go-to. Come discover why our clients always come back.",
            "hashtags_ar": ["#جودة", "#احترافية", "#السعودية", "#تسوق", "#اعمال"],
            "hashtags_en": ["#Quality", "#Professional", "#SaudiArabia", "#Business", "#Growth"]
        }
    ]

    if language == "ar":
        for p in posts:
            p.pop("text_en", None)
            p.pop("hashtags_en", None)
    elif language == "en":
        for p in posts:
            p.pop("text_ar", None)
            p.pop("hashtags_ar", None)

    return posts


def generate_with_templates(name, btype, platforms, tone, language, num_posts):
    """Fallback when Gemini API is unavailable."""
    ar_templates = [
        "في {name}، نؤمن بأن التميز ليس خياراً بل أسلوب حياة. نقدم لكم أفضل الخدمات والمنتجات في مجالنا.",
        "اكتشفوا الفرق مع {name}. جودة عالية وخدمة احترافية تليق بكم وبتطلعاتكم.",
        "لأنكم تستاهلون الأفضل — {name} هنا عشان نحقق لكم تجربة مميزة ما تنسونها.",
        "{name} يقدم لكم حلول مبتكرة تناسب احتياجاتكم. تواصلوا معنا اليوم واكتشفوا المزيد.",
        "ثقة عملائنا هي أكبر إنجازاتنا. شكراً لكل من اختار {name} — نعدكم بالأفضل دائماً.",
        "هل تبحثون عن الجودة والاحترافية؟ {name} وجهتكم الأولى. زورونا وشوفوا بأنفسكم.",
        "مع {name}، كل يوم هو فرصة جديدة للتميز. انضموا لعائلتنا المتنامية واستمتعوا بالفرق.",
        "نفخر في {name} بتقديم خدمات تتجاوز توقعاتكم. جربونا وشاركونا رأيكم.",
    ]
    en_templates = [
        "At {name}, we believe excellence isn't optional — it's a way of life. We bring you the best services in our field.",
        "Discover the difference with {name}. Premium quality and professional service that matches your ambitions.",
        "Because you deserve the best — {name} is here to deliver an unforgettable experience.",
        "{name} offers innovative solutions tailored to your needs. Contact us today and learn more.",
        "Our clients' trust is our greatest achievement. Thank you for choosing {name} — we promise the best, always.",
        "Looking for quality and professionalism? {name} is your go-to destination. Visit us and see for yourself.",
        "With {name}, every day is a new opportunity to excel. Join our growing family and experience the difference.",
        "At {name}, we pride ourselves on exceeding expectations. Try us and share your experience.",
    ]
    ar_tags = ["#السعودية", "#الرياض", "#جدة", "#رؤية_2030", "#اعمال", "#ريادة_اعمال", "#نجاح", "#تميز", "#خدمات", "#جودة"]
    en_tags = ["#SaudiArabia", "#Riyadh", "#Jeddah", "#Vision2030", "#Business", "#Entrepreneurship", "#Success", "#Quality", "#Services", "#Growth"]

    posts = []
    for i in range(num_posts):
        post = {"day": i + 1, "platform": platforms[i % len(platforms)]}
        if language in ("ar", "both"):
            post["text_ar"] = ar_templates[i % len(ar_templates)].replace("{name}", name)
            post["hashtags_ar"] = random.sample(ar_tags, 5)
        if language in ("en", "both"):
            post["text_en"] = en_templates[i % len(en_templates)].replace("{name}", name)
            post["hashtags_en"] = random.sample(en_tags, 5)
        posts.append(post)
    return posts
