from fastapi import APIRouter, Depends, status, HTTPException
from typing import List
from sqlalchemy.orm import Session
from backend.app.models import GoalEntry, User, UserProfile
from backend.app.schemas import GoalEntryCreate, GoalEntryResponse, GoalRecommendationResponse
from backend.app.database import get_db
from backend.app.auth import get_current_active_user
from backend.app.services.nutrition import calculate_calorie_target, calculate_macros, calculate_rmr, calculate_tdee, estimate_goal_date


router = APIRouter(prefix="/goals", tags=["Nutrition Goals"])


@router.get("/me", response_model=GoalEntryResponse)
def get_goal(current_user:User = Depends(get_current_active_user), db:Session=Depends(get_db)):
    goal = db.query(GoalEntry).filter(GoalEntry.user_id == current_user.id).first()

    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nutrition goals not found")

    return goal


@router.post("/", response_model=GoalEntryResponse)
@router.post("", response_model=GoalEntryResponse, include_in_schema=False)
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


@router.get("/recommendation", response_model=GoalRecommendationResponse)
def get_goal_recommendation(current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")

    if profile.gender not in ("male", "female") or profile.age < 18:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Automatic calculation unavailable for this profile"
        )

    rmr = calculate_rmr(profile.weight_kg, profile.height_cm, profile.age, profile.gender)

    tdee = calculate_tdee(rmr, profile.activity_level)

    calorie_target = round(calculate_calorie_target(
        profile.fitness_goal, tdee, profile.weekly_weight_change_kg
    ))

    if calorie_target <= 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid calorie target")

    if profile.fitness_goal == "lose":
        if calorie_target < 1200 or tdee - calorie_target > 750:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Calorie target is too low or weight loss is too aggressive. Choose a slower weekly rate."
            )

    elif profile.fitness_goal == "gain":
        if calorie_target > tdee * 1.2:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Calorie surplus is too high. Choose a slower weekly rate."
            )

    macros = calculate_macros(calorie_target)

    estimated_date = estimate_goal_date(
        profile.weight_kg,
        profile.goal_weight_kg,
        profile.weekly_weight_change_kg,
        profile.fitness_goal
    )

    return {
        "calorie_target": calorie_target,
        "protein_target": macros["protein_target"],
        "carb_target": macros["carb_target"],
        "fat_target": macros["fat_target"],
        "estimated_goal_date": estimated_date
    }

