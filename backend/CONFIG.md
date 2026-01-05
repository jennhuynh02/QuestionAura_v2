# Backend Configuration Guide

This document explains how to configure the QuestionAura backend application.

## Environment Variables

All configuration is managed through environment variables defined in a `.env` file. A template is provided in `.env.example`.

### Required Configuration

These environment variables **MUST** be set. The application will fail to start if any are missing.

#### Database

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/questionaura_dev
```

PostgreSQL database connection URL.

#### Auth0 Configuration

```bash
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_API_AUDIENCE=your-api-audience
```

Your Auth0 domain and API audience identifier. These are required for JWT token validation.

#### Demo JWT Secret

```bash
DEMO_JWT_SECRET=your-secure-secret-key-minimum-32-characters
```

Secret key for signing demo JWT tokens. **Must be at least 32 characters** for security.

**Generate a secure secret:**

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Optional Configuration

#### Environment

```bash
ENVIRONMENT=development  # Options: development, staging, production
```

Controls logging level and behavior. Defaults to `development`.

#### CORS Origins

```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Comma-separated list of allowed CORS origins. Defaults to `http://localhost:5173`.

#### Cloudinary (Optional)

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

If not configured, the upload feature will be gracefully disabled. Upload endpoints will return `503 Service Unavailable`.

## Configuration Architecture

### Centralized Configuration

All environment variables are loaded through a single `app/config.py` module using Pydantic Settings:

```python
from app.config import settings

# Access configuration
database_url = settings.DATABASE_URL
is_production = settings.ENVIRONMENT == "production"
```

**Critical Rule: NEVER use `os.getenv()` outside of `config.py`**

### Validation

Configuration is validated on application startup:

- **Required fields** without defaults will cause the application to fail with a clear error message
- **Optional fields** (like Cloudinary) can be omitted
- **Field validators** ensure values meet security requirements (e.g., minimum secret length)

## Setup Instructions

### 1. Create .env File

```bash
cp .env.example .env
```

### 2. Fill in Required Values

Edit `.env` and provide values for all required configuration:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/questionaura_dev

# Auth0
AUTH0_DOMAIN=dev-abc123.us.auth0.com
AUTH0_API_AUDIENCE=https://api.questionaura.com

# Demo Secret (generate a secure one!)
DEMO_JWT_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
```

### 3. Optional: Configure Cloudinary

If you want image upload functionality:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-secret-key
```

### 4. Start the Application

```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### 5. Seed the Database (Optional)

To populate your database with sample data (topics, users, questions, and answers), run the seed script:

```bash
# Make sure you're in the backend directory with the virtual environment activated
python seed_data.py
```

**Options:**

- **Normal seed (adds data without removing existing data):**

  ```bash
  python seed_data.py
  ```

  This will add seed data while preserving any existing records. If seed data already exists, it will skip duplicates.

- **Reset and seed (clears all data first):**
  ```bash
  python seed_data.py --reset
  ```
  ⚠️ **Warning:** This will **delete all existing data** in your database before seeding. Use with caution!

**What gets seeded:**

- **12 Topics**: Programming, Finance, Books, Criminology, Philosophy, Nature, Psychology, Music, Career, Technology, Art, History
- **13 Users**: Including a demo user and 12 sample users
- **24 Questions**: 2 questions per topic
- **48 Answers**: Multiple answers for each question

**ID Ranges:**

- Topics: 1-12
- Users: 1, 101-112
- Questions: 201-224
- Answers: 301-348

These ID ranges ensure seed data doesn't conflict with user-generated content.

## Troubleshooting

### Application Won't Start

**Error: "Failed to load application configuration"**

This means a required environment variable is missing. Check the error message for which variable is needed.

**Solution:**

1. Verify `.env` file exists in the backend directory
2. Check all required variables are set
3. Ensure DEMO_JWT_SECRET is at least 32 characters

### Upload Feature Not Working

**Error: 503 Service Unavailable - "Upload service not configured"**

This means Cloudinary credentials are not provided.

**Solutions:**

- Configure Cloudinary in `.env` file
- Or accept that upload feature is disabled

### Database Connection Errors

**Error: Connection refused or authentication failed**

**Solutions:**

1. Verify PostgreSQL is running
2. Check DATABASE_URL format: `postgresql://user:password@host:port/database`
3. Ensure database exists: `createdb questionaura_dev`

## Production Deployment

### Security Checklist

- [ ] Generate a strong DEMO_JWT_SECRET (at least 32 characters)
- [ ] Set ENVIRONMENT=production
- [ ] Use SSL/TLS for database connections
- [ ] Configure proper CORS_ORIGINS (no wildcards)
- [ ] Enable Cloudinary for production use
- [ ] Never commit .env file to version control
- [ ] Use environment-specific configuration (staging, production)

### Environment-Specific Config

**Development:**

```bash
ENVIRONMENT=development
DATABASE_URL=postgresql://localhost/questionaura_dev
```

**Staging:**

```bash
ENVIRONMENT=staging
DATABASE_URL=postgresql://user:pass@staging-db:5432/questionaura_staging
```

**Production:**

```bash
ENVIRONMENT=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/questionaura_prod
```

## Logging

Logging is configured based on ENVIRONMENT:

- **development**: DEBUG level, detailed format with file/line numbers
- **staging/production**: INFO/WARNING level, structured JSON-like format

Access logger:

```python
from app.logger import logger

logger.info("Something happened")
logger.error("An error occurred")
```

## Constants and Configuration

Application constants are defined in `app/constants.py`:

- File upload limits
- Rate limiting thresholds
- JWT expiration times
- Seed data ID ranges

These are separate from environment configuration and are code-level constants.

## Need Help?

See `README.md` for general setup instructions or `MIGRATION_GUIDE.md` for upgrading existing deployments.
