from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
USDA_API_KEY = os.getenv("USDA_API_KEY")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not configured")
if not USDA_API_KEY:
    raise RuntimeError("USDA_API_KEY is not configured")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRES =  30


