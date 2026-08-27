from fastapi import HTTPException, status, Depends, APIRouter
from typing import List
from sqlalchemy.orm import Session
from backend.app.models import FoodEntry
from backend.app.database import get_db

router = APIRouter(prefix="/food_entries", tags=["Food Entries"])
                   
                   

@router.get("/{entry_id}", response_model=)
def get_food_entry(entry_id:int, db:Session = Depends(get_db)):
    entry = db.query(FoodEntry).filter(FoodEntry.id == entry_id).first()

    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food entry not found")

    return entry


    
