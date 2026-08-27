from fastapi import FastAPI
from backend.app.database import engine, Base

Base.metadata.create_all(bind=engine)

calorie_app = FastAPI(title="Welcome to calorie app")

@calorie_app.get("/")
def root():
    return{"message":"Welcome"}

