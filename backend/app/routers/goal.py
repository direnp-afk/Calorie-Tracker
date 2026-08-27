from fastapi import APIRouter, Depends, status, HTTPException
from typing import List
from sqlalchemy.orm import Session
from backend.app.models import GoalEntry
from backend.app.schemas import GoalEntryCreate, GoalEntryResponse

router = APIRouter(prefix="/goals", tags=["Nutrition Goals"])

