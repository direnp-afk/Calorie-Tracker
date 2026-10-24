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


def test_users_cannot_read_each_others_food(client, make_user):
    testuser1 = make_user("testuser1@example.test")
    testuser2 = make_user("testuser2@example.test")
    entry = client.post("/food_entries/", json=FOOD, headers=testuser1).json()

    response = client.get(f"/food_entries/{entry['id']}", headers=testuser2)
    assert response.status_code == 404


def test_usda_food_quantity_changes_macros(client, make_user, monkeypatch):
    headers = make_user()

    #Fake USDA data, no API key or internet request is used
    def fake_usda_details(fdc_id, quantity_g):
        multiplier = quantity_g / 100
        return {
            "name": "Banana", "calories": 100 * multiplier,
            "protein": 2 * multiplier, "carbs": 20 * multiplier,
            "fats": 1 * multiplier,
        }

    monkeypatch.setattr(foodentry, "get_usda_food_details", fake_usda_details)

    response = client.post(
        "/food_entries/from-search",
        json={"fdc_id": 123, "quantity_g": 100, "meal_type": "snacks"},
        headers=headers,
    )
    assert response.status_code == 201
    entry_id = response.json()["id"]

    response = client.patch(
        f"/food_entries/{entry_id}/quantity",
        json={"quantity_g": 200}, headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["calories"] == 200
    assert response.json()["carbs"] == 40