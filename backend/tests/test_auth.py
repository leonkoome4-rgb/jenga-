from tests.conftest import auth_header, register_user, login_user, CAPTCHA_TOKEN


def test_register_creates_user_and_returns_token(client):
    """Test registration works WITHOUT CAPTCHA token"""
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Ada Lovelace",
            "email": "ada@example.com",
            "password": "password123",
        },
    )
    data = response.get_json()

    assert response.status_code == 201
    assert data["success"] is True
    assert data["token"]
    assert data["user"]["email"] == "ada@example.com"
    assert data["user"]["role"] == "student"


def test_register_works_without_captcha(client):
    """Test that registration works even without CAPTCHA token"""
    data = register_user(client, "Ada", "ada@example.com", captcha_token=None)
    assert data["token"]
    assert data["user"]["email"] == "ada@example.com"


def test_register_also_works_with_captcha(client):
    """Test that registration still works WITH CAPTCHA token"""
    data = register_user(client, "Bob", "bob@example.com", captcha_token=CAPTCHA_TOKEN)
    assert data["token"]
    assert data["user"]["email"] == "bob@example.com"


def test_register_rejects_duplicate_email(client):
    register_user(client, "Ada", "ada@example.com", captcha_token=None)
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Ada Two",
            "email": "ada@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 409


def test_register_rejects_short_password(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Ada",
            "email": "ada@example.com",
            "password": "short",
        },
    )
    assert response.status_code == 400


def test_login_with_correct_credentials(client):
    register_user(client, "Ada", "ada@example.com", captcha_token=None)
    response = login_user(client, "ada@example.com", captcha_token=None)
    data = response.get_json()

    assert response.status_code == 200
    assert data["token"]


def test_login_without_captcha(client):
    """Test that login works WITHOUT CAPTCHA token"""
    register_user(client, "Ada", "ada@example.com", captcha_token=None)
    response = login_user(client, "ada@example.com", captcha_token=None)
    assert response.status_code == 200
    assert response.get_json()["token"]


def test_login_also_works_with_captcha(client):
    """Test that login still works WITH CAPTCHA token"""
    register_user(client, "Bob", "bob@example.com", captcha_token=None)
    response = login_user(client, "bob@example.com", captcha_token=CAPTCHA_TOKEN)
    assert response.status_code == 200
    assert response.get_json()["token"]


def test_login_with_wrong_password_is_rejected(client):
    register_user(client, "Ada", "ada@example.com", captcha_token=None)
    response = login_user(client, "ada@example.com", password="wrong-password", captcha_token=None)
    assert response.status_code == 401


def test_me_requires_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_rejects_garbage_token(client):
    response = client.get("/api/auth/me", headers=auth_header("not-a-real-token"))
    assert response.status_code == 401


def test_me_returns_current_user(client, user_a):
    user, token = user_a
    response = client.get("/api/auth/me", headers=auth_header(token))
    data = response.get_json()

    assert response.status_code == 200
    assert data["user"]["id"] == user["id"]


# --- CAPTCHA (Optional) -----------------------------------------------------------


def test_register_with_invalid_captcha_token(client):
    """Uses Cloudflare's published 'always blocks' secret key to prove a
    verification failure (not just a missing token) is also rejected."""
    import os

    original = os.environ.get("TURNSTILE_SECRET_KEY")
    os.environ["TURNSTILE_SECRET_KEY"] = "2x0000000000000000000000000000000AA"
    try:
        response = client.post(
            "/api/auth/register",
            json={
                "name": "Ada",
                "email": "ada@example.com",
                "password": "password123",
                "captcha_token": "any-token",
            },
        )
    finally:
        if original is not None:
            os.environ["TURNSTILE_SECRET_KEY"] = original

    assert response.status_code == 400
    assert response.get_json()["success"] is False


# --- Password reset ------------------------------------------------------


def test_forgot_password_returns_generic_message_for_unknown_email(client):
    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "nobody@example.com"},
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data["success"] is True
    assert "reset_token" not in data


def test_forgot_password_issues_token_for_known_email(client):
    register_user(client, "Ada", "ada@example.com", captcha_token=None)
    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "ada@example.com"},
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data["reset_token"]


def test_reset_password_with_valid_token_changes_password(client):
    register_user(client, "Ada", "ada@example.com", captcha_token=None)
    forgot_response = client.post(
        "/api/auth/forgot-password",
        json={"email": "ada@example.com"},
    )
    reset_token = forgot_response.get_json()["reset_token"]

    reset_response = client.post(
        "/api/auth/reset-password",
        json={
            "token": reset_token,
            "password": "brand-new-password",
        },
    )
    assert reset_response.status_code == 200

    old_login = login_user(client, "ada@example.com", password="password123", captcha_token=None)
    assert old_login.status_code == 401

    new_login = login_user(client, "ada@example.com", password="brand-new-password", captcha_token=None)
    assert new_login.status_code == 200


def test_reset_password_token_cannot_be_reused(client):
    register_user(client, "Ada", "ada@example.com", captcha_token=None)
    forgot_response = client.post(
        "/api/auth/forgot-password",
        json={"email": "ada@example.com"},
    )
    reset_token = forgot_response.get_json()["reset_token"]

    payload = {"token": reset_token, "password": "first-new-password"}
    first = client.post("/api/auth/reset-password", json=payload)
    assert first.status_code == 200

    second = client.post(
        "/api/auth/reset-password",
        json={"token": reset_token, "password": "second-new-password"},
    )
    assert second.status_code == 400


def test_reset_password_rejects_invalid_token(client):
    response = client.post(
        "/api/auth/reset-password",
        json={
            "token": "not-a-real-token",
            "password": "some-new-password",
        },
    )
    assert response.status_code == 400


def test_google_login_rejects_missing_credential(client):
    response = client.post("/api/auth/google", json={})
    assert response.status_code == 400


def test_google_login_rejects_bogus_credential(client):
    response = client.post("/api/auth/google", json={"credential": "not-a-real-jwt"})
    assert response.status_code == 400


def test_google_login_creates_and_reuses_account(client, monkeypatch):
    """
    Doesn't hit real Google servers -- verifies the route logic itself
    (create-on-first-login, reuse-on-second-login) against a stubbed verifier.
    """
    import app.routes.auth as auth_routes

    monkeypatch.setattr(
        auth_routes, "verify_google_id_token", lambda credential: ("new.user@gmail.com", "New User")
    )

    first = client.post("/api/auth/google", json={"credential": "fake"})
    first_data = first.get_json()
    assert first.status_code == 200, first_data
    assert first_data["user"]["email"] == "new.user@gmail.com"
    assert first_data["user"]["role"] == "student"

    second = client.post("/api/auth/google", json={"credential": "fake"})
    second_data = second.get_json()
    assert second.status_code == 200
    assert second_data["user"]["id"] == first_data["user"]["id"]
