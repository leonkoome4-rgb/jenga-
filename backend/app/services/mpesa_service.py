import base64
import os
from datetime import datetime

import requests

DARAJA_BASE_URL = "https://sandbox.safaricom.co.ke"


class MpesaServiceError(Exception):
    pass


def _get_access_token():
    consumer_key = os.environ.get("MPESA_CONSUMER_KEY")
    consumer_secret = os.environ.get("MPESA_CONSUMER_SECRET")
    if not consumer_key or not consumer_secret:
        raise MpesaServiceError("M-Pesa is not configured on this server")

    try:
        response = requests.get(
            f"{DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials",
            auth=(consumer_key, consumer_secret),
            timeout=15,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise MpesaServiceError(f"Could not reach Safaricom: {exc}") from exc

    token = response.json().get("access_token")
    if not token:
        raise MpesaServiceError("Safaricom did not return an access token")
    return token


def _normalize_phone(phone_number):
    digits = "".join(ch for ch in phone_number if ch.isdigit())
    if digits.startswith("0"):
        digits = "254" + digits[1:]
    elif digits.startswith("7") or digits.startswith("1"):
        digits = "254" + digits
    return digits


def initiate_stk_push(phone_number, amount, account_reference, transaction_desc):
    """
    Calls Lipa na M-Pesa Online (STK Push). Returns Safaricom's response dict,
    which includes MerchantRequestID and CheckoutRequestID on success.
    """
    shortcode = os.environ.get("MPESA_SHORTCODE")
    passkey = os.environ.get("MPESA_PASSKEY")
    callback_url = os.environ.get("MPESA_CALLBACK_URL")
    if not shortcode or not passkey or not callback_url:
        raise MpesaServiceError("M-Pesa is not configured on this server")

    access_token = _get_access_token()

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(f"{shortcode}{passkey}{timestamp}".encode()).decode()
    phone = _normalize_phone(phone_number)

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone,
        "PartyB": shortcode,
        "PhoneNumber": phone,
        "CallBackURL": callback_url,
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc,
    }

    try:
        response = requests.post(
            f"{DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest",
            json=payload,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=15,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise MpesaServiceError(f"STK push request failed: {exc}") from exc

    return response.json()


def parse_callback(payload):
    """
    Extracts the fields we care about from Safaricom's callback payload.
    Returns a dict: checkout_request_id, result_code, result_desc,
    mpesa_receipt_number (None if the payment failed).
    """
    stk_callback = (payload.get("Body") or {}).get("stkCallback") or {}
    checkout_request_id = stk_callback.get("CheckoutRequestID")
    result_code = stk_callback.get("ResultCode")
    result_desc = stk_callback.get("ResultDesc")

    receipt_number = None
    items = ((stk_callback.get("CallbackMetadata") or {}).get("Item")) or []
    for item in items:
        if item.get("Name") == "MpesaReceiptNumber":
            receipt_number = item.get("Value")

    return {
        "checkout_request_id": checkout_request_id,
        "result_code": result_code,
        "result_desc": result_desc,
        "mpesa_receipt_number": receipt_number,
    }
