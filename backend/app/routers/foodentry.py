from fastapi import HTTPException, status, Depends, APIRouter
from typing import List
from sqlalchemy.orm import Session
from backend.app.models import FoodEntry, User
from backend.app.database import get_db
from backend.app.schemas import FoodEntryCreate, FoodEntryResponse, FoodEntryFromSearch, FoodQuantityUpdate
from backend.app.auth import get_current_active_user
from backend.app.routers.foodsearch import get_usda_food_details
from datetime import date, datetime, timezone, time, timedelta


router = APIRouter(prefix="/food_entries", tags=["Food Entries"])

                   

@router.get("/me", response_model=List[FoodEntryResponse])
def get_all_food_entries(day: date | None = None, current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):

    selected_day = day or datetime.now(timezone.utc).date()
    start = datetime.combine(selected_day, time.min, tzinfo=timezone.utc)
    end = start + timedelta(days=1)
     
    food_entries = db.query(FoodEntry).filter(
        FoodEntry.user_id == current_user.id,
        FoodEntry.time_created >= start, FoodEntry.time_created < end
        ).all()

    return food_entries

@router.get("/{entry_id}", response_model=FoodEntryResponse)
def get_food_entry(entry_id:int, current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):
    food_entry = db.query(FoodEntry).filter(FoodEntry.id == entry_id, FoodEntry.user_id == current_user.id).first()
    if not food_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food entries not found")

    return food_entry


@router.post("/", response_model=FoodEntryResponse)
def create_food_entry(food_entry:FoodEntryCreate, current_user:User = Depends(get_current_active_user), db:Session=Depends(get_db)):

    selected_day = food_entry.date_logged or datetime.now(timezone.utc).date()

    new_food_entry = FoodEntry(
        user_id = current_user.id,
        name_of_food = food_entry.name_of_food,
        calories = food_entry.calories,
        protein = food_entry.protein,
        carbs = food_entry.carbs,
        fats = food_entry.fats,
        meal_type = food_entry.meal_type,
        date_logged = selected_day
    )
    db.add(new_food_entry)
    db.commit()
    db.refresh(new_food_entry)
    return new_food_entry



@router.post("/from-search", response_model=FoodEntryResponse, status_code=status.HTTP_201_CREATED)
def create_food_from_search(food:FoodEntryFromSearch, current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):

    selected_day = food.date_logged or datetime.now(timezone.utc).date()

    food_details = get_usda_food_details(food.fdc_id, food.quantity_g)

    if any(food_details[nutrient] is None for nutrient in ("calories", "protein", "carbs", "fats")):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Nutritional information is incomplete for this food"
        )

    new_food_entry = FoodEntry(
        user_id = current_user.id,
        name_of_food = food_details["name"],
        calories = round(food_details["calories"]),
        protein = food_details["protein"],
        carbs = food_details["carbs"],
        fats = food_details["fats"],
        meal_type = food.meal_type,
        fdc_id = food.fdc_id,
        quantity_g = food.quantity_g,
        date_logged = selected_day
    )

    db.add(new_food_entry)
    db.commit()
    db.refresh(new_food_entry)

    return new_food_entry


@router.patch("/{entry_id}/quantity", response_model=FoodEntryResponse)
def update_food_quantity(entry_id:int, food:FoodQuantityUpdate, current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):

    db_food_entry = db.query(FoodEntry).filter(FoodEntry.id == entry_id,FoodEntry.user_id == current_user.id).first()

    if not db_food_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food entry not found")

    if db_food_entry.fdc_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity can only be updated for USDA foods")

    food_details = get_usda_food_details(db_food_entry.fdc_id, food.quantity_g)

    if any(food_details[nutrient] is None for nutrient in ("calories", "protein", "carbs", "fats")):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Nutritional information is incomplete")

    db_food_entry.quantity_g = food.quantity_g
    db_food_entry.calories = round(food_details["calories"])
    db_food_entry.protein = food_details["protein"]
    db_food_entry.carbs = food_details["carbs"]
    db_food_entry.fats = food_details["fats"]

    db.commit()
    db.refresh(db_food_entry)
    return db_food_entry


#allows currently logged in user to update any food entry based on entry_id
@router.put("/{entry_id}", response_model=FoodEntryResponse)
def update_food_entry(entry_id:int, food_entry:FoodEntryCreate, current_user:User = Depends(get_current_active_user), db:Session=Depends(get_db)):
    db_food_entry = db.query(FoodEntry).filter(FoodEntry.id == entry_id, FoodEntry.user_id == current_user.id).first()
    if not db_food_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food entry does not exist.")

    if db_food_entry.fdc_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use the quantity endpoint to update USDA foods"
        )

    db_food_entry.name_of_food = food_entry.name_of_food
    db_food_entry.calories = food_entry.calories
    db_food_entry.protein = food_entry.protein
    db_food_entry.carbs = food_entry.carbs
    db_food_entry.fats = food_entry.fats
    db_food_entry.meal_type = food_entry.meal_type

    db.commit()
    db.refresh(db_food_entry)
    return db_food_entry


#Lets user delete a food entry belonging to the currently logged in user
@router.delete("/{entry_id}")
def delete_food_entry(entry_id:int, current_user:User = Depends(get_current_active_user), db:Session=Depends(get_db)):
    entry = db.query(FoodEntry).filter(FoodEntry.id == entry_id, FoodEntry.user_id == current_user.id).first()

    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="food entry doesnt exist")

    db.delete(entry)
    db.commit()

    return{"message":"Food entry deleted."}



    

    

