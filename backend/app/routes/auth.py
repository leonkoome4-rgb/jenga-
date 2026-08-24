import hashlib
import secrets
from datetime import timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models import User, Cohort, PasswordResetToken
from app.models.models import utcnow
from app.utils.decorators import get_current_user
from app.services.captcha_service import verify_turnstile, CaptchaServiceError

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

RESET_TOKEN_TTL = timedelta(hours=1)


def _check_captcha(data):
    """Returns None if verification passed, or a (response, status) tuple
    the caller should return immediately."""
    token = data.get("captcha_token")
    try:
        ok, error = verify_turnstile(token, remote_ip=request.remote_addr)
    except CaptchaServiceError:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Human verification is temporarily unavailable. Please try again shortly.",
                }
            ),
            503,
        )
    if not ok:
        return jsonify({"success": False, "error": error}), 400
    return None


@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}

    captcha_failure = _check_captcha(data)
    if captcha_failure:
        return captcha_failure

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    cohort_id = data.get("cohort_id")

    if not name or not email or not password:
        return jsonify({"success": False, "error": "name, email, and password are required"}), 400
    if len(password) < 8:
        return jsonify({"success": False, "error": "Password must be at least 8 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "error": "An account with that email already exists"}), 409

    if cohort_id is not None and not db.session.get(Cohort, cohort_id):
        return jsonify({"success": False, "error": "Invalid cohort_id"}), 400

    user = User(name=name, email=email, cohort_id=cohort_id, role="student")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"success": True, "token": token, "user": user.to_dict(include_email=True)}), 201


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    captcha_failure = _check_captcha(data)
    if captcha_failure:
        return captcha_failure

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"success": False, "error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"success": True, "token": token, "user": user.to_dict(include_email=True)})


@bp.get("/me")
def me():
    current_user = get_current_user()
    return jsonify({"success": True, "user": current_user.to_dict(include_email=True)})


@bp.post("/forgot-password")
def forgot_password():
    data = request.get_json(silent=True) or {}

    captcha_failure = _check_captcha(data)
    if captcha_failure:
        return captcha_failure

    email = (data.get("email") or "").strip().lower()
    user = User.query.filter_by(email=email).first()

    response = {
        "success": True,
        "message": "If that email is registered, a reset link has been generated.",
    }

    # Same response shape whether or not the email exists, so this endpoint
    # can't be used to discover which emails are registered.
    if user:
        raw_token = secrets.token_urlsafe(32)
        db.session.add(
            PasswordResetToken(
                user_id=user.id,
                token_hash=hashlib.sha256(raw_token.encode()).hexdigest(),
                expires_at=utcnow() + RESET_TOKEN_TTL,
            )
        )
        db.session.commit()

        # No email service is wired up in this dev environment, so the raw
        # token is returned directly instead of emailed. In production this
        # would be sent by email and never appear in the API response.
        response["dev_note"] = "No email service is configured -- normally this token would be emailed, not returned here."
        response["reset_token"] = raw_token

    return jsonify(response)


@bp.post("/reset-password")
def reset_password():
    data = request.get_json(silent=True) or {}

    captcha_failure = _check_captcha(data)
    if captcha_failure:
        return captcha_failure

    raw_token = data.get("token") or ""
    new_password = data.get("password") or ""

    if not raw_token or not new_password:
        return jsonify({"success": False, "error": "token and password are required"}), 400
    if len(new_password) < 8:
        return jsonify({"success": False, "error": "Password must be at least 8 characters"}), 400

    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    reset_record = PasswordResetToken.query.filter_by(token_hash=token_hash).first()

    if not reset_record or not reset_record.is_valid:
        return jsonify({"success": False, "error": "This reset link is invalid or has expired"}), 400

    reset_record.user.set_password(new_password)
    reset_record.used_at = utcnow()
    db.session.commit()

    return jsonify({"success": True, "message": "Password updated. You can now log in."})
