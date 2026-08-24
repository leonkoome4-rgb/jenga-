from tests.conftest import auth_header


def test_ai_routes_require_jwt(client):
    response = client.post("/api/ai/project-categorize", json={"title": "x", "description": "y"})
    assert response.status_code == 401


def test_categorize_rejects_missing_fields(client, user_a):
    _, token = user_a
    response = client.post(
        "/api/ai/project-categorize", json={}, headers=auth_header(token)
    )
    assert response.status_code == 400
    assert response.get_json()["success"] is False


def test_description_rejects_missing_name(client, user_a):
    _, token = user_a
    response = client.post("/api/ai/project-description", json={}, headers=auth_header(token))
    assert response.status_code == 400


def test_debug_rejects_missing_fields(client, user_a):
    _, token = user_a
    response = client.post(
        "/api/ai/debug", json={"language": "python"}, headers=auth_header(token)
    )
    assert response.status_code == 400


def test_team_match_with_no_other_users_returns_empty_list(client, user_a):
    _, token = user_a
    response = client.post(
        "/api/ai/team-match",
        json={"required_tech": ["React", "Flask"]},
        headers=auth_header(token),
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data["result"]["matches"] == []


def test_chat_requires_jwt(client):
    """
    The assistant requires login just like every other AI Hub route -- users
    must sign in before they can use the AI at all.
    """
    response = client.post("/api/ai/chat", json={"message": "What is Tawi?"})
    assert response.status_code == 401


def test_chat_requires_message(client, user_a):
    _, token = user_a
    response = client.post("/api/ai/chat", json={}, headers=auth_header(token))
    assert response.status_code == 400


def test_chat_can_navigate_when_authenticated(client, user_a):
    """
    Real end-to-end call: asks the assistant to take the user to the feed and
    checks the model's navigate_to survives the server-side whitelist check.
    """
    _, token = user_a
    response = client.post(
        "/api/ai/chat",
        json={"message": "take me to the video feed"},
        headers=auth_header(token),
    )
    data = response.get_json()

    assert response.status_code == 200, data
    assert data["result"]["navigate_to"] == "/discover"


def test_chat_rejects_bogus_navigate_target(client, user_a, monkeypatch):
    """
    Even if the model hallucinates a path outside the whitelist, the route
    must null it out rather than forward it to the frontend.
    """
    import app.routes.ai as ai_routes

    monkeypatch.setattr(
        ai_routes,
        "call_ai_messages",
        lambda messages: {"reply": "ok", "navigate_to": "/some/random/path"},
    )
    _, token = user_a
    response = client.post("/api/ai/chat", json={"message": "hi"}, headers=auth_header(token))
    data = response.get_json()

    assert response.status_code == 200
    assert data["result"]["navigate_to"] is None


def test_categorize_real_call_returns_expected_shape(client, user_a):
    """
    Hits the real Groq API using AI_API_KEY from the environment -- this is the
    end-to-end proof that the AI Hub integration actually works, not just that
    the route wiring is correct.
    """
    _, token = user_a
    response = client.post(
        "/api/ai/project-categorize",
        json={
            "title": "Pathway",
            "description": "A visual roadmap builder that helps students plan their learning path term by term.",
            "tech": ["React", "Flask", "PostgreSQL"],
        },
        headers=auth_header(token),
    )
    data = response.get_json()

    assert response.status_code == 200, data
    assert data["success"] is True
    result = data["result"]
    assert isinstance(result.get("category"), str)
    assert result.get("difficulty") in ("Beginner", "Intermediate", "Advanced")
    assert isinstance(result.get("tags"), list)
    assert isinstance(result.get("reasoning"), str)
