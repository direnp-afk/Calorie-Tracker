from backend.app.routers import foodentry

FOOD = {
    "name_of_food": "Toast", "calories": 200,
    "protein": 10, "carbs": 30, "fats": 4,
    "meal_type": "breakfast", "date_logged": "2026-10-24",
}


def test_log_and_read_food_for_a_day(client, make_user):
    headers = make_user()
    response = client.post("/food_entries/", json=FOOD, headers=headers)
    assert response.status_code == 200

    diary = client.get("/food_entries/me?day=2026-10-24", headers=headers)
    assert diary.status_code == 200
    assert len(diary.json()) == 1
    assert diary.json()[0]["name_of_food"] == "Toast"

    