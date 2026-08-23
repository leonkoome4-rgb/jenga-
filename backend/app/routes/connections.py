from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Connection, User
from app.utils.decorators import get_current_user, require_owner

bp = Blueprint("connections", __name__, url_prefix="/api/connections")


def _recipient_id(connection_id):
    connection = db.session.get(Connection, connection_id)
    return connection.recipient_id if connection else None


@bp.post("")
def create_connection():
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
    recipient_id = data.get("recipient_id")

    recipient = db.session.get(User, recipient_id) if recipient_id else None
    if not recipient:
        return jsonify({"success": False, "error": "Invalid recipient_id"}), 400
    if recipient.id == current_user.id:
        return jsonify({"success": False, "error": "You can't connect with yourself"}), 400

    existing = Connection.query.filter_by(
        requester_id=current_user.id, recipient_id=recipient.id
    ).first()
    if existing:
        return jsonify({"success": False, "error": "Request already sent"}), 409

    connection = Connection(requester_id=current_user.id, recipient_id=recipient.id)
    db.session.add(connection)
    db.session.commit()
    return jsonify({"success": True, "connection": connection.to_dict()}), 201


@bp.patch("/<int:connection_id>")
@require_owner(_recipient_id)
def update_connection(connection_id):
    connection = db.session.get(Connection, connection_id)
    if not connection:
        return jsonify({"success": False, "error": "Connection not found"}), 404

    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ("accepted", "declined"):
        return jsonify({"success": False, "error": "status must be 'accepted' or 'declined'"}), 400

    connection.status = status
    db.session.commit()
    return jsonify({"success": True, "connection": connection.to_dict()})


@bp.get("/mine")
def my_connections():
    current_user = get_current_user()
    connections = Connection.query.filter(
        db.or_(
            Connection.requester_id == current_user.id,
            Connection.recipient_id == current_user.id,
        )
    ).order_by(Connection.created_at.desc()).all()
    return jsonify({"success": True, "connections": [c.to_dict() for c in connections]})
