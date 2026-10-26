#!/usr/bin/env bash
set -e

python -m alembic upgrade head

exec python -m uvicorn backend.app.main:calorie_app --host 0.0.0.0 --port "${PORT:-8000}"
