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
    Requires user data in request body including username.
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
            # Check if username is already taken
            existing_username = db.query(User).filter(User.username == user_data.username).first()
            if existing_username:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username is already taken"
                )
            
            # Create new user
            user = User(
                auth0_id=user_data.auth0_id,
                username=user_data.username,
                email=user_data.email
            )
            db.add(user)
        else:
            # Update existing user (but never change username)
            user.email = user_data.email
            # Note: username cannot be changed after creation
        
        db.commit()
        db.refresh(user)
        return user
        
    except IntegrityError as e:
        db.rollback()
        # Handle unique constraint violations
        if "username" in str(e.orig):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username is already taken"
            )
        elif "email" in str(e.orig):
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
