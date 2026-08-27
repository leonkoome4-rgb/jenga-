from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.extensions import db
from app.models import User


def get_current_user():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    return db.session.get(User, int(user_id))


def get_current_user_optional():
    """Like get_current_user, but returns None instead of raising when
    there's no (or an invalid/expired) token, for routes usable by guests."""
    try:
        verify_jwt_in_request(optional=True)
    except Exception:
        return None
    user_id = get_jwt_identity()
    return db.session.get(User, int(user_id)) if user_id else None


def require_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user = get_current_user()
        if not current_user or current_user.role != "admin":
            return jsonify({"success": False, "error": "Forbidden"}), 403
        return fn(*args, **kwargs)

    return wrapper


def require_owner(get_owner_id):
    """
    get_owner_id(*args, **kwargs) -> int | None
    Returns the resource's owner user_id, given the route's positional/keyword
    args (e.g. the :id from the URL). Returning None is treated as "not found".
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            current_user = get_current_user()
            if not current_user:
                return jsonify({"success": False, "error": "Unauthorized"}), 401

            owner_id = get_owner_id(*args, **kwargs)
            if owner_id is None:
                return jsonify({"success": False, "error": "Not found"}), 404

            if current_user.id != owner_id and current_user.role != "admin":
                return jsonify({"success": False, "error": "Forbidden"}), 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator
