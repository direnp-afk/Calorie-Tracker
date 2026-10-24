
def test_create_profile(client, make_user):
    headers = make_user()
    profile = {
        "gender": "female", "age": 22, "weight_kg": 65, "height_cm": 165,
        "activity_level": "lightly_active", "fitness_goal": "maintain",
    }
    response = client.post("/profile/me", json=profile, headers=headers)
    assert response.status_code == 200
    assert response.json()["weight_kg"] == 65

