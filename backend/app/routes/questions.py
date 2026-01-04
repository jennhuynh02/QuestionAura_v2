from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.question import Question
from app.models.topic import Topic
from app.schemas.question import QuestionResponse, QuestionCreate, QuestionUpdate

router = APIRouter(prefix="/questions", tags=["questions"])


@router.get("", response_model=List[QuestionResponse])
async def get_all_questions(
    topic_id: Optional[int] = Query(None, description="Filter by topic ID"),
    asker_id: Optional[int] = Query(None, description="Filter by asker ID"),
    db: Session = Depends(get_db)
):
    """Get all questions with optional filters."""
    query = db.query(Question).options(
        joinedload(Question.topic),
        joinedload(Question.asker)
    )
    
    if topic_id is not None:
        query = query.filter(Question.topic_id == topic_id)
    
    if asker_id is not None:
        query = query.filter(Question.asker_id == asker_id)
    
    questions = query.all()
    return questions


@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question_by_id(
    question_id: int,
    db: Session = Depends(get_db)
):
    """Get question by ID."""
    question = db.query(Question).options(
        joinedload(Question.topic),
        joinedload(Question.asker)
    ).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    return question


@router.post("", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_data: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new question. Requires authentication. asker_id is set from current user."""
    # Verify topic exists
    topic = db.query(Topic).filter(Topic.id == question_data.topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    try:
        question = Question(
            topic_id=question_data.topic_id,
            ask=question_data.ask,
            image_url=question_data.image_url,
            asker_id=current_user.id
        )
        db.add(question)
        db.commit()
        db.refresh(question)
        return question
    except Exception:
        db.rollback()
        raise


@router.put("/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    question_data: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a question. Requires authentication. Only the asker can update."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Ownership check
    if question.asker_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own questions"
        )
    
    try:
        if question_data.topic_id is not None:
            # Verify topic exists
            topic = db.query(Topic).filter(Topic.id == question_data.topic_id).first()
            if not topic:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Topic not found"
                )
            question.topic_id = question_data.topic_id
        
        if question_data.ask is not None:
            question.ask = question_data.ask
        
        if question_data.image_url is not None:
            question.image_url = question_data.image_url
        
        db.commit()
        db.refresh(question)
        return question
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a question. Requires authentication. Only the asker can delete."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Ownership check
    if question.asker_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own questions"
        )
    
    try:
        db.delete(question)
        db.commit()
        return None
    except Exception:
        db.rollback()
        raise

