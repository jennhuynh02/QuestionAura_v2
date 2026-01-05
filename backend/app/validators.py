"""
Input validation and sanitization utilities.
"""
import re
from typing import Optional
from app.exceptions import ValidationError


def sanitize_text(text: str, max_length: Optional[int] = None) -> str:
    """
    Sanitize text input by removing potentially harmful characters.
    
    Args:
        text: Input text to sanitize
        max_length: Optional maximum length
        
    Returns:
        Sanitized text
    """
    if not text:
        return ""
    
    # Remove leading/trailing whitespace
    sanitized = text.strip()
    
    # Truncate if max_length specified
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized


def validate_username(username: str) -> str:
    """
    Validate and sanitize username.
    
    Args:
        username: Username to validate
        
    Returns:
        Validated username
        
    Raises:
        ValidationError: If username is invalid
    """
    if not username:
        raise ValidationError("Username is required")
    
    username = username.strip().lower()
    
    # Check length
    if len(username) < 3:
        raise ValidationError("Username must be at least 3 characters long")
    if len(username) > 20:
        raise ValidationError("Username must be at most 20 characters long")
    
    # Check format (alphanumeric, underscore, hyphen only)
    if not re.match(r'^[a-z0-9_-]+$', username):
        raise ValidationError(
            "Username can only contain lowercase letters, numbers, underscores, and hyphens"
        )
    
    return username


def validate_email(email: str) -> str:
    """
    Validate email format.
    
    Args:
        email: Email to validate
        
    Returns:
        Validated email
        
    Raises:
        ValidationError: If email is invalid
    """
    if not email:
        raise ValidationError("Email is required")
    
    email = email.strip().lower()
    
    # Basic email format validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise ValidationError("Invalid email format")
    
    if len(email) > 255:
        raise ValidationError("Email is too long")
    
    return email


def validate_question_text(question: str) -> str:
    """
    Validate and sanitize question text.
    
    Args:
        question: Question text to validate
        
    Returns:
        Validated question
        
    Raises:
        ValidationError: If question is invalid
    """
    if not question:
        raise ValidationError("Question is required")
    
    question = sanitize_text(question)
    
    if len(question) < 10:
        raise ValidationError("Question must be at least 10 characters long")
    if len(question) > 5000:
        raise ValidationError("Question is too long (max 5000 characters)")
    
    return question


def validate_answer_text(answer: str) -> str:
    """
    Validate and sanitize answer text.
    
    Args:
        answer: Answer text to validate
        
    Returns:
        Validated answer
        
    Raises:
        ValidationError: If answer is invalid
    """
    if not answer:
        raise ValidationError("Answer is required")
    
    answer = sanitize_text(answer)
    
    if len(answer) < 10:
        raise ValidationError("Answer must be at least 10 characters long")
    if len(answer) > 10000:
        raise ValidationError("Answer is too long (max 10000 characters)")
    
    return answer


def validate_url(url: str) -> str:
    """
    Validate URL format.
    
    Args:
        url: URL to validate
        
    Returns:
        Validated URL
        
    Raises:
        ValidationError: If URL is invalid
    """
    if not url:
        return ""
    
    url = url.strip()
    
    # Check if it starts with http:// or https://
    if not url.startswith(('http://', 'https://')):
        raise ValidationError("URL must start with http:// or https://")
    
    if len(url) > 2000:
        raise ValidationError("URL is too long")
    
    return url

