from tests.conftest import auth_header


def test_register_creates_user_and_returns_token(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "Ada Lovelace", "email": "ada@example.com", "password": "password123"},
    )
    data = response.get_json()

    assert response.status_code == 201
    assert data["success"] is True
    assert data["token"]
    assert data["user"]["email"] == "ada@example.com"
    assert data["user"]["role"] == "student"


def test_register_rejects_duplicate_email(client):
    client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "password123"},
    )
    response = client.post(
        "/api/auth/register",
        json={"name": "Ada Two", "email": "ada@example.com", "password": "password123"},
    )
    assert response.status_code == 409


def test_register_rejects_short_password(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "short"},
    )
    assert response.status_code == 400


def test_login_with_correct_credentials(client):
    client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "password123"},
    )
    response = client.post(
        "/api/auth/login", json={"email": "ada@example.com", "password": "password123"}
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data["token"]


def test_login_with_wrong_password_is_rejected(client):
    client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "password123"},
    )
    response = client.post(
        "/api/auth/login", json={"email": "ada@example.com", "password": "wrong-password"}
    )
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
