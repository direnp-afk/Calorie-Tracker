
def test_daily_summary_adds_food(client, make_user):
    headers = make_user()
    goal = {
        "calorie_target": 2400, "protein_target": 150,
        "carb_target": 270, "fat_target": 80,
    }
    client.post("/goals/", json=goal, headers=headers)
    food = {
        "name_of_food": "Toast", "calories": 200,
        "protein": 10, "carbs": 30, "fats": 4,
        "meal_type": "breakfast", "date_logged": "2026-10-24",
    }
    client.post("/food_entries/", json=food, headers=headers)

    response = client.get("/summary/daily?day=2026-10-24", headers=headers)
    assert response.status_code == 200
    assert response.json()["consumed"]["calories"] == 200
    assert response.json()["remaining"]["calories"] == 2200

