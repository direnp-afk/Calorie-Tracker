from backend.app.config import SECRET_KEY, ACCESS_TOKEN_EXPIRES, ALGORITHM
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from datetime import datetime, timedelta



password_context = CryptContext(schemes=["bcrypt"], depreacted="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

