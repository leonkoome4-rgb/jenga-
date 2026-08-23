import json
import os
from openai import OpenAI

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = OpenAI(
            base_url=os.environ.get("AI_BASE_URL", "https://api.groq.com/openai/v1"),
            api_key=os.environ.get("AI_API_KEY"),
        )
    return _client


class AIServiceError(Exception):
    pass


def call_ai(system_prompt, user_prompt):
    if not os.environ.get("AI_API_KEY"):
        raise AIServiceError("AI is not configured on this server")

    client = _get_client()
    try:
        response = client.chat.completions.create(
            model=os.environ.get("AI_MODEL", "openai/gpt-oss-120b"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )
    except Exception as exc:  # network / API failure
        raise AIServiceError(f"AI request failed: {exc}") from exc

    raw = response.choices[0].message.content
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError) as exc:
        raise AIServiceError("AI returned a response that wasn't valid JSON") from exc
