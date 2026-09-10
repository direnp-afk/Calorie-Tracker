from fastapi import APIRouter, Depends, status, HTTPException
from typing import List
from sqlalchemy.orm import Session
from backend.app.models import GoalEntry
from backend.app.schemas import GoalEntryCreate, GoalEntryResponse
from backend.app.database import get_db

router = APIRouter(prefix="/goals", tags=["Nutrition Goals"])


@router.get("/{goal_id}", response_model=GoalEntryResponse)
def get_goal(goal_id:int, db:Session=Depends(get_db)):
    goal = db.query(GoalEntry).filter(GoalEntry.id == goal_id).first()

    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nutrition goals not found")

    return goal


@router.post("/", response_model=GoalEntryResponse)
def create_goal(goal:GoalEntryCreate, db:Session=Depends(get_db)):

    new_goal = GoalEntry(**goal.dict())
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return new_goal


@router.put("/{goal_id}", response_model=GoalEntryResponse)
def update_goals(goal_id:int, goal:GoalEntryCreate, db:Session = Depends(get_db)):
    db_goal = db.query(GoalEntry).filter(GoalEntry.id == goal_id).first()

    if not db_goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nutrition goal doesnt exist")

    for field, value in goal.dict().items():
        setattr(db_goal, field, value)

    db.commit()
    db.refresh(db_goal)

    return db_goal


@router.delete("/{goal_id}")
def delete_goals(goal_id:int, db:Session = Depends(get_db)):
    goal = db.query(GoalEntry).filter(GoalEntry.id == goal_id).first()

    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goals not found")

    db.delete(goal)
    db.commit()

    return{"message":"goals have been deleted"}

@router.get("/", response_model=List[GoalEntryResponse])
def get_all_goals(db:Session = Depends(get_db)):
    all_goals = db.query(GoalEntry).all()

    return all_goals

