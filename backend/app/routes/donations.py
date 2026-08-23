from flask import Blueprint, request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.extensions import db
from app.models import Donation
from app.services import mpesa_service
from app.services.mpesa_service import MpesaServiceError

bp = Blueprint("donations", __name__, url_prefix="/api/donations")


def _optional_current_user_id():
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        return int(identity) if identity else None
    except Exception:
        return None


@bp.post("/stk-push")
def stk_push():
    data = request.get_json(silent=True) or {}
    phone_number = data.get("phone_number")
    amount = data.get("amount")
    donor_name = data.get("donor_name")

    if not phone_number or not amount:
        return jsonify({"success": False, "error": "phone_number and amount are required"}), 400
    try:
        amount = int(amount)
    except (TypeError, ValueError):
        return jsonify({"success": False, "error": "amount must be a number"}), 400
    if amount < 1:
        return jsonify({"success": False, "error": "amount must be at least 1"}), 400

    donation = Donation(
        donor_user_id=_optional_current_user_id(),
        donor_name=donor_name,
        phone_number=phone_number,
        amount=amount,
        status="pending",
    )
    db.session.add(donation)
    db.session.commit()

    try:
        result = mpesa_service.initiate_stk_push(
            phone_number, amount, f"TAWI-{donation.id}", "Changia - support Tawi"
        )
    except MpesaServiceError as exc:
        donation.status = "failed"
        donation.result_desc = str(exc)
        db.session.commit()
        return jsonify({"success": False, "error": str(exc)}), 502

    donation.merchant_request_id = result.get("MerchantRequestID")
    donation.checkout_request_id = result.get("CheckoutRequestID")
    db.session.commit()

    return jsonify({"success": True, "donation": donation.to_dict()}), 201


@bp.post("/callback")
def mpesa_callback():
    payload = request.get_json(silent=True) or {}
    parsed = mpesa_service.parse_callback(payload)
    checkout_request_id = parsed["checkout_request_id"]

    ack = {"ResultCode": 0, "ResultDesc": "Accepted"}
    if not checkout_request_id:
        return jsonify(ack)

    donation = Donation.query.filter_by(checkout_request_id=checkout_request_id).first()
    if not donation or donation.status != "pending":
        # Unknown donation, or already resolved -- idempotent no-op either way.
        return jsonify(ack)

    if parsed["result_code"] == 0:
        donation.status = "completed"
        donation.mpesa_receipt_number = parsed["mpesa_receipt_number"]
    else:
        donation.status = "failed"
    donation.result_desc = parsed["result_desc"]
    db.session.commit()

    return jsonify(ack)


@bp.get("/<int:donation_id>/status")
def donation_status(donation_id):
    donation = db.session.get(Donation, donation_id)
    if not donation:
        return jsonify({"success": False, "error": "Donation not found"}), 404
    return jsonify({"success": True, "donation": donation.to_dict()})
