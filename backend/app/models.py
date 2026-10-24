from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from backend.app.database import Base
from datetime import datetime, timezone

class FoodEntry(Base):
    __tablename__ = "food_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name_of_food = Column(String(100), nullable=False)
    calories = Column(Integer, nullable=False)
    protein = Column(Float, nullable=False)
    carbs = Column(Float, nullable=False)
    fats = Column(Float, nullable=False)
    time_created = Column(DateTime(timezone=True), default=lambda:datetime.now(timezone.utc))
    meal_type = Column(String(20), nullable=False)
    user = relationship("User", back_populates="food_entries")
    fdc_id = Column(Integer, nullable=True)
    quantity_g = Column(Float, nullable=True)
    date_logged = Column(Date, nullable=False)

class GoalEntry(Base):
    __tablename__ = "nutrition_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    calorie_target = Column(Integer, nullable=False)
    protein_target = Column(Float, nullable=False)
    carb_target = Column(Float, nullable=False)
    fat_target = Column(Float, nullable=False)
    user = relationship("User", back_populates="goals")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, unique=True)
    hashed_password = Column(String(100), nullable=False)
    is_user_active = Column(Boolean, default=True)
    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    food_entries = relationship(
        "FoodEntry",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    goals = relationship(
        "GoalEntry",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    gender = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    weight_kg = Column(Float, nullable=False)
    height_cm = Column(Float, nullable=False)
    activity_level = Column(String(30), nullable=False)
    fitness_goal = Column(String(30), nullable=False)
    goal_weight_kg = Column(Float, nullable=True)
    weekly_weight_change_kg = Column(Float, nullable=True)
    user = relationship("User", back_populates="profile")




    






