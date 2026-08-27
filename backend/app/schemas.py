from pydantic import BaseModel, ConfigDict
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

