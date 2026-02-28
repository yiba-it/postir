#!/usr/bin/env python3
"""
Postir V2 — Shared Supabase helper module
Used by all API endpoints. No external dependencies — stdlib only.
"""
import json
import os
import urllib.request
import urllib.error
from urllib.parse import urlencode


def get_supabase_config():
    """Returns (supabase_url, service_key, anon_key)."""
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    service_key = os.environ.get("SUPABASE_SERVICE_KEY", "")
    anon_key = os.environ.get("SUPABASE_ANON_KEY", "")
    return url, service_key, anon_key


def supabase_request(method, path, data=None, token=None, use_service_key=False, params=None):
    """
    Make an HTTP request to Supabase REST or Auth API.
    """
    supabase_url, service_key, anon_key = get_supabase_config()

    if not supabase_url:
        raise ValueError("SUPABASE_URL not configured")

    full_url = f"{supabase_url}{path}"
    if params:
        full_url += "?" + urlencode(params)

    headers = {
        "Content-Type": "application/json",
        "apikey": anon_key,
        "Accept": "application/json",
    }

    if use_service_key and service_key:
        headers["Authorization"] = f"Bearer {service_key}"
        headers["apikey"] = service_key
    elif token:
        headers["Authorization"] = f"Bearer {token}"

    body = json.dumps(data).encode("utf-8") if data is not None else None

    req = urllib.request.Request(
        full_url,
        data=body,
        headers=headers,
        method=method,
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
            if raw.strip():
                return json.loads(raw)
            return {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8") if e.fp else ""
        try:
            return {"_error": True, "_status": e.code, "_body": json.loads(raw)}
        except Exception:
            return {"_error": True, "_status": e.code, "_body": raw}


def verify_token(token):
    if not token:
        return None
    resp = supabase_request("GET", "/auth/v1/user", token=token)
    if resp and not resp.get("_error") and resp.get("id"):
        return resp
    return None


def get_user_profile(user_id):
    resp = supabase_request(
        "GET",
        "/rest/v1/profiles",
        use_service_key=True,
        params={"id": f"eq.{user_id}", "limit": "1"},
    )
    if isinstance(resp, list) and len(resp) > 0:
        return resp[0]
    if isinstance(resp, dict) and not resp.get("_error"):
        return resp
    return None


def check_tokens(user_id, required=1):
    profile = get_user_profile(user_id)
    if not profile:
        return False, None

    plan = profile.get("plan", "free")
    tokens_total = profile.get("tokens_total", 0)
    tokens_used = profile.get("tokens_used", 0)

    if plan == "pro":
        return True, profile

    if (tokens_total - tokens_used) >= required:
        return True, profile

    return False, profile


def update_user_tokens(user_id, tokens_used_increment):
    profile = get_user_profile(user_id)
    if not profile:
        return False

    current_used = profile.get("tokens_used", 0)
    new_used = current_used + tokens_used_increment

    resp = supabase_request(
        "PATCH",
        "/rest/v1/profiles",
        data={"tokens_used": new_used, "updated_at": "now()"},
        use_service_key=True,
        params={"id": f"eq.{user_id}"},
    )

    if resp and resp.get("_error"):
        return False
    return True


def log_generation(user_id, gen_type, platform=None, prompt_summary=None, tokens_consumed=1):
    data = {
        "user_id": user_id,
        "type": gen_type,
        "tokens_consumed": tokens_consumed,
        "platform": platform,
        "prompt_summary": prompt_summary,
    }
    data = {k: v for k, v in data.items() if v is not None}

    resp = supabase_request(
        "POST",
        "/rest/v1/generations",
        data=data,
        use_service_key=True,
    )

    if resp and resp.get("_error"):
        return False
    return True


def update_user_plan(user_id, plan, tokens_total, tokens_used=0, plan_expires_at=None, airwallex_customer_id=None):
    data = {
        "plan": plan,
        "tokens_total": tokens_total,
        "tokens_used": tokens_used,
        "updated_at": "now()",
    }

    if plan_expires_at:
        data["plan_expires_at"] = plan_expires_at

    if airwallex_customer_id:
        data["airwallex_customer_id"] = airwallex_customer_id

    resp = supabase_request(
        "PATCH",
        "/rest/v1/profiles",
        data=data,
        use_service_key=True,
        params={"id": f"eq.{user_id}"},
    )

    if resp and resp.get("_error"):
        return False
    return True


def log_payment(user_id, plan, amount_sar, airwallex_intent_id=None, status="completed"):
    data = {
        "user_id": user_id,
        "plan": plan,
        "amount_sar": amount_sar,
        "status": status,
    }

    if airwallex_intent_id:
        data["airwallex_intent_id"] = airwallex_intent_id

    resp = supabase_request(
        "POST",
        "/rest/v1/payments",
        data=data,
        use_service_key=True,
    )

    if resp and resp.get("_error"):
        return False
    return True


def create_profile(user_id, email):
    data = {
        "id": user_id,
        "email": email,
        "plan": "free",
        "tokens_total": 3,
        "tokens_used": 0,
    }

    resp = supabase_request(
        "POST",
        "/rest/v1/profiles",
        data=data,
        use_service_key=True,
    )

    if resp and resp.get("_error"):
        return False
    return True
