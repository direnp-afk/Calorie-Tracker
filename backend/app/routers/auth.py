from fastapi import HTTPException, APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.auth import get_hashed_pwd
from backend.app.models import User
from backend.app.database import get_db
from backend.app.auth import get_current_active_user
from backend.app.schemas import UserCreate, UserResponse

router = APIRouter(prefix="auth", tags=["Authentication"])

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

