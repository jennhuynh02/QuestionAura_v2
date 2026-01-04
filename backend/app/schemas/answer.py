from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

from app.schemas.user import UserResponse
from app.schemas.question import QuestionResponse


class AnswerBase(BaseModel):
    """Base answer schema with common fields."""
    question_id: int
    response: str = Field(..., min_length=1)
    image_url: Optional[str] = Field(None, max_length=500)


class AnswerCreate(AnswerBase):
    """Schema for creating an answer."""
    pass


class AnswerUpdate(BaseModel):
    """Schema for updating an answer."""
    question_id: int | None = None
    response: str | None = Field(None, min_length=1)
    image_url: Optional[str] = Field(None, max_length=500)


class AnswerResponse(AnswerBase):
    """Complete answer response with database fields."""
    id: int
    responder_id: int
    created_at: datetime
    updated_at: datetime
    question: QuestionResponse
    responder: UserResponse

    class Config:
        from_attributes = True

