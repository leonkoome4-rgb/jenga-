import os
import requests

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
# Cloudflare publishes these non-production test secrets. Handling them locally
# avoids a network dependency during development and tests; real production
# secrets always use Cloudflare's server-side verification endpoint below.
TURNSTILE_TEST_PASS_SECRET = "1x0000000000000000000000000000000AA"
TURNSTILE_TEST_BLOCK_SECRET = "2x0000000000000000000000000000000AA"

_FRIENDLY_ERRORS = {
    "missing-input-response": "Please complete the human verification.",
    "timeout-or-duplicate": "This verification has expired. Please try again.",
    "invalid-input-response": "Human verification failed. Please try again.",
    "invalid-input-secret": "Human verification failed. Please try again.",
}


class CaptchaServiceError(Exception):
    """Raised when we genuinely can't reach/use the verification service --
    a config or network problem, not a failed verification."""


def verify_turnstile(token, remote_ip=None):
    """
    Verifies a Cloudflare Turnstile token server-side.
    Returns (True, None) on success, (False, friendly_error_message) on a
    failed/missing/expired token. Raises CaptchaServiceError only for
    configuration or network problems the caller should treat as a 503.
    """
    secret_key = os.environ.get("TURNSTILE_SECRET_KEY")
    if not secret_key:
        raise CaptchaServiceError("CAPTCHA is not configured on this server")

    if not token:
        return False, _FRIENDLY_ERRORS["missing-input-response"]

    if secret_key == TURNSTILE_TEST_PASS_SECRET:
        return True, None
    if secret_key == TURNSTILE_TEST_BLOCK_SECRET:
        return False, _FRIENDLY_ERRORS["invalid-input-response"]

    payload = {"secret": secret_key, "response": token}
    if remote_ip:
        payload["remoteip"] = remote_ip

    try:
        response = requests.post(TURNSTILE_VERIFY_URL, data=payload, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise CaptchaServiceError(
            f"Could not reach the CAPTCHA verification service: {exc}"
        ) from exc

    try:
        result = response.json()
    except ValueError as exc:
        raise CaptchaServiceError(
            "CAPTCHA verification service returned an invalid response"
        ) from exc

    if result.get("success"):
        return True, None

    error_codes = result.get("error-codes", [])
    for code in error_codes:
        if code in _FRIENDLY_ERRORS:
            return False, _FRIENDLY_ERRORS[code]
    return False, "Human verification failed. Please try again."
