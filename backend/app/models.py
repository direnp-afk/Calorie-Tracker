from sqlalchemy import Column, Integer, String, Float, DateTime
from backend.app.database import Base
from datetime import datetime, timezone

class FoodEntry(Base):
    __tablename__ = "food_entries"

    id = Column(Integer, primary_key=True, index=True)
    name_of_food = Column(String(100), nullable=False)
    calories = Column(Integer, nullable=False)
    protein = Column(Float, nullable=False)
    carbs = Column(Float, nullable=False)
    fats = Column(Float, nullable=False)
    time_created = Column(DateTime(timezone=True), default=lambda:datetime.now(timezone.utc))
    meal_type = Column(String(20), nullable=False)




