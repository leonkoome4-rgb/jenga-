from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Project, ProjectMember, Category, Cohort, TechTag, User
from app.utils.decorators import require_owner, get_current_user

bp = Blueprint("projects", __name__, url_prefix="/api/projects")


def _project_owner_id(project_id):
    project = db.session.get(Project, project_id)
    return project.owner_id if project else None


def _resolve_tech_tags(names):
    tags = []
    for raw_name in names or []:
        name = raw_name.strip()
        if not name:
            continue
        tag = TechTag.query.filter(db.func.lower(TechTag.name) == name.lower()).first()
        if not tag:
            tag = TechTag(name=name)
            db.session.add(tag)
            db.session.flush()
        tags.append(tag)
    return tags


@bp.get("")
def list_projects():
    query = Project.query

    category = request.args.get("category")
    if category:
        query = query.join(Category).filter(db.func.lower(Category.name) == category.lower())

    cohort = request.args.get("cohort")
    if cohort:
        query = query.join(Cohort).filter(db.func.lower(Cohort.name) == cohort.lower())

    tech = request.args.get("tech")
    if tech:
        query = query.filter(Project.tech_tags.any(db.func.lower(TechTag.name) == tech.lower()))

    search = request.args.get("search")
    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(
            db.or_(
                db.func.lower(Project.name).like(pattern),
                db.func.lower(Project.description).like(pattern),
            )
        )

    projects = query.order_by(Project.created_at.desc()).all()
    return jsonify({"success": True, "projects": [p.to_dict() for p in projects]})


@bp.post("")
def create_project():
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()
    if not name or not description:
        return jsonify({"success": False, "error": "name and description are required"}), 400

    project = Project(
        name=name,
        description=description,
        full_description=data.get("full_description"),
        image_url=data.get("image_url"),
        video_url=data.get("video_url"),
        github_link=data.get("github_link"),
        live_link=data.get("live_link"),
        category_id=data.get("category_id"),
        cohort_id=data.get("cohort_id") or current_user.cohort_id,
    )
    project.tech_tags = _resolve_tech_tags(data.get("tech_tags"))
    db.session.add(project)
    db.session.flush()

    db.session.add(
        ProjectMember(project_id=project.id, user_id=current_user.id, role_in_project="owner")
    )
    db.session.commit()

    return jsonify({"success": True, "project": project.to_dict(detailed=True)}), 201


@bp.get("/<int:project_id>")
def get_project(project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({"success": False, "error": "Project not found"}), 404
    return jsonify({"success": True, "project": project.to_dict(detailed=True)})


@bp.patch("/<int:project_id>")
@require_owner(_project_owner_id)
def update_project(project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({"success": False, "error": "Project not found"}), 404

    data = request.get_json(silent=True) or {}
    for field in (
        "name",
        "description",
        "full_description",
        "image_url",
        "video_url",
        "github_link",
        "live_link",
        "category_id",
        "cohort_id",
    ):
        if field in data:
            setattr(project, field, data[field])

    if "tech_tags" in data:
        project.tech_tags = _resolve_tech_tags(data["tech_tags"])

    db.session.commit()
    return jsonify({"success": True, "project": project.to_dict(detailed=True)})


@bp.delete("/<int:project_id>")
@require_owner(_project_owner_id)
def delete_project(project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({"success": False, "error": "Project not found"}), 404

    db.session.delete(project)
    db.session.commit()
    return jsonify({"success": True})


@bp.post("/<int:project_id>/members")
@require_owner(_project_owner_id)
def add_member(project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({"success": False, "error": "Project not found"}), 404

    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    user = db.session.get(User, user_id) if user_id else None
    if not user:
        return jsonify({"success": False, "error": "Invalid user_id"}), 400

    if any(m.user_id == user.id for m in project.members):
        return jsonify({"success": False, "error": "User is already a member"}), 409

    db.session.add(
        ProjectMember(project_id=project.id, user_id=user.id, role_in_project="contributor")
    )
    db.session.commit()
    return jsonify({"success": True, "project": project.to_dict(detailed=True)}), 201
