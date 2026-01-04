from app.routes.users import router as users_router
from app.routes.auth import router as auth_router
from app.routes.topics import router as topics_router
from app.routes.questions import router as questions_router
from app.routes.answers import router as answers_router

__all__ = ["users_router", "auth_router", "topics_router", "questions_router", "answers_router"]