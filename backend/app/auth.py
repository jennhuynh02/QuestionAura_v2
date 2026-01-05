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


def _verify_demo_token(token: str) -> dict:
    """Verify demo token (HS256) and return payload."""
    demo_secret = os.getenv("DEMO_JWT_SECRET", "demo-secret-key-change-in-production")
    
    try:
        payload = jwt.decode(
            token,
            demo_secret,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        
        if not payload.get("demo"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid demo token: missing demo flag"
            )
        
        return payload
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Demo token has expired"
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid demo token: {str(e)}"
        )


def _verify_auth0_token(token: str, unverified_header: dict) -> dict:
    """Verify Auth0 token (RS256) and return payload."""
    # Validate required 'kid' field
    kid = unverified_header.get("kid")
    if not kid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Auth0 token: missing key ID"
        )
    
    # Find matching RSA key
    jwks = get_jwks()
    rsa_key = next(
        (key for key in jwks["keys"] if key["kid"] == kid),
        None
    )
    
    if not rsa_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signing key"
        )
    
    # Verify and decode
    try:
        return jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=API_AUDIENCE,
            issuer=ISSUER,
        )
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


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify JWT token (Auth0 or demo) and return payload.
    
    Returns:
        dict: JWT payload containing 'sub', 'email', etc.
    
    Raises:
        HTTPException: If token is invalid, expired, or improperly signed.
    """
    token = credentials.credentials
    unverified_header = get_unverified_header(token)
    
    # Route to appropriate verification based on algorithm
    if unverified_header.get("alg") == "HS256":
        return _verify_demo_token(token)
    
    return _verify_auth0_token(token, unverified_header)