from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.models import UserProfile, User
from backend.app.schemas import UserProfileCreate, UserProfileResponse
from backend.app.auth import get_current_active_user, get_db



router = APIRouter(prefix="/profile", tags=["User_Profile"])


@router.post("/me", response_model=UserProfileResponse)
def create_user_profile(user_profile:UserProfileCreate, current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):
    if db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists"
        )

    new_profile = UserProfile(
        user_id = current_user.id,
        gender = user_profile.gender,
        age = user_profile.age,
        weight_kg = user_profile.weight_kg,
        height_cm = user_profile.height_cm,
        activity_level = user_profile.activity_level,
        fitness_goal = user_profile.fitness_goal
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile