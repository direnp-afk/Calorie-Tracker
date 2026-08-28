from fastapi import FastAPI
from backend.app.database import engine, Base
from backend.app.routers import foodentry, goal



Base.metadata.create_all(bind=engine)

calorie_app = FastAPI(title="Welcome to calorie app")
calorie_app.include_router(foodentry.router)
calorie_app.include_router(goal.router)

@calorie_app.get("/")
def root():
    return{"message":"Welcome"}

