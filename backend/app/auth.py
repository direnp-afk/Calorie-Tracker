from backend.app.config import SECRET_KEY, ACCESS_TOKEN_EXPIRES, ALGORITHM
from backend.app.schemas import TokenData
from backend.app.models import User
from backend.app.database import get_db
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import Optional
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from datetime import datetime, timedelta, timezone



password_context = CryptContext(schemes=["bcrypt"], depreacted="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

#checks the password against the hashed version of password
def verify_password(plain_pwd:str, hashed_pwd:str) -> bool:
    return password_context.verify(plain_pwd, hashed_pwd)

def get_hashed_pwd(password:str) -> str:
    return password_context.hash(password)

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

        email:str = payload.get("sub")

        #Rejects tokens that dont identify a user
        if email is None:
            raise HTTPException(
                status_code= status.HTTP_401_UNAUTHORISED,
                detail="Invalid credentials, could not verify",
                headers={"WWW-Authenticate":"Bearer"}
            )
        return TokenData(email=email)
    
    except jwt.PyJWTError:
        raise HTTPException(
            status_code= status.HTTP_401_UNAUTHORISED,
            detail="Invalid credentials, could not verify",
            headers={"WWW-Authenticate":"Bearer"}
        )
    
def get_current_user(token:str = Depends(oauth2_scheme), db:Session = Depends(get_db)):
    token_data = verify_token(token)
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate":"Bearer"}
        )
    return user

