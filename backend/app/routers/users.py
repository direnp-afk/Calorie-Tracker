from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.schemas import UserResponse, UserUpdate
from backend.app.auth import get_current_active_user
from backend.app.models import User
from sqlalchemy.orm import Session
from backend.app.database import get_db

router = APIRouter(prefix="/users", list=["Users"])

@router.get("/me", response_model=UserResponse)
def get_user(current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user(upd_user:UserUpdate, current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):
    pass

    