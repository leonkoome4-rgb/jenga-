from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User, Project, ProjectMember
from app.utils.decorators import require_owner

bp = Blueprint("users", __name__, url_prefix="/api/users")

ALLOWED_FIELDS = {"name", "bio", "github_url", "avatar_url", "cohort_id"}


def _user_owner_id(user_id):
    user = db.session.get(User, user_id)
    return user.id if user else None


@bp.get("/<int:user_id>")
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404
    return jsonify({"success": True, "user": user.to_dict()})


@bp.patch("/<int:user_id>")
@require_owner(lambda user_id: _user_owner_id(user_id))
def update_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    for field in ALLOWED_FIELDS:
        if field in data:
            setattr(user, field, data[field])

    db.session.commit()
    return jsonify({"success": True, "user": user.to_dict(include_email=True)})


@bp.get("/<int:user_id>/projects")
def get_user_projects(user_id):
    if not db.session.get(User, user_id):
        return jsonify({"success": False, "error": "User not found"}), 404

    project_ids = (
        db.session.query(ProjectMember.project_id).filter_by(user_id=user_id).subquery()
    )
    projects = Project.query.filter(Project.id.in_(project_ids)).order_by(
        Project.created_at.desc()
    ).all()
    return jsonify({"success": True, "projects": [p.to_dict() for p in projects]})
