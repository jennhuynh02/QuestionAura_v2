from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

from app.schemas.user import UserResponse
from app.schemas.topic import TopicResponse


class QuestionBase(BaseModel):
    """Base question schema with common fields."""
    topic_id: int
    ask: str = Field(..., min_length=1)
    image_url: Optional[str] = Field(None, max_length=500)


class QuestionCreate(QuestionBase):
    """Schema for creating a question."""
    pass


class QuestionUpdate(BaseModel):
    """Schema for updating a question."""
    topic_id: int | None = None
    ask: str | None = Field(None, min_length=1)
    image_url: Optional[str] = Field(None, max_length=500)


class QuestionResponse(QuestionBase):
    """Complete question response with database fields."""
    id: int
    asker_id: int
    created_at: datetime
    updated_at: datetime
    topic: TopicResponse
    asker: UserResponse

    class Config:
        from_attributes = True

