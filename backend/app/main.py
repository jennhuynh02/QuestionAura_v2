import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.database import engine
from app.auth import verify_token
from app.routes import users_router

load_dotenv()

app = FastAPI(title="QuestionAura API")

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)


@app.get("/protected")
async def protected_route(payload: dict = Depends(verify_token)):
    """Protected endpoint that returns decoded JWT payload info."""
    return {
        "message": "You are authenticated",
        "user": {
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "iss": payload.get("iss"),
            "aud": payload.get("aud"),
        },
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/db-check")
async def db_check():
    """Database connectivity check."""
    try:
        with engine.connect():
            return {"db": "connected"}
    except Exception as e:
        return {"db": "error", "message": str(e)}