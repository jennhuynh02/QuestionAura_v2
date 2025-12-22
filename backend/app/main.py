from fastapi import FastAPI

app = FastAPI(title="QuestionAura API")

@app.get("/health")
def health_check():
    return {"status": "ok"}