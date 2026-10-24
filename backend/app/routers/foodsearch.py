import requests
from fastapi import APIRouter, Depends, HTTPException, status, Query
from backend.app.auth import get_current_active_user
from backend.app.models import User
from backend.app.config import USDA_API_KEY



router = APIRouter(prefix="/foods", tags=["Food Search"])

@router.get("/search")
def search_food(query:str, current_user:User = Depends(get_current_active_user)):

    url = "https://api.nal.usda.gov/fdc/v1/foods/search"

    try:
        response = requests.get(
            url,
            params={
                "api_key": USDA_API_KEY,
                "query": query,
                "pageSize": 10
            },
            timeout=10
        )
        response.raise_for_status()

    except requests.RequestException:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Food search unavailable")

    data = response.json()
    foods = []

    for food in data.get("foods", []):
        foods.append({
            "id": food["fdcId"],
            "name": food["description"]
        })

    return foods


@router.get("/{fdc_id}")
def get_food_details(fdc_id:int,quantity_g:float = Query(default=100, gt=0), current_user:User = Depends(get_current_active_user)):

    url = f"https://api.nal.usda.gov/fdc/v1/food/{fdc_id}"

    try:
        response = requests.get(
            url,
            params={"api_key": USDA_API_KEY},
            timeout=10
        )
        if response.status_code == 404:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food not found")

        response.raise_for_status()

    except requests.RequestException:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Food details unavailable")

    food = response.json()

    portions = [{"label": "Grams (g)", "gram_weight": 1}]

    for portion in food.get("foodPortions", []):
        gram_weight = portion.get("gramWeight")

        if gram_weight is None or gram_weight <= 0:
            continue

        label = portion.get("portionDescription") or portion.get("modifier")

        if not label:
            measure = portion.get("measureUnit") or {}
            unit = measure.get("name")
            amount = portion.get("amount", 1)
            label = f"{amount} {unit}" if unit else "Portion"

        portions.append({
            "label": f"{label} ({gram_weight:g} g)",
            "gram_weight": gram_weight
        })


    nutrients = {}
    for item in food.get("foodNutrients", []):
        nutrient_id = item.get("nutrient", {}).get("id")
        amount = item.get("amount")

        if nutrient_id is not None and amount is not None:
            nutrients[nutrient_id] = amount

    #USDA nutrient IDs for calories
    calories = nutrients.get(1008)

    if calories is None:
        calories = nutrients.get(2047)

    if calories is None:
        calories = nutrients.get(2048) 

    multiplier = quantity_g / 100

    #USDA nutrient IDs for macronutrients
    protein = nutrients.get(1003)
    carbs = nutrients.get(1005)
    fats = nutrients.get(1004)


    micronutrient_ids = {
        1079: ("fiber", "g"),
        1087: ("calcium", "mg"),
        1089: ("iron", "mg"),
        1092: ("potassium", "mg"),
        1093: ("sodium", "mg"),
        1162: ("vitamin_c", "mg"),
        1114: ("vitamin_d", "µg")
    }

    micronutrients = {}

    for nutrient_id, (name, unit) in micronutrient_ids.items():
        amount = nutrients.get(nutrient_id)

        if amount is not None:
            micronutrients[name] = {
                "amount": round(amount * multiplier, 2),
                "unit": unit
            }
    
    return {
        "id": food.get("fdcId"),
        "name": food.get("description"),
        "quantity_g": quantity_g,
        "portions": portions,
        "calories": round(calories * multiplier, 1) if calories is not None else None,
        "protein": round(protein * multiplier, 1) if protein is not None else None,
        "carbs": round(carbs * multiplier, 1) if carbs is not None else None,
        "fats": round(fats * multiplier, 1) if fats is not None else None,
        "micronutrients": micronutrients
    }


