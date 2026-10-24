

def test_register_and_login(client):
    response = client.post(
        "/auth/register",
        json={"email": "testuser2@example.test", "password": "TestPassword123"},
    )
    assert response.status_code == 200
    assert "hashed_password" not in response.json()

    response = client.post(
        "/auth/token",
        data={"username": "testuser2@example.test", "password": "TestPassword123"},
    )
    assert response.status_code == 200
    assert response.json()["access_token"]

