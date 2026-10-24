# Backend Tests

This is a small pytest suite for the FastAPI backend. I've focused on the parts of the app where a bug could affect calculations, account access or someone's food diary.

## What's tested

- **Authentication:** registration, login, password length and protected routes.
- **Nutrition:** RMR, TDEE, weight-loss calorie targets and macro percentage validation.
- **Goals:** saving a goal, rejecting mismatched macro targets and blocking unsafe calorie recommendations.
- **Food diary:** logging food for a selected date, keeping users' entries private and recalculating USDA food quantities.
- **Profile and summary:** creating a profile and checking daily nutrition totals.

There are **15 tests** so far.

## Running the tests

From the project root, with the backend dependencies installed:

```bash
python -m pip install pytest httpx
python -m pytest
```

## Test setup

`conftest.py` gives each test a fresh SQLite database in memory. FastAPI's `TestClient` runs requests against the existing routers, while a dependency override makes sure they use the test database instead of `calorie_tracker.db`.

USDA responses are mocked where needed, so the tests don't depend on an external API call.

## What I'll add next

This is a starting point rather than full test coverage. I plan to add tests for password changes, editing and deleting food entries, invalid or expired tokens, and USDA request failures.

