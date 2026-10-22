from fastapi import HTTPException, status, Depends, APIRouter
from typing import List
from sqlalchemy.orm import Session
from backend.app.models import FoodEntry, User
from backend.app.database import get_db
from backend.app.schemas import FoodEntryCreate, FoodEntryResponse
from backend.app.auth import get_current_active_user
from datetime import date, datetime, timezone, time, timedelta



router = APIRouter(prefix="/food_entries", tags=["Food Entries"])


                   
#returns food entry based on the entry id inputted by user
@router.get("/me", response_model=List[FoodEntryResponse])
def get_food_entries(current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):
    food_entries = db.query(FoodEntry).filter(FoodEntry.user_id == current_user.id).all()
    if not food_entries:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food entries not found")

    return food_entries

@router.get("/{entry_id}", response_model=FoodEntryResponse)
def get_food_entry(entry_id:int, current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):
    food_entry = db.query(FoodEntry).filter(FoodEntry.id == entry_id, FoodEntry.user_id == current_user.id).first()
    if not food_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food entries not found")

    return food_entry


#allows for creating food entries
@router.post("/", response_model=FoodEntryResponse)
def create_food_entry(food_entry:FoodEntryCreate, db:Session=Depends(get_db)):

    new_food_entry = FoodEntry(**food_entry.dict())
    db.add(new_food_entry)
    db.commit()
    db.refresh(new_food_entry)
    return new_food_entry


#allows user to update any food entry based on entry id given it exists
@router.put("/{entry_id}", response_model=FoodEntryResponse)
def update_food_entry(entry_id:int, food_entry:FoodEntryCreate, db:Session=Depends(get_db)):
    db_food_entry = db.query(FoodEntry).filter(FoodEntry.id == entry_id).first()
    if not db_food_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food entry does not exist.")

    for field, value in food_entry.dict().items():
        setattr(db_food_entry, field, value)

    db.commit()
    db.refresh(db_food_entry)
    return db_food_entry


#Lets user delete a food entry only if the food entry currently exists in database
@router.delete("/{entry_id}")
def delete_food_entry(entry_id:int, db:Session=Depends(get_db)):
    entry = db.query(FoodEntry).filter(FoodEntry.id == entry_id).first()

    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="food entry doesnt exist")

    db.delete(entry)
    db.commit()

    return{"message":"Food entry deleted."}



#Allows user to search by meal type if they want to, else it shows all food entries
@router.get("/", response_model=List[FoodEntryResponse])
def get_all_food_entries(of_meal_type:str | None=None, db:Session=Depends(get_db)):
    if of_meal_type:
        return db.query(FoodEntry).filter(FoodEntry.meal_type == of_meal_type.lower().strip())
    else:
        return db.query(FoodEntry).all()
    
    

    

