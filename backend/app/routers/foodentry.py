from fastapi import HTTPException, status, Depends, APIRouter
from typing import List
from sqlalchemy.orm import Session
from backend.app.models import FoodEntry
from backend.app.database import get_db
from backend.app.schemas import FoodEntryCreate, FoodEntryResponse

router = APIRouter(prefix="/food_entries", tags=["Food Entries"])
                   
                   

@router.get("/{entry_id}", response_model=FoodEntryResponse)
def get_food_entry(entry_id:int, db:Session = Depends(get_db)):
    entry = db.query(FoodEntry).filter(FoodEntry.id == entry_id).first()

    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food entry not found")

    return entry


@router.post("/")
def create_food_entry(food_entry:FoodEntryCreate, db:Session=Depends(get_db)):

    new_food_entry = FoodEntry(**food_entry.dict())
    db.add(new_food_entry)
    db.commit()
    db.refresh(new_food_entry)
    return new_food_entry



    
