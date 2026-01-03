import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://localhost/questionaura_dev"
)

# Only log SQL in development mode
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

engine = create_engine(
    DATABASE_URL,
    echo=ENVIRONMENT == "development",
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()

# Dependency to get database session
def get_db():
    """
    Creates a new database session for each request.
    Automatically closes the session after the request is done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()