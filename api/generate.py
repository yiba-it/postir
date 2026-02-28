#!/usr/bin/env python3
"""
Postir — AI Social Media Content Generator Backend
Uses OpenAI GPT-4o to generate Gulf Arabic social media posts.

Deploy on Vercel as a Python serverless function.
"""

import json
import os
import re
from http.server import BaseHTTPRequestHandler

try:
    import openai
except ImportError:
    openai = None


# ---- PLATFORM CONFIG ----
PLATFORM_CONFIG = {
    "instagram": {
        "name": "إنستغرام",
        "max_chars": 2200,
        "target_chars": 300,
        "hashtag_count": 8,
        "style": "نص جذاب مع فقرات قصيرة وسطر فارغ بين كل فقرة",
    },
    "twitter": {
        "name": "تويتر/X",
        "max_chars": 280,
        "target_chars": 220,
        "hashtag_count": 3,
        "style": "نص مباشر وقصير جداً، جملة واحدة أو اثنتين كحد أقصى",
    },
    "tiktok": {
        "name": "تيك توك",
        "max_chars": 2200,
        "target_chars": 200,
        "hashtag_count": 6,
        "style": "نص قصير ومثير وعصري، يستهدف الشباب",
    },
    "snapchat": {
        "name": "سناب شات",
        "max_chars": 250,
        "target_chars": 150,
        "hashtag_count": 2,
        "style": "نص خفيف وسريع مناسب للقصص",
    },
}

TONE_CONFIG = {
    "casual":       "ودّي وغير رسمي، كأنك تتكلم مع صديق",
    "professional": "احترافي ورسمي مع الحفاظ على الدفء",
    "funny":        "مرح وفيه نكتة خفيفة مناسبة للموضوع",
    "urgent":       "عاجل ومثير للفضول، يدفع للتفاعل الفوري",
    "inspiring":    "ملهم ومحفز، يحرك المشاعر ويشجع الناس",
    "local":        "خليجي أصيل بلهجة سعودية واضحة",
}

POST_TYPE_CONFIG = {
    "promotional": "بوست ترويجي يسلط الضوء على منتج أو خدمة ويشجع الشراء أو الزيارة",
    "engagement":  "بوست تفاعلي يطرح سؤالاً أو يدعو الجمهور للمشاركة والتعليق",
    "educational": "بوست تثقيفي يشارك معلومة مفيدة أو نصيحة مرتبطة بالنشاط",
    "story":       "قصة نجاح أو شهادة عميل حقيقية تبني الثقة",
    "seasonal":    "بوست موسمي مرتبط بمناسبة أو موسم (رمضان، الصيف، الوطني...)",
}


# ---- PROMPT BUILDER ----
def build_prompt(payload: dict) -> str:
    platform = payload.get("platform", "instagram")
    post_type = payload.get("postType", "promotional")
    tone = payload.get("tone", "casual")
    description = payload.get("description", "")
    custom_hashtags = payload.get("hashtags", "")

    p_cfg = PLATFORM_CONFIG.get(platform, PLATFORM_CONFIG["instagram"])
    t_cfg = TONE_CONFIG.get(tone, TONE_CONFIG["casual"])
    pt_cfg = POST_TYPE_CONFIG.get(post_type, POST_TYPE_CONFIG["promotional"])

    custom_ht_instruction = ""
    if custom_hashtags:
        tags = [t.strip() for t in custom_hashtags.split() if t.strip()]
        if tags:
            custom_ht_instruction = f"\n- أضف هذه الهاشتاقات المخصصة بالتأكيد: {' '.join(tags)}"

    prompt = f"""أنت خبير تسويق رقمي متخصص في السوق السعودي والخليجي.
مهمتك: كتابة محتوى سوشيال ميديا احترافي باللهجة الخليجية السعودية.

معلومات النشاط التجاري:
{description}

المنصة: {p_cfg['name']}
نوع البوست: {pt_cfg}
الأسلوب المطلوب: {t_cfg}
الأسلوب للمنصة: {p_cfg['style']}
الطول المستهدف للنص: حوالي {p_cfg['target_chars']} حرف (بدون الهاشتاقات)
عدد الهاشتاقات: {p_cfg['hashtag_count']} هاشتاق{custom_ht_instruction}

تعليمات مهمة:
- اكتب باللهجة الخليجية/السعودية العامية (مو الفصحى)
- لا تستخدم تعبيرات مصرية أو شامية
- استخدم كلمات سعودية مثل: وايد، زين، حق، يبي، كشخة، صراحة، بصراحة...
- الهاشتاقات تكون نصف عربية ونصف إنجليزية للوصول الأوسع
- النتيجة يجب أن تكون JSON فقط بدون أي نص إضافي

الصيغة المطلوبة للرد (JSON فقط):
{{
  "text": "نص البوست هنا",
  "hashtags": ["#هاشتاق1", "#هاشتاق2", "#hashtag3"],
  "emojis": ["🔥", "✨", "💪"]
}}"""

    return prompt


# ---- MOCK GENERATOR (fallback when no API key) ----
def generate_mock(payload: dict) -> dict:
    platform = payload.get("platform", "instagram")
    post_type = payload.get("postType", "promotional")
    description = payload.get("description", "نشاط تجاري")
    custom_hashtags = payload.get("hashtags", "")

    # Extract first sentence of description
    first_line = description.split(".")[0].split(",")[0][:60]

    templates = {
        "promotional": f"🎯 جربت {first_line}؟\n\nوالله ما تندم! عندنا أحسن تجربة وبأسعار تناسب الجميع 🔥\n\nتعال وشوف الفرق بنفسك — الجودة تتكلم عن نفسها 💪",
        "engagement": f"سؤال لكم! 🤔\n\nإيش أكثر شي تبون تشوفونه عندنا في {first_line}؟\n\nشاركونا رأيكم في التعليقات ⬇️",
        "educational": f"💡 هل تعلم؟\n\n{first_line} ممكن يغير طريقة تفكيرك!\n\nشاركها مع أصحابك اللي يحتاجون هذي المعلومة 🙌",
        "story": f"⭐ قصة نجاح حقيقية\n\nعميلنا كان يبحث عن {first_line}...\nاليوم هو من أكثر زبائننا رضا!\n\nأنت التالي 🎯",
        "seasonal": f"🌙 في هذا الموسم المبارك\n\n{first_line} معكم بأجمل العروض وأحسن الأسعار!\n\nاستغل الفرصة قبل ما تنتهي ⏰",
    }

    text = templates.get(post_type, templates["promotional"])

    platform_hashtags = {
        "instagram": ["#السعودية", "#الرياض", "#تسويق", "#عروض", "#Saudi", "#Riyadh", "#KSA", "#SaudiArabia"],
        "twitter":   ["#السعودية", "#KSA", "#Riyadh"],
        "tiktok":    ["#السعودية", "#تيك_توك", "#fyp", "#viral", "#KSA", "#SaudiTikTok"],
        "snapchat":  ["#السعودية", "#snap"],
    }

    hashtags = platform_hashtags.get(platform, platform_hashtags["instagram"])
    if custom_hashtags:
        extra = [t.strip() for t in custom_hashtags.split() if t.strip()]
        hashtags = extra + hashtags

    emojis_map = {
        "promotional": ["🔥", "💥", "🎯"],
        "engagement":  ["💬", "❓", "👇"],
        "educational": ["💡", "📚", "✅"],
        "story":       ["⭐", "🙌", "💪"],
        "seasonal":    ["🌙", "🎉", "✨"],
    }

    return {
        "text": text,
        "hashtags": hashtags[:8],
        "emojis": emojis_map.get(post_type, ["✨", "🔥", "💪"]),
    }


# ---- OPENAI GENERATOR ----
def generate_with_openai(payload: dict) -> dict:
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key or not openai:
        return generate_mock(payload)

    client = openai.OpenAI(api_key=api_key)
    prompt = build_prompt(payload)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.85,
        max_tokens=600,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    result = json.loads(content)

    # Validate structure
    if not isinstance(result.get("text"), str):
        raise ValueError("Invalid response structure")

    return result


# ---- VERCEL HANDLER ----
class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            payload = json.loads(body)
        except Exception:
            self._error(400, "Invalid request body")
            return

        # Validate required fields
        if not payload.get("description", "").strip():
            self._error(400, "description is required")
            return

        try:
            result = generate_with_openai(payload)
            self._json(200, result)
        except Exception as e:
            print(f"Generation error: {e}")
            # Fallback to mock
            try:
                result = generate_mock(payload)
                self._json(200, result)
            except Exception as e2:
                self._error(500, str(e2))

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
