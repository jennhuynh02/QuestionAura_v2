from fastapi import FastAPI
from app.database import engine
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="QuestionAura API")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/db-check")
def db_check():
    with engine.connect() as conn:
        return {"db": "connected"}