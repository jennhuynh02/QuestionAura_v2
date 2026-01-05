"""
Centralized configuration management using Pydantic Settings.

All environment variables are loaded and validated here.
NEVER use os.getenv() outside this file.
"""
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Environment
    ENVIRONMENT: str = Field(
        default="development",
        description="Environment: development, staging, production"
    )
    
    # Database - REQUIRED, no default
    DATABASE_URL: str = Field(
        ...,
        description="PostgreSQL database URL"
    )
    
    # Auth0 - REQUIRED, no defaults
    AUTH0_DOMAIN: str = Field(
        ...,
        description="Auth0 domain (e.g., your-domain.auth0.com)"
    )
    
    AUTH0_API_AUDIENCE: str = Field(
        ...,
        description="Auth0 API audience identifier"
    )
    
    # Demo JWT - REQUIRED, no default
    DEMO_JWT_SECRET: str = Field(
        ...,
        description="Secret key for demo JWT tokens (min 32 characters recommended)"
    )
    
    # Cloudinary - OPTIONAL (upload feature disabled if not configured)
    CLOUDINARY_CLOUD_NAME: Optional[str] = Field(
        None,
        description="Cloudinary cloud name"
    )
    
    CLOUDINARY_API_KEY: Optional[str] = Field(
        None,
        description="Cloudinary API key"
    )
    
    CLOUDINARY_API_SECRET: Optional[str] = Field(
        None,
        description="Cloudinary API secret"
    )
    
    # CORS
    CORS_ORIGINS: str = Field(
        default="http://localhost:5173",
        description="Comma-separated list of allowed CORS origins"
    )
    
    @field_validator("DEMO_JWT_SECRET")
    @classmethod
    def validate_demo_secret_length(cls, v: str) -> str:
        """Ensure demo JWT secret is sufficiently long."""
        if len(v) < 32:
            raise ValueError(
                "DEMO_JWT_SECRET must be at least 32 characters long for security"
            )
        return v
    
    @property
    def cloudinary_configured(self) -> bool:
        """Check if all Cloudinary credentials are provided."""
        return all([
            self.CLOUDINARY_CLOUD_NAME,
            self.CLOUDINARY_API_KEY,
            self.CLOUDINARY_API_SECRET
        ])
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        """Pydantic config."""
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra env vars


# Instantiate settings - app will fail to start if required configs are missing
try:
    settings = Settings()
except Exception as e:
    print(f"\n{'='*60}")
    print("CONFIGURATION ERROR")
    print(f"{'='*60}")
    print(f"\nFailed to load application configuration: {e}")
    print("\nPlease ensure all required environment variables are set.")
    print("Check backend/.env.example for the required variables.\n")
    print(f"{'='*60}\n")
    raise

