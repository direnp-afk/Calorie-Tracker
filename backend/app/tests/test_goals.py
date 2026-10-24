
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

    