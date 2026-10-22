from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Literal
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

class UserUpdate(BaseModel):
    email:str

class PasswordChange(BaseModel):
    current_password:str
    new_password:str

class UserResponse(BaseModel):
    id:int
    email:str
    is_user_active:bool

    model_config = ConfigDict(from_attributes = True)

#validates credentials during user login
class UserLogin(BaseModel):
    email:str
    password:str

#The JWT response after the user has been authenticated successfully
class Token(BaseModel):
    access_token:str
    token_type:str

#holds user identity extracted from a verified JWT
class TokenData(BaseModel):
    user_id:Optional[int] = None

class UserProfileCreate(BaseModel):
    gender: Literal["male", "female", "prefer_not_to_say"]
    age:int = Field(gt=0, lt= 120)
    weight_kg:float = Field(gt=0)
    height_cm:float = Field(gt=0)
    activity_level: Literal["sedentary", "lightly_active", "moderately_active", "very_active"]
    fitness_goal: Literal["lose", "maintain", "gain"]
    goal_weight_kg: float | None = Field(default=None, gt=0)
    weekly_weight_change_kg: Literal["0.15", "0.25", "0.375", "0.5", "0.625", "0.75", "0.875", "1.0"] | None = None

class UserProfileResponse(BaseModel):
    id:int
    user_id:int
    gender:str
    age:int
    weight_kg:float
    height_cm:float
    activity_level:str
    fitness_goal:str
    goal_weight_kg:float | None = None
    weekly_weight_change_kg:float | None=None

    model_config = ConfigDict(from_attributes = True)