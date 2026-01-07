from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.auth import verify_token
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserCreate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user


@router.post("/sync", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def sync_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token)
):
    """
    Sync or create user from Auth0 authentication.
    Requires user data in request body including first_name and last_name.
    """
    # Security: Ensure token matches the user being synced
    if user_data.auth0_id != payload["sub"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid authentication credentials"
        )

    try:
        # Check if user exists by auth0_id
        user = db.query(User).filter(User.auth0_id == user_data.auth0_id).first()
        
        if not user:
            # Create new user
            user = User(
                auth0_id=user_data.auth0_id,
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                email=user_data.email
            )
            db.add(user)
        else:
            # Update existing user
            user.email = user_data.email
            user.first_name = user_data.first_name
            user.last_name = user_data.last_name
        
        db.commit()
        db.refresh(user)
        return user
        
    except IntegrityError as e:
        db.rollback()
        # Handle unique constraint violations
        if "email" in str(e.orig):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered"
            )
        raise
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
