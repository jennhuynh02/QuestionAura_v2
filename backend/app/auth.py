import os
import functools
import requests
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Auth0 Configuration
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("AUTH0_API_AUDIENCE")
ISSUER = f"https://{AUTH0_DOMAIN}/"


security = HTTPBearer()


@functools.lru_cache()
def get_jwks() -> dict:
    """Fetch and cache Auth0 JWKS"""
    jwks_url = f"{ISSUER}.well-known/jwks.json"
    response = requests.get(jwks_url)
    
    if response.status_code != 200:
        raise RuntimeError(
            f"Failed to fetch JWKS from {jwks_url}: {response.status_code}"
        )
    
    return response.json()


def get_unverified_header(token: str) -> dict:
    """Extract header from JWT without verification"""
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
    """Verify Auth0 JWT token and return payload"""
    token = credentials.credentials
    
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
    
    # Verify token
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