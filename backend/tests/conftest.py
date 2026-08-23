import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

import pytest
from app import create_app
from app.extensions import db as _db
from app.models import User, Cohort, Category


@pytest.fixture()
def app():
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


def register_user(client, name="Test User", email="test@example.com", password="password123"):
    response = client.post(
        "/api/auth/register",
        json={"name": name, "email": email, "password": password},
    )
    return response.get_json()


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
