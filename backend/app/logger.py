"""
Structured logging configuration for the application.
"""
import logging
import sys
from datetime import datetime
from app.config import settings


def setup_logger(name: str = "questionaura") -> logging.Logger:
    """
    Set up and configure a logger.
    
    Args:
        name: Name of the logger
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    # Set log level based on environment
    if settings.ENVIRONMENT == "development":
        logger.setLevel(logging.DEBUG)
    elif settings.ENVIRONMENT == "production":
        logger.setLevel(logging.INFO)
    else:
        logger.setLevel(logging.WARNING)
    
    # Avoid duplicate handlers
    if logger.handlers:
        return logger
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    
    # Create formatter
    if settings.ENVIRONMENT == "development":
        # Detailed format for development
        formatter = logging.Formatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    else:
        # Structured format for production (JSON-like)
        formatter = logging.Formatter(
            fmt='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
            datefmt='%Y-%m-%dT%H:%M:%S'
        )
    
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger


# Create default logger
logger = setup_logger()


def log_error(context: str, error: Exception) -> None:
    """
    Log an error with context.
    
    Args:
        context: Context where the error occurred
        error: The exception that was raised
    """
    logger.error(f"{context}: {type(error).__name__} - {str(error)}")


def log_warning(message: str) -> None:
    """Log a warning message."""
    logger.warning(message)


def log_info(message: str) -> None:
    """Log an info message."""
    logger.info(message)


def log_debug(message: str) -> None:
    """Log a debug message."""
    logger.debug(message)

