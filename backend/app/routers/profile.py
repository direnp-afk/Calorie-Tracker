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


@router.put("/me", response_model=UserProfileResponse)
def update_user_profile(upd_profile:UserProfileCreate, current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):
    user_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User Profile not found"
        )

    user_profile.age = upd_profile.age
    user_profile.gender = upd_profile.gender
    user_profile.weight_kg = upd_profile.weight_kg
    user_profile.height_cm = upd_profile.height_cm
    user_profile.activity_level = upd_profile.activity_level
    user_profile.fitness_goal = upd_profile.fitness_goal

    db.commit()
    db.refresh(user_profile)

    return user_profile


