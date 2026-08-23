from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models import User, Cohort
from app.utils.decorators import get_current_user

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
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
