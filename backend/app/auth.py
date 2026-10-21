from backend.app.config import SECRET_KEY, ACCESS_TOKEN_EXPIRES, ALGORITHM
from backend.app.schemas import TokenData
from backend.app.models import User
from backend.app.database import get_db
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from typing import Optional
from fastapi.security import OAuth2PasswordBearer
import jwt
from datetime import datetime, timedelta, timezone



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
password_hash = PasswordHash.recommended()


#checks the password against the hashed version of password
def verify_password(plain_pwd:str, hashed_pwd:str) -> bool:
    return password_hash.verify(plain_pwd, hashed_pwd)

def get_hashed_pwd(password:str) -> str:
    return password_hash.hash(password)

def create_access_token(data:dict, expires_delta: Optional[timedelta] = None):
    #Copy the claims to avoid modifying the original dictionary
    to_encode = data.copy()
    if expires_delta:
        expires = datetime.now(timezone.utc) + expires_delta
    else:
        expires = datetime.now(timezone.utc) + timedelta(minutes=15)

    #add JWT expiry claim so expired tokens are rejected
    to_encode.update({"exp":expires})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token:str) -> TokenData:
    try:
        #Verify the JWT signature and expiry before trusting its payload
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id:str | None = payload.get("sub")

        #Rejects tokens that dont identify a user
        if user_id is None:
            raise HTTPException(
                status_code= status.HTTP_401_UNAUTHORISED,
                detail="Invalid credentials, could not verify",
                headers={"WWW-Authenticate":"Bearer"}
            )
        return TokenData(user_id=int(user_id))
    
    except (jwt.PyJWTError, TypeError, ValueError):
        raise HTTPException(
            status_code= status.HTTP_401_UNAUTHORISED,
            detail="Invalid credentials, could not verify",
            headers={"WWW-Authenticate":"Bearer"}
        )
    
def get_current_user(token:str = Depends(oauth2_scheme), db:Session = Depends(get_db)):
    token_data = verify_token(token)
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate":"Bearer"}
        )
    return user

def get_current_active_user(current_user:User = Depends(get_current_user)):
    if not current_user.is_user_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inactive User"
        )
    return current_user