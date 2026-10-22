from fastapi import APIRouter, Depends, status, HTTPException
from typing import List
from sqlalchemy.orm import Session
from backend.app.models import GoalEntry, User
from backend.app.schemas import GoalEntryCreate, GoalEntryResponse
from backend.app.database import get_db
from backend.app.auth import get_current_active_user


router = APIRouter(prefix="/goals", tags=["Nutrition Goals"])


@router.get("/me", response_model=GoalEntryResponse)
def get_goal(current_user:User = Depends(get_current_active_user), db:Session=Depends(get_db)):
    goal = db.query(GoalEntry).filter(GoalEntry.user_id == current_user.id).first()

    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nutrition goals not found")

    return goal


@router.post("/", response_model=GoalEntryResponse)
def create_goal(goal:GoalEntryCreate, current_user:User = Depends(get_current_active_user), db:Session=Depends(get_db)):
    if db.query(GoalEntry).filter(GoalEntry.user_id == current_user.id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Nutrition Goal already exists"
        )

    new_goal = GoalEntry(
        user_id = current_user.id,
        calorie_target = goal.calorie_target,
        protein_target = goal.protein_target,
        carb_target = goal.carb_target,
        fat_target = goal.fat_target
    )
    
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return new_goal


@router.put("/me", response_model=GoalEntryResponse)
def update_goals(goal:GoalEntryCreate, current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):
    db_goal = db.query(GoalEntry).filter(GoalEntry.user_id == current_user.id).first()

    if not db_goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nutrition goal doesnt exist")

    db_goal.calorie_target = goal.calorie_target
    db_goal.protein_target = goal.protein_target
    db_goal.carb_target = goal.carb_target
    db_goal.fat_target = goal.fat_target

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

