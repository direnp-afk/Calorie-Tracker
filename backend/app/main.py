from fastapi import FastAPI
from backend.app.routers import foodentry, goal, auth, users, profile, summary, foodsearch


calorie_app = FastAPI(title="Welcome to calorie app")
calorie_app.include_router(foodentry.router)
calorie_app.include_router(goal.router)
calorie_app.include_router(auth.router)
calorie_app.include_router(users.router)
calorie_app.include_router(profile.router)
calorie_app.include_router(summary.router)
calorie_app.include_router(foodsearch.router)

@calorie_app.get("/")
def root():
    return{"message":"Welcome"}

