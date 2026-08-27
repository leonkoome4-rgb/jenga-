from tests.conftest import auth_header


def test_list_help_posts_is_public(client):
    response = client.get("/api/help")
    assert response.status_code == 200
    assert response.get_json()["help_posts"] == []


def test_create_help_post_requires_login(client):
    response = client.post("/api/help", json={"question": "Why won't my API return JSON?"})
    assert response.status_code == 401


def test_create_help_post_requires_question(client, user_a):
    _, token = user_a
    response = client.post("/api/help", json={}, headers=auth_header(token))
    assert response.status_code == 400


def test_create_help_post_requires_media_url_when_media_type_set(client, user_a):
    _, token = user_a
    response = client.post(
        "/api/help",
        json={"question": "Stuck on this bug", "media_type": "video"},
        headers=auth_header(token),
    )
    assert response.status_code == 400


def test_create_and_view_help_post(client, user_a):
    _, token = user_a
    create = client.post(
        "/api/help",
        json={
            "question": "Why does my React state not update?",
            "media_type": "video",
            "media_url": "https://cdn.pixabay.com/video/example.mp4",
        },
        headers=auth_header(token),
    )
    assert create.status_code == 201
    post_id = create.get_json()["help_post"]["id"]

    listing = client.get("/api/help")
    assert len(listing.get_json()["help_posts"]) == 1

    detail = client.get(f"/api/help/{post_id}")
    data = detail.get_json()
    assert data["help_post"]["question"] == "Why does my React state not update?"
    assert data["help_post"]["comments"] == []
    assert data["help_post"]["resolved"] is False


def test_add_comment_requires_login(client, user_a):
    _, token = user_a
    create = client.post(
        "/api/help", json={"question": "Help please"}, headers=auth_header(token)
    )
    post_id = create.get_json()["help_post"]["id"]

    response = client.post(f"/api/help/{post_id}/comments", json={"body": "Try this"})
    assert response.status_code == 401


def test_anyone_can_comment_to_help(client, user_a, user_b):
    _, token_a = user_a
    _, token_b = user_b
    create = client.post(
        "/api/help", json={"question": "Help please"}, headers=auth_header(token_a)
    )
    post_id = create.get_json()["help_post"]["id"]

    comment = client.post(
        f"/api/help/{post_id}/comments",
        json={"body": "Have you checked the console?"},
        headers=auth_header(token_b),
    )
    assert comment.status_code == 201

    detail = client.get(f"/api/help/{post_id}").get_json()
    assert len(detail["help_post"]["comments"]) == 1
    assert detail["help_post"]["comment_count"] == 1


def test_only_owner_can_mark_resolved(client, user_a, user_b):
    _, token_a = user_a
    _, token_b = user_b
    create = client.post(
        "/api/help", json={"question": "Help please"}, headers=auth_header(token_a)
    )
    post_id = create.get_json()["help_post"]["id"]

    forbidden = client.patch(
        f"/api/help/{post_id}", json={"resolved": True}, headers=auth_header(token_b)
    )
    assert forbidden.status_code == 403

    allowed = client.patch(
        f"/api/help/{post_id}", json={"resolved": True}, headers=auth_header(token_a)
    )
    assert allowed.status_code == 200
    assert allowed.get_json()["help_post"]["resolved"] is True


def test_only_owner_can_delete(client, user_a, user_b):
    _, token_a = user_a
    _, token_b = user_b
    create = client.post(
        "/api/help", json={"question": "Help please"}, headers=auth_header(token_a)
    )
    post_id = create.get_json()["help_post"]["id"]

    forbidden = client.delete(f"/api/help/{post_id}", headers=auth_header(token_b))
    assert forbidden.status_code == 403

    allowed = client.delete(f"/api/help/{post_id}", headers=auth_header(token_a))
    assert allowed.status_code == 200

    assert client.get(f"/api/help/{post_id}").status_code == 404
