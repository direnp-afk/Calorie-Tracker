from fastapi import HTTPException, APIRouter, Depends
from backend.app.models import User
from backend.app.auth import get_current_active_user
router = APIRouter(prefix="auth", tags=["Authentication"])

@router.get("/verify-token")
def verify_token_endpoint(current_user:User = Depends(get_current_active_user)):
    return {
        "valid":True,
        "user":{
            "id":current_user.id,
            "email":current_user.email
        }
    }

