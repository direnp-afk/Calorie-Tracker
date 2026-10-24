import requests
from fastapi import APIRouter, Depends, HTTPException, status
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
def get_food_details(fdc_id:int, current_user:User = Depends(get_current_active_user)):

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
        raise HTTPException(status_code=502, detail="Food details unavailable")

    food = response.json()
    return {
        "id": food.get("fdcId"),
        "name": food.get("description"),
        "nutrients": food.get("foodNutrients", [])
    }


