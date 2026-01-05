"""
Custom exception classes for the application.
"""


class QuestionAuraException(Exception):
    """Base exception for QuestionAura application."""
    pass


class ConfigurationError(QuestionAuraException):
    """Raised when there's a configuration error."""
    pass


class DatabaseError(QuestionAuraException):
    """Raised when there's a database error."""
    pass


class UploadException(QuestionAuraException):
    """Raised when file upload fails."""
    pass


class ValidationError(QuestionAuraException):
    """Raised when validation fails."""
    pass


class AuthenticationError(QuestionAuraException):
    """Raised when authentication fails."""
    pass


class AuthorizationError(QuestionAuraException):
    """Raised when authorization fails."""
    pass


class ResourceNotFoundError(QuestionAuraException):
    """Raised when a requested resource is not found."""
    pass


class ResourceConflictError(QuestionAuraException):
    """Raised when a resource already exists or conflicts."""
    pass

