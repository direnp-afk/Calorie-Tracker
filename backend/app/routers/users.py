from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.schemas import UserResponse, UserUpdate, PasswordChange
from backend.app.auth import get_current_active_user, verify_password, get_hashed_pwd
from backend.app.models import User
from sqlalchemy.orm import Session
from backend.app.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_user(current_user:User = Depends(get_current_active_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_user_email(upd_user:UserUpdate, current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):
    #Prevent email conflicts while excluding the current users account
    if db.query(User).filter(User.email == upd_user.email, User.id != current_user.id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered"
        )

    current_user.email = upd_user.email
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/change-password")
def update_user_password(password_data:PasswordChange, current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password does not match"
        )

    if verify_password(password_data.new_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot be the same as current password"
        )
    
    hashed_pwd = get_hashed_pwd(password_data.new_password)
    current_user.hashed_password = hashed_pwd
    db.commit()
    return {"Message":"Password has been Changed"}

@router.delete("/me")
def delete_user(current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()

    return {"Message":"User has been deleted"}

    