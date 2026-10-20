from fastapi import HTTPException, APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.app.auth import get_hashed_pwd
from backend.app.models import User
from backend.app.config import ACCESS_TOKEN_EXPIRES
from backend.app.database import get_db
from backend.app.auth import get_current_active_user, create_access_token, verify_password
from backend.app.schemas import UserCreate, UserResponse, Token
from datetime import timedelta


router = APIRouter(prefix="auth", tags=["Authentication"])


@router.post("/token", response_model=Token)
def login_for_token_access(form_data: OAuth2PasswordRequestForm = Depends(), db:Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wrong Information"
        )

    if not user.is_user_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is inactive."
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRES)
    access_token = create_access_token(data={"sub":user.email}, expires_delta=access_token_expires)
    return{"access_token":access_token, "token_type":"bearer"}


@router.post("/register", response_model=UserResponse)
def register_user(user:UserCreate, db:Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User already exists"
        )

    hashed_password = get_hashed_pwd(user.password)
    db_user = User(
        email = user.email,
        hashed_pwd = hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/verify-token")
def verify_token_endpoint(current_user:User = Depends(get_current_active_user)):
    return {
        "valid":True,
        "user":{
            "id":current_user.id,
            "email":current_user.email
        }
    }

