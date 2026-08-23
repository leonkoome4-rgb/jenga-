from flask import Blueprint, jsonify
from app.models import Category, TechTag

bp = Blueprint("reference", __name__, url_prefix="/api")


@bp.get("/categories")
def list_categories():
    categories = Category.query.order_by(Category.name).all()
    return jsonify({"success": True, "categories": [c.to_dict() for c in categories]})


@bp.get("/tech-tags")
def list_tech_tags():
    tags = TechTag.query.order_by(TechTag.name).all()
    return jsonify({"success": True, "tech_tags": [t.to_dict() for t in tags]})
