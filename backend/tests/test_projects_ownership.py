from tests.conftest import auth_header


def _create_project(client, token, name="My Project"):
    response = client.post(
        "/api/projects",
        json={"name": name, "description": "A test project"},
        headers=auth_header(token),
    )
    return response.get_json()["project"]


def test_owner_can_update_their_own_project(client, user_a):
    user, token = user_a
    project = _create_project(client, token)

    response = client.patch(
        f"/api/projects/{project['id']}",
        json={"name": "Updated Name"},
        headers=auth_header(token),
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data["project"]["name"] == "Updated Name"


def test_owner_can_delete_their_own_project(client, user_a):
    user, token = user_a
    project = _create_project(client, token)

    response = client.delete(f"/api/projects/{project['id']}", headers=auth_header(token))
    assert response.status_code == 200

    get_response = client.get(f"/api/projects/{project['id']}")
    assert get_response.status_code == 404


def test_non_owner_cannot_update_someone_elses_project(client, user_a, user_b):
    _, token_a = user_a
    _, token_b = user_b
    project = _create_project(client, token_a)

    response = client.patch(
        f"/api/projects/{project['id']}",
        json={"name": "Hijacked"},
        headers=auth_header(token_b),
    )

    assert response.status_code == 403
    assert response.get_json()["success"] is False


def test_non_owner_cannot_delete_someone_elses_project(client, user_a, user_b):
    _, token_a = user_a
    _, token_b = user_b
    project = _create_project(client, token_a)

    response = client.delete(f"/api/projects/{project['id']}", headers=auth_header(token_b))
    assert response.status_code == 403

    # project must still exist -- the delete must not have gone through
    get_response = client.get(f"/api/projects/{project['id']}")
    assert get_response.status_code == 200


def test_update_without_token_is_unauthorized(client, user_a):
    _, token_a = user_a
    project = _create_project(client, token_a)

    response = client.patch(f"/api/projects/{project['id']}", json={"name": "No token"})
    assert response.status_code == 401


def test_admin_can_update_any_project(client, user_a, admin_user):
    _, token_a = user_a
    _, admin_token = admin_user
    project = _create_project(client, token_a)

    response = client.patch(
        f"/api/projects/{project['id']}",
        json={"name": "Moderated by admin"},
        headers=auth_header(admin_token),
    )
    assert response.status_code == 200
    assert response.get_json()["project"]["name"] == "Moderated by admin"


def test_admin_can_delete_any_project(client, user_a, admin_user):
    _, token_a = user_a
    _, admin_token = admin_user
    project = _create_project(client, token_a)

    response = client.delete(f"/api/projects/{project['id']}", headers=auth_header(admin_token))
    assert response.status_code == 200


def test_only_owner_can_add_members(client, user_a, user_b):
    _, token_a = user_a
    user_b_profile, token_b = user_b
    project = _create_project(client, token_a)

    response = client.post(
        f"/api/projects/{project['id']}/members",
        json={"user_id": user_b_profile["id"]},
        headers=auth_header(token_b),
    )
    assert response.status_code == 403
