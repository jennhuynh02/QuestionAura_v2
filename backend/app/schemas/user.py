from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
import re


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_-]+$")

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username format."""
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError("Username can only contain letters, numbers, underscores, and hyphens")
        return v.lower()  # Store usernames in lowercase for consistency


class UserCreate(UserBase):
    """Schema for creating/syncing a user."""
    auth0_id: str = Field(..., min_length=1, max_length=255)


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    username: str | None = Field(None, min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_-]+$")
    email: EmailStr | None = None


class UserResponse(UserCreate):
    """Complete user response with database fields."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True