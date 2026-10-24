
GOAL = {
    "calorie_target": 2400,
    "protein_target": 150,
    "carb_target": 270,
    "fat_target": 80,
}


def test_create_goal(client, make_user):
    headers = make_user()
    response = client.post("/goals/", json=GOAL, headers=headers)
    assert response.status_code == 200

    response = client.get("/goals/me", headers=headers)
    assert response.json()["calorie_target"] == 2400


def test_goal_macros_must_match_calories(client, make_user):
    headers = make_user()
    invalid_goal = {**GOAL, "protein_target": 10}
    response = client.post("/goals/", json=invalid_goal, headers=headers)
    assert response.status_code == 422


def test_unsafe_calorie_recommendation_rejected(client, make_user):
    headers = make_user()
    profile = {
        "gender": "male", "age": 25, "weight_kg": 70, "height_cm": 175,
        "activity_level": "sedentary", "fitness_goal": "lose",
        "goal_weight_kg": 60, "weekly_weight_change_kg": "1.0",
    }
    assert client.post("/profile/me", json=profile, headers=headers).status_code == 200

    response = client.get("/goals/recommendation", headers=headers)
    assert response.status_code == 422

