from pydantic import BaseModel, Field


class TopicBase(BaseModel):
    """Base topic schema with common fields."""
    name: str = Field(..., min_length=1, max_length=255)


class TopicCreate(TopicBase):
    """Schema for creating a topic."""
    pass


class TopicUpdate(BaseModel):
    """Schema for updating a topic."""
    name: str | None = Field(None, min_length=1, max_length=255)


class TopicResponse(TopicBase):
    """Complete topic response with database fields."""
    id: int

    class Config:
        from_attributes = True

