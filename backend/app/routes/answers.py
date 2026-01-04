from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.answer import Answer
from app.models.question import Question
from app.schemas.answer import AnswerResponse, AnswerCreate, AnswerUpdate

router = APIRouter(prefix="/answers", tags=["answers"])


@router.get("", response_model=List[AnswerResponse])
async def get_all_answers(
    question_id: Optional[int] = Query(None, description="Filter by question ID"),
    db: Session = Depends(get_db)
):
    """Get all answers with optional filter."""
    query = db.query(Answer).options(
        joinedload(Answer.question).joinedload(Question.topic),
        joinedload(Answer.question).joinedload(Question.asker),
        joinedload(Answer.responder)
    )
    
    if question_id is not None:
        query = query.filter(Answer.question_id == question_id)
    
    answers = query.all()
    return answers


@router.get("/{answer_id}", response_model=AnswerResponse)
async def get_answer_by_id(
    answer_id: int,
    db: Session = Depends(get_db)
):
    """Get answer by ID."""
    answer = db.query(Answer).options(
        joinedload(Answer.question).joinedload(Question.topic),
        joinedload(Answer.question).joinedload(Question.asker),
        joinedload(Answer.responder)
    ).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    return answer


@router.post("", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
async def create_answer(
    answer_data: AnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new answer. Requires authentication. responder_id is set from current user."""
    # Verify question exists
    question = db.query(Question).filter(Question.id == answer_data.question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    try:
        answer = Answer(
            question_id=answer_data.question_id,
            response=answer_data.response,
            image_url=answer_data.image_url,
            responder_id=current_user.id
        )
        db.add(answer)
        db.commit()
        db.refresh(answer)
        return answer
    except Exception:
        db.rollback()
        raise


@router.put("/{answer_id}", response_model=AnswerResponse)
async def update_answer(
    answer_id: int,
    answer_data: AnswerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an answer. Requires authentication. Only the responder can update."""
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Ownership check
    if answer.responder_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own answers"
        )
    
    try:
        if answer_data.question_id is not None:
            # Verify question exists
            question = db.query(Question).filter(Question.id == answer_data.question_id).first()
            if not question:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Question not found"
                )
            answer.question_id = answer_data.question_id
        
        if answer_data.response is not None:
            answer.response = answer_data.response
        
        if answer_data.image_url is not None:
            answer.image_url = answer_data.image_url
        
        db.commit()
        db.refresh(answer)
        return answer
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise


@router.delete("/{answer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_answer(
    answer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an answer. Requires authentication. Only the responder can delete."""
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Ownership check
    if answer.responder_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own answers"
        )
    
    try:
        db.delete(answer)
        db.commit()
        return None
    except Exception:
        db.rollback()
        raise

