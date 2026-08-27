import os

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token


class GoogleAuthError(Exception):
    pass


def verify_google_id_token(token):
    """Verifies a Google Identity Services ID token and returns
    (email, name) on success. Raises GoogleAuthError on any failure --
    bad signature, wrong audience, expired token, or missing config."""
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    if not client_id:
        raise GoogleAuthError("Google sign-in is not configured on this server")

    if not token:
        raise GoogleAuthError("Missing Google credential")

    try:
        payload = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
    except ValueError as exc:
        raise GoogleAuthError("Invalid Google credential") from exc

    if not payload.get("email_verified", False):
        raise GoogleAuthError("Google account email is not verified")

    email = payload.get("email")
    name = payload.get("name") or (email.split("@")[0] if email else "Tawi user")
    if not email:
        raise GoogleAuthError("Google credential did not include an email")

    return email.lower(), name
