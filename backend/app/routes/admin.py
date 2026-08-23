from flask import Blueprint, jsonify
from app.models import Project, User, Cohort
from app.utils.decorators import require_admin

bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@bp.get("/stats")
@require_admin
def stats():
    return jsonify(
        {
            "success": True,
            "stats": {
                "total_projects": Project.query.count(),
                "total_students": User.query.filter_by(role="student").count(),
                "total_cohorts": Cohort.query.count(),
            },
        }
    )


@bp.get("/projects")
@require_admin
def all_projects():
    projects = Project.query.order_by(Project.created_at.desc()).all()
    return jsonify({"success": True, "projects": [p.to_dict() for p in projects]})
