
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