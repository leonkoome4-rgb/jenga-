from datetime import date
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Cohort
from app.utils.decorators import require_admin

bp = Blueprint("cohorts", __name__, url_prefix="/api/cohorts")


def _parse_date(value):
    if not value:
        return None
    return date.fromisoformat(value)


@bp.get("")
def list_cohorts():
    cohorts = Cohort.query.order_by(Cohort.name).all()
    return jsonify({"success": True, "cohorts": [c.to_dict() for c in cohorts]})


@bp.post("")
@require_admin
def create_cohort():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "error": "name is required"}), 400
    if Cohort.query.filter_by(name=name).first():
        return jsonify({"success": False, "error": "A cohort with that name already exists"}), 409

    cohort = Cohort(
        name=name,
        start_date=_parse_date(data.get("start_date")),
        end_date=_parse_date(data.get("end_date")),
    )
    db.session.add(cohort)
    db.session.commit()
    return jsonify({"success": True, "cohort": cohort.to_dict()}), 201


@bp.patch("/<int:cohort_id>")
@require_admin
def update_cohort(cohort_id):
    cohort = db.session.get(Cohort, cohort_id)
    if not cohort:
        return jsonify({"success": False, "error": "Cohort not found"}), 404

    data = request.get_json(silent=True) or {}
    if "name" in data:
        cohort.name = data["name"].strip()
    if "start_date" in data:
        cohort.start_date = _parse_date(data["start_date"])
    if "end_date" in data:
        cohort.end_date = _parse_date(data["end_date"])

    db.session.commit()
    return jsonify({"success": True, "cohort": cohort.to_dict()})


@bp.delete("/<int:cohort_id>")
@require_admin
def delete_cohort(cohort_id):
    cohort = db.session.get(Cohort, cohort_id)
    if not cohort:
        return jsonify({"success": False, "error": "Cohort not found"}), 404

    db.session.delete(cohort)
    db.session.commit()
    return jsonify({"success": True})
