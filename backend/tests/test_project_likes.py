from tests.conftest import auth_header


def _create_project(client, token, name="My Project"):
    response = client.post(
        "/api/projects",
        json={"name": name, "description": "A test project"},
        headers=auth_header(token),
    )
    return response.get_json()["project"]


def test_new_project_has_zero_likes_and_tips(client, user_a):
    _, token = user_a
    project = _create_project(client, token)
    assert project["like_count"] == 0
    assert project["tip_count"] == 0
    assert project["liked_by_me"] is False


def test_like_requires_login(client, user_a):
    _, token = user_a
    project = _create_project(client, token)
    response = client.post(f"/api/projects/{project['id']}/like")
    assert response.status_code == 401


def test_like_and_unlike_persists_across_requests(client, user_a, user_b):
    _, token_a = user_a
    _, token_b = user_b
    project = _create_project(client, token_a)

    like = client.post(f"/api/projects/{project['id']}/like", headers=auth_header(token_b))
    like_data = like.get_json()
    assert like.status_code == 200
    assert like_data["liked"] is True
    assert like_data["like_count"] == 1

    # A completely fresh request (not the same response) reflects the like.
    fetched = client.get(f"/api/projects/{project['id']}", headers=auth_header(token_b)).get_json()
    assert fetched["project"]["like_count"] == 1
    assert fetched["project"]["liked_by_me"] is True

    # The owner, who never liked it, sees the count but not liked_by_me.
    owner_view = client.get(f"/api/projects/{project['id']}", headers=auth_header(token_a)).get_json()
    assert owner_view["project"]["like_count"] == 1
    assert owner_view["project"]["liked_by_me"] is False

    # Liking again toggles it off.
    unlike = client.post(f"/api/projects/{project['id']}/like", headers=auth_header(token_b))
    unlike_data = unlike.get_json()
    assert unlike_data["liked"] is False
    assert unlike_data["like_count"] == 0


def test_liking_twice_from_different_users_counts_both(client, user_a, user_b, admin_user):
    _, token_a = user_a
    _, token_b = user_b
    _, token_admin = admin_user
    project = _create_project(client, token_a)

    client.post(f"/api/projects/{project['id']}/like", headers=auth_header(token_b))
    client.post(f"/api/projects/{project['id']}/like", headers=auth_header(token_admin))

    fetched = client.get(f"/api/projects/{project['id']}").get_json()
    assert fetched["project"]["like_count"] == 2


def test_tip_requires_login(client, user_a):
    _, token = user_a
    project = _create_project(client, token)
    response = client.post(f"/api/projects/{project['id']}/tip")
    assert response.status_code == 401


def test_tip_persists_and_can_be_repeated(client, user_a, user_b):
    _, token_a = user_a
    _, token_b = user_b
    project = _create_project(client, token_a)

    first = client.post(f"/api/projects/{project['id']}/tip", headers=auth_header(token_b))
    assert first.get_json()["tip_count"] == 1

    # Unlike likes, tips are a repeatable gesture, not a toggle.
    second = client.post(f"/api/projects/{project['id']}/tip", headers=auth_header(token_b))
    assert second.get_json()["tip_count"] == 2

    fetched = client.get(f"/api/projects/{project['id']}").get_json()
    assert fetched["project"]["tip_count"] == 2


def test_like_nonexistent_project_returns_404(client, user_a):
    _, token = user_a
    response = client.post("/api/projects/999999/like", headers=auth_header(token))
    assert response.status_code == 404
