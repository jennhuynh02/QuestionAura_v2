import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.database import engine
from fastapi import Depends
from app.auth import verify_token

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

@app.get("/protected")
def protected_route(user=Depends(verify_token)):
    return {
        "message": "You are authenticated",
        "user": {
            "sub": user.get("sub"),
            "email": user.get("email"),
            "iss": user.get("iss"),
            "aud": user.get("aud"),
        },
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/db-check")
def db_check():
    try:
        with engine.connect():
            return {"db": "connected"}
    except Exception as e:
        return {"db": "error", "message": str(e)}