from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import verify_token
from app.models.user import User


async def get_current_user(
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from database.
    
    Args:
        payload: JWT payload from Auth0 (contains 'sub' claim)
        db: Database session
    
    Returns:
        User: Authenticated user object
    
    Raises:
        HTTPException: 404 if user doesn't exist in database
    """
    auth0_id = payload["sub"]
    
    user = db.query(User).filter(User.auth0_id == auth0_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please sync your account."
        )
    
    return user
