from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class FoodEntryCreate(BaseModel):
    name_of_food:str
    calories:int
    protein:float
    carbs:float
    fats:float
    meal_type:str

class FoodEntryResponse(BaseModel):
    id:int
    name_of_food:str
    calories:int
    protein:float
    carbs:float
    fats:float
    meal_type:str
    time_created:datetime

    model_config = ConfigDict(from_attributes = True)

class GoalEntryCreate(BaseModel):
    calorie_target:int
    protein_target:float
    carb_target:float
    fat_target:float

class GoalEntryResponse(BaseModel):
    id:int
    calorie_target:int
    protein_target:float
    carb_target:float
    fat_target:float

    model_config = ConfigDict(from_attributes = True)

class UserCreate(BaseModel):
    email:str
    password:str

class UserResponse(BaseModel):
    id:int
    email:str
    is_user_active:bool

    model_config = ConfigDict(from_attributes = True)

class UserLogin(BaseModel):
    email:str
    password:str

class Token(BaseModel):
    access_token:str
    token_type:str

class TokenData(BaseModel):
    email:Optional[str] = None