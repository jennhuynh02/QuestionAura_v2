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
    """Fetch and cache Auth0 JWKS (JSON Web Key Set)"""
    jwks_url = f"{ISSUER}.well-known/jwks.json"
    response = requests.get(jwks_url)
    
    if response.status_code != 200:
        raise RuntimeError(
            f"Failed to fetch JWKS from {jwks_url}: {response.status_code}"
        )
    
    return response.json()


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Verify Auth0 JWT token and return payload"""
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token,
            get_jwks(),
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