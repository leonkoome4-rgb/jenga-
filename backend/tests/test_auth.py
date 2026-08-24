from tests.conftest import auth_header, register_user, login_user, CAPTCHA_TOKEN


def test_register_creates_user_and_returns_token(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Ada Lovelace",
            "email": "ada@example.com",
            "password": "password123",
            "captcha_token": CAPTCHA_TOKEN,
        },
    )
    data = response.get_json()

    assert response.status_code == 201
    assert data["success"] is True
    assert data["token"]
    assert data["user"]["email"] == "ada@example.com"
    assert data["user"]["role"] == "student"


def test_register_rejects_duplicate_email(client):
    register_user(client, "Ada", "ada@example.com")
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Ada Two",
            "email": "ada@example.com",
            "password": "password123",
            "captcha_token": CAPTCHA_TOKEN,
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
            "captcha_token": CAPTCHA_TOKEN,
        },
    )
    assert response.status_code == 400


def test_login_with_correct_credentials(client):
    register_user(client, "Ada", "ada@example.com")
    response = login_user(client, "ada@example.com")
    data = response.get_json()

    assert response.status_code == 200
    assert data["token"]


def test_login_with_wrong_password_is_rejected(client):
    register_user(client, "Ada", "ada@example.com")
    response = login_user(client, "ada@example.com", password="wrong-password")
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


# --- CAPTCHA -----------------------------------------------------------


def test_register_rejects_missing_captcha_token(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "password123"},
    )
    data = response.get_json()

    assert response.status_code == 400
    assert data["success"] is False
    assert "verification" in data["error"].lower()


def test_login_rejects_missing_captcha_token(client):
    register_user(client, "Ada", "ada@example.com")
    response = client.post(
        "/api/auth/login", json={"email": "ada@example.com", "password": "password123"}
    )
    assert response.status_code == 400


def test_login_does_not_issue_jwt_when_captcha_fails(client):
    """A direct API call with no captcha_token must be rejected before
    credentials are even checked -- proves the backend enforces this
    itself rather than trusting the frontend to gate it."""
    register_user(client, "Ada", "ada@example.com")
    response = client.post(
        "/api/auth/login",
        json={"email": "ada@example.com", "password": "wrong-but-irrelevant"},
    )
    data = response.get_json()

    assert response.status_code == 400
    assert "token" not in data


def test_register_rejects_invalid_captcha_token(client):
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
        json={"email": "nobody@example.com", "captcha_token": CAPTCHA_TOKEN},
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data["success"] is True
    assert "reset_token" not in data


def test_forgot_password_issues_token_for_known_email(client):
    register_user(client, "Ada", "ada@example.com")
    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "ada@example.com", "captcha_token": CAPTCHA_TOKEN},
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data["reset_token"]


def test_reset_password_with_valid_token_changes_password(client):
    register_user(client, "Ada", "ada@example.com")
    forgot_response = client.post(
        "/api/auth/forgot-password",
        json={"email": "ada@example.com", "captcha_token": CAPTCHA_TOKEN},
    )
    reset_token = forgot_response.get_json()["reset_token"]

    reset_response = client.post(
        "/api/auth/reset-password",
        json={
            "token": reset_token,
            "password": "brand-new-password",
            "captcha_token": CAPTCHA_TOKEN,
        },
    )
    assert reset_response.status_code == 200

    old_login = login_user(client, "ada@example.com", password="password123")
    assert old_login.status_code == 401

    new_login = login_user(client, "ada@example.com", password="brand-new-password")
    assert new_login.status_code == 200


def test_reset_password_token_cannot_be_reused(client):
    register_user(client, "Ada", "ada@example.com")
    forgot_response = client.post(
        "/api/auth/forgot-password",
        json={"email": "ada@example.com", "captcha_token": CAPTCHA_TOKEN},
    )
    reset_token = forgot_response.get_json()["reset_token"]

    payload = {"token": reset_token, "password": "first-new-password", "captcha_token": CAPTCHA_TOKEN}
    first = client.post("/api/auth/reset-password", json=payload)
    assert first.status_code == 200

    second = client.post(
        "/api/auth/reset-password",
        json={"token": reset_token, "password": "second-new-password", "captcha_token": CAPTCHA_TOKEN},
    )
    assert second.status_code == 400


def test_reset_password_rejects_invalid_token(client):
    response = client.post(
        "/api/auth/reset-password",
        json={
            "token": "not-a-real-token",
            "password": "some-new-password",
            "captcha_token": CAPTCHA_TOKEN,
        },
    )
    assert response.status_code == 400
