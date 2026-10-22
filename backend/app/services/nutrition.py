from datetime import date, timedelta
from math import ceil, isclose


ACTIVITY_FACTORS = {
    "sedentary":1.2,
    "lightly_active":1.375,
    "moderately_active":1.55,
    "very_active":1.725
}

def calculate_rmr(weight_kg:float, height_cm:float, age:int, gender:str) -> float:
    if gender == "male":
        s = 5
    elif gender == "female":
        s = -161
    else:
        raise ValueError("Automatic calculation unavailable")
    
    rmr = 10*weight_kg + 6.25*height_cm - 5*age + s
    return rmr


def calculate_tdee(rmr:float, activity_level:str) -> float:
    multiplier = ACTIVITY_FACTORS.get(activity_level)

    if multiplier is None:
        raise ValueError("Invalid activity level")

    tdee = rmr*multiplier
    return tdee


def calculate_calorie_target(fitness_goal:str, TDEE:float, weekly_weight_change_kg:float | None) -> float:

    if fitness_goal == "maintain":
        return TDEE

    if weekly_weight_change_kg is None or weekly_weight_change_kg <= 0:
        raise ValueError("Weekly weight change is required")

    calorie_adjustment = (weekly_weight_change_kg*7700)/7

    if fitness_goal == "gain":
        surplus = TDEE + calorie_adjustment
        return surplus
    elif fitness_goal == "lose":
        deficit = TDEE - calorie_adjustment
        return deficit
    else:
        raise ValueError("invalid fitness goal")


def estimate_goal_date(current_weight_kg: float, goal_weight_kg: float | None, weekly_weight_change_kg: float | None, fitness_goal: str) -> date | None:

    if fitness_goal == "maintain":
        return None

    if goal_weight_kg is None or weekly_weight_change_kg is None or weekly_weight_change_kg <= 0:
        raise ValueError("Valid goal weight and weekly change are required")

    weight_difference = abs(goal_weight_kg - current_weight_kg)
    weeks_needed = weight_difference / weekly_weight_change_kg
    days_needed = ceil(weeks_needed * 7)
    return date.today() + timedelta(days=days_needed)


def calculate_macros(calorie_target: float, protein_percent: float = 25, carb_percent: float = 45, fat_percent: float = 30) -> dict:

    if calorie_target <= 0:
        raise ValueError("Calorie target must be greater than zero")

    if any(p < 0 or p > 100 for p in
           (protein_percent, carb_percent, fat_percent)):
        raise ValueError("Macro percentages must be between 0 and 100")

    total_percent = protein_percent + carb_percent + fat_percent

    if not isclose(total_percent, 100, abs_tol=0.0001):
        raise ValueError("Macro percentages must add up to 100%")

    protein_target = round((calorie_target * protein_percent / 100) / 4, 1)
    carb_target = round((calorie_target * carb_percent / 100) / 4, 1)
    fat_target = round((calorie_target * fat_percent / 100) / 9, 1)

    return {
        "protein_target": protein_target,
        "carb_target": carb_target,
        "fat_target": fat_target
    }

