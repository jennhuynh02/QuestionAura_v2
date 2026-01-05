"""
Application constants.
Centralized location for all magic numbers and constant values.
"""

# File Upload Limits
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
MAX_FILE_SIZE_MB = 5

# Allowed image MIME types for uploads
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp"
}

# JWT Token Settings
DEMO_JWT_EXPIRATION_HOURS = 24
JWT_ALGORITHM_HS256 = "HS256"
JWT_ALGORITHM_RS256 = "RS256"

# Rate Limiting
UPLOAD_RATE_LIMIT = "5/minute"
API_RATE_LIMIT_GENERAL = "100/minute"
AUTH_RATE_LIMIT = "10/minute"

# Seed Data ID Ranges
SEED_TOPIC_ID_START = 1
SEED_TOPIC_ID_END = 12
SEED_USER_ID_START = 1
SEED_USER_ID_END = 112
SEED_QUESTION_ID_START = 201
SEED_QUESTION_ID_END = 224
SEED_ANSWER_ID_START = 301
SEED_ANSWER_ID_END = 348

# Demo User
DEMO_USER_AUTH0_ID = "demo-user-12345"
DEMO_USER_EMAIL = "demo@questionaura.com"
DEMO_USER_USERNAME = "demo"

