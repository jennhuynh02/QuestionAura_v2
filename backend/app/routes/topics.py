from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.topic import Topic
from app.schemas.topic import TopicResponse, TopicCreate, TopicUpdate

router = APIRouter(prefix="/topics", tags=["topics"])


@router.get("", response_model=List[TopicResponse])
async def get_all_topics(
    db: Session = Depends(get_db)
):
    """Get all topics."""
    topics = db.query(Topic).all()
    return topics


@router.get("/{topic_id}", response_model=TopicResponse)
async def get_topic_by_id(
    topic_id: int,
    db: Session = Depends(get_db)
):
    """Get topic by ID."""
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    return topic


@router.post("", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
async def create_topic(
    topic_data: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new topic. Requires authentication."""
    try:
        topic = Topic(name=topic_data.name)
        db.add(topic)
        db.commit()
        db.refresh(topic)
        return topic
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Topic name already exists"
        )
    except Exception:
        db.rollback()
        raise


@router.put("/{topic_id}", response_model=TopicResponse)
async def update_topic(
    topic_id: int,
    topic_data: TopicUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a topic. Requires authentication."""
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    try:
        if topic_data.name is not None:
            topic.name = topic_data.name
        db.commit()
        db.refresh(topic)
        return topic
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Topic name already exists"
        )
    except Exception:
        db.rollback()
        raise


@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a topic. Requires authentication."""
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    try:
        db.delete(topic)
        db.commit()
        return None
    except Exception:
        db.rollback()
        raise

