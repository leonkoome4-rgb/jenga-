from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import SosPost, SosComment
from app.utils.decorators import require_owner, get_current_user

bp = Blueprint("sos", __name__, url_prefix="/api/sos")

MEDIA_TYPES = {"video", "image", "none"}


def _sos_post_owner_id(post_id):
    post = db.session.get(SosPost, post_id)
    return post.user_id if post else None


@bp.get("")
def list_sos_posts():
    posts = SosPost.query.order_by(SosPost.created_at.desc()).all()
    return jsonify({"success": True, "sos_posts": [p.to_dict() for p in posts]})


@bp.post("")
def create_sos_post():
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}

    question = (data.get("question") or "").strip()
    if not question:
        return jsonify({"success": False, "error": "question is required"}), 400

    media_type = data.get("media_type") or "none"
    if media_type not in MEDIA_TYPES:
        return jsonify({"success": False, "error": "media_type must be one of video, image, none"}), 400

    media_url = (data.get("media_url") or "").strip() or None
    if media_type != "none" and not media_url:
        return jsonify({"success": False, "error": "media_url is required when media_type is set"}), 400

    post = SosPost(
        user_id=current_user.id,
        question=question,
        media_type=media_type,
        media_url=media_url,
    )
    db.session.add(post)
    db.session.commit()

    return jsonify({"success": True, "sos_post": post.to_dict()}), 201


@bp.get("/<int:post_id>")
def get_sos_post(post_id):
    post = db.session.get(SosPost, post_id)
    if not post:
        return jsonify({"success": False, "error": "Not found"}), 404
    return jsonify({"success": True, "sos_post": post.to_dict(detailed=True)})


@bp.patch("/<int:post_id>")
@require_owner(_sos_post_owner_id)
def update_sos_post(post_id):
    post = db.session.get(SosPost, post_id)
    data = request.get_json(silent=True) or {}

    if "resolved" in data:
        post.resolved = bool(data["resolved"])

    db.session.commit()
    return jsonify({"success": True, "sos_post": post.to_dict(detailed=True)})


@bp.delete("/<int:post_id>")
@require_owner(_sos_post_owner_id)
def delete_sos_post(post_id):
    post = db.session.get(SosPost, post_id)
    db.session.delete(post)
    db.session.commit()
    return jsonify({"success": True})


@bp.post("/<int:post_id>/comments")
def add_sos_comment(post_id):
    current_user = get_current_user()
    post = db.session.get(SosPost, post_id)
    if not post:
        return jsonify({"success": False, "error": "Not found"}), 404

    data = request.get_json(silent=True) or {}
    body = (data.get("body") or "").strip()
    if not body:
        return jsonify({"success": False, "error": "body is required"}), 400

    comment = SosComment(sos_post_id=post.id, user_id=current_user.id, body=body)
    db.session.add(comment)
    db.session.commit()

    return jsonify({"success": True, "comment": comment.to_dict()}), 201
