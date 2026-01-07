from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
import os

router = APIRouter(prefix="/auth", tags=["auth"])


class DemoLoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/demo-login", response_model=DemoLoginResponse)
async def demo_login(db: Session = Depends(get_db)):
    """
    Demo login endpoint that returns a JWT token for the demo user.
    This bypasses Auth0 for demo purposes only.
    """
    # Find the demo user
    demo_user = db.query(User).filter(User.auth0_id == "demo-user-12345").first()
    
    if not demo_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo user not found. Please run database migrations."
        )
    
    # Generate a JWT token that mimics Auth0's token structure
    # but is signed with our own secret for demo purposes
    secret_key = os.getenv("DEMO_JWT_SECRET", "demo-secret-key-change-in-production")
    
    # Create token payload similar to Auth0
    payload = {
        "sub": demo_user.auth0_id,
        "email": demo_user.email,
        "aud": os.getenv("AUTH0_API_AUDIENCE", ""),
        "iss": "questionaura-demo",
        "exp": datetime.utcnow() + timedelta(hours=24),
        "iat": datetime.utcnow(),
        "demo": True  # Mark this as a demo token
    }
    
    # Sign the token
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    
    return {
        "access_token": token,
        "token_type": "Bearer",
        "user": {
            "id": demo_user.id,
            "auth0_id": demo_user.auth0_id,
            "email": demo_user.email,
            "first_name": demo_user.first_name,
            "last_name": demo_user.last_name
        }
    }


