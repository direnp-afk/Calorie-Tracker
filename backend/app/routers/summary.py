from datetime import date, datetime, time, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, FoodEntry, GoalEntry
from backend.app.auth import get_current_active_user
from backend.app.schemas import DailySummaryResponse


router = APIRouter(prefix="/summary", tags=["Summary"])


@router.get("/daily", response_model=DailySummaryResponse)
def get_daily_summary(day:date | None = None, current_user:User = Depends(get_current_active_user), db:Session = Depends(get_db)):

    goal = db.query(GoalEntry).filter(GoalEntry.user_id == current_user.id).first()

    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nutrition goals not found")

    selected_day = day or datetime.now(timezone.utc).date()

    food_entries = db.query(FoodEntry).filter(
        FoodEntry.user_id == current_user.id,
        FoodEntry.date_logged == selected_day
    ).all()

    calories_consumed = sum(entry.calories for entry in food_entries)
    protein_consumed = round(sum(entry.protein for entry in food_entries), 1)
    carbs_consumed = round(sum(entry.carbs for entry in food_entries), 1)
    fats_consumed = round(sum(entry.fats for entry in food_entries), 1)

    meal_totals = {
        meal: {"calories": 0, "protein": 0.0, "carbs": 0.0, "fats": 0.0}
        for meal in ("breakfast", "lunch", "dinner", "snacks")
    }

    for entry in food_entries:
        if entry.meal_type in meal_totals:
            meal = meal_totals[entry.meal_type]

            meal["calories"] += entry.calories
            meal["protein"] += entry.protein
            meal["carbs"] += entry.carbs
            meal["fats"] += entry.fats

    for meal in meal_totals.values():
        meal["protein"] = round(meal["protein"], 1)
        meal["carbs"] = round(meal["carbs"], 1)
        meal["fats"] = round(meal["fats"], 1)

    return {
        "day": selected_day,

        "consumed": {
            "calories": calories_consumed,
            "protein": protein_consumed,
            "carbs": carbs_consumed,
            "fats": fats_consumed
        },

        "targets": {
            "calories": goal.calorie_target,
            "protein": goal.protein_target,
            "carbs": goal.carb_target,
            "fats": goal.fat_target
        },

        "remaining": {
            "calories": goal.calorie_target - calories_consumed,
            "protein": round(goal.protein_target - protein_consumed, 1),
            "carbs": round(goal.carb_target - carbs_consumed, 1),
            "fats": round(goal.fat_target - fats_consumed, 1)
        },

        "meals": meal_totals
    }