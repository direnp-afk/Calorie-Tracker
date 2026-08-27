from fastapi import FastAPI, HTTPException, status, Depends
from typing import List
from app.database import engine, Base

Base.metadata.create_all(bind=engine)

calorie_app = FastAPI(title="Welcome to calorie app")

@calorie_app.get("/")
def root():
    return{"message":"Welcome"}

