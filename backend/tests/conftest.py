import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

import pytest
from app import create_app
from app.extensions import db as _db
from app.models import User, Cohort, Category


class _CaptchaResponse:
    def __init__(self, success):
        self._success = success

    def raise_for_status(self):
        return None

    def json(self):
        return {"success": self._success, "error-codes": [] if self._success else ["invalid-input-response"]}


@pytest.fixture()
def app(monkeypatch):
    # CAPTCHA itself is verified by the separate production service. Mock it
    # here so unit tests stay offline and deterministic while preserving the
    # published always-pass/always-block Cloudflare test-key behaviour.
    monkeypatch.setenv("TURNSTILE_SECRET_KEY", "1x0000000000000000000000000000000AA")
    monkeypatch.setattr(
        "app.services.captcha_service.requests.post",
        lambda _url, data, timeout: _CaptchaResponse(
            data["secret"] == "1x0000000000000000000000000000000AA"
        ),
    )
    application = create_app("app.config.TestConfig")
    with application.app_context():
        _db.create_all()
        yield application
        _db.session.remove()
        _db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def db(app):
    return _db


# Cloudflare's published "always passes" test token -- valid alongside the
# TURNSTILE_SECRET_KEY test key set in .env, works with any string value.
CAPTCHA_TOKEN = "test-turnstile-token"


def register_user(client, name="Test User", email="test@example.com", password="password123"):
    response = client.post(
        "/api/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password,
            "captcha_token": CAPTCHA_TOKEN,
        },
    )
    return response.get_json()


def login_user(client, email, password="password123"):
    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password, "captcha_token": CAPTCHA_TOKEN},
    )
    return response


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def user_a(client):
    data = register_user(client, "User A", "usera@example.com")
    return data["user"], data["token"]


@pytest.fixture()
def user_b(client):
    data = register_user(client, "User B", "userb@example.com")
    return data["user"], data["token"]


@pytest.fixture()
def admin_user(client, db):
    data = register_user(client, "Admin User", "admin@example.com")
    user = db.session.get(User, data["user"]["id"])
    user.role = "admin"
    db.session.commit()
    return data["user"], data["token"]
