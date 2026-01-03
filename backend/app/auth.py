import os
import functools
import requests
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Auth0 Configuration with validation
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("AUTH0_API_AUDIENCE")

if not AUTH0_DOMAIN or not API_AUDIENCE:
    raise ValueError(
        "AUTH0_DOMAIN and AUTH0_API_AUDIENCE environment variables must be set"
    )

ISSUER = f"https://{AUTH0_DOMAIN}/"
JWKS_URL = f"{ISSUER}.well-known/jwks.json"

security = HTTPBearer()


@functools.lru_cache()
def get_jwks() -> dict:
    """
    Fetch and cache Auth0 JWKS.
    Raises HTTPException if unable to fetch JWKS.
    """
    try:
        response = requests.get(JWKS_URL, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to verify authentication"
        )


def get_unverified_header(token: str) -> dict:
    """Extract header from JWT without verification."""
    try:
        return jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token header"
        )


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify Auth0 JWT token and return payload.
    Also accepts demo tokens for demo user access.
    
    Returns:
        dict: JWT payload containing 'sub', 'email', etc.
    
    Raises:
        HTTPException: If token is invalid, expired, or improperly signed.
    """
    token = credentials.credentials
    
    # Try to decode as demo token first (for demo user)
    try:
        demo_secret = os.getenv("DEMO_JWT_SECRET", "demo-secret-key-change-in-production")
        payload = jwt.decode(
            token,
            demo_secret,
            algorithms=["HS256"],
            options={"verify_aud": False}  # Demo tokens may not have exact audience
        )
        # If it has the demo flag, it's a valid demo token
        if payload.get("demo") is True:
            return payload
    except JWTError:
        # Not a demo token, continue to Auth0 verification
        pass
    
    # Get the key ID from token header
    unverified_header = get_unverified_header(token)
    
    # Find matching key in JWKS
    jwks = get_jwks()
    rsa_key = next(
        (key for key in jwks["keys"] if key["kid"] == unverified_header["kid"]),
        None
    )
    
    if rsa_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signing key"
        )
    
    # Verify and decode token
    try:
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=API_AUDIENCE,
            issuer=ISSUER,
        )
        return payload
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )