# Calorie Tracker — Backend API

**Status:** Backend complete | React frontend planned

A calorie and nutrition tracking REST API built with Python and FastAPI. Users can create an account, set nutrition goals, log meals and track their daily calorie and macronutrient intake.

I built the backend first to focus on authentication, database design, nutrition calculations and integrating an external food database. The API is functional and can currently be used through FastAPI's interactive documentation.

## API Demonstration



## API Demonstration

<p align="center">
  <strong>API Overview</strong>
</p>
<p align="center">
  <img width="700" alt="FastAPI Swagger documentation showing the available REST API endpoints" src="https://github.com/user-attachments/assets/b2096802-39d6-407e-bcac-8978fe148dae" />
  <br>
  <sub>REST API endpoints organised using FastAPI's interactive documentation.</sub>
</p>

<p align="center">
  <strong>Daily Nutrition Summary</strong>
</p>
<p align="center">
  <img width="700" alt="Daily summary showing consumed calories, nutrition targets and remaining macros" src="https://github.com/user-attachments/assets/e73cb7d6-35e1-4f37-91b4-b85c18886c83" />
  <br>
  <sub>Daily calorie and macronutrient totals compared against user goals.</sub>
</p>

<p align="center">
  <strong>USDA Food Search</strong>
</p>
<p align="center">
  <img width="700" alt="Successful USDA FoodData Central API search returning food results" src="https://github.com/user-attachments/assets/aa9081e1-9305-4c03-a796-876429dc4ba6" />
  <br>
  <sub>Food search results retrieved from USDA FoodData Central.</sub>
</p>

<p align="center">
  <strong>Calorie Recommendation</strong>
</p>
<p align="center">
  <img width="650" alt="Calculated calorie target, macronutrient targets and estimated goal date" src="https://github.com/user-attachments/assets/01690647-7fe9-4485-bf0d-0307e0284f17" />
  <br>
  <sub>Personalised calorie and macro recommendations with an estimated goal date.</sub>
</p>



## Features

**Accounts and profiles**
- Register and log in with JWT-based authentication and Argon2 password hashing.
- Update account details, change passwords and delete an account.
- Save a personal profile with weight, height, age, activity level and fitness goal.
- Restrict profile, goal and food-entry data to the authenticated user.

**Nutrition goals**
- Calculate estimated resting metabolic rate (RMR) using the Mifflin–St Jeor equation and total daily energy expenditure (TDEE) using activity multipliers.
- Recommend daily calorie and macronutrient targets for weight loss, maintenance or gain.
- Estimate a target date based on goal weight and selected weekly rate of change.
- Set or update calorie and macro targets manually, with validation to check that their energy totals are consistent.
- Reject automatic recommendations that exceed the application's basic calorie-deficit or surplus limits.

**Food diary**
- Search foods using the USDA FoodData Central API.
- View calories, macronutrients, available micronutrients and portion information.
- Log USDA foods by weight, or manually add foods that are not in the database.
- Update logged quantities for USDA foods, edit manual entries, change log dates and delete entries.
- Retrieve food entries for a selected date and view totals by meal type.

**Daily summary**
- Compare calories, protein, carbohydrates and fats consumed against saved targets.
- See remaining targets and a breakdown across breakfast, lunch, dinner and snacks.

## Tech stack

| Area | Technologies |
| --- | --- |
| Language | Python |
| API | FastAPI, REST, Pydantic |
| Database | SQLite, SQLAlchemy ORM |
| Authentication | JWT (PyJWT), OAuth2 password flow, pwdlib / Argon2 |
| External data | USDA FoodData Central API, Requests |
| Testing | pytest, FastAPI TestClient, HTTPX |
| Other tools | Git, GitHub, environment variables with python-dotenv, Swagger UI / OpenAPI |

## Project structure

```text
Calorie-Tracker/
├── backend/
│   └── app/
│       ├── routers/          # Authentication, users, profiles, goals, foods and summaries
│       ├── services/
│       │   └── nutrition.py  # Nutrition calculations
│       ├── auth.py           # Password hashing and JWT utilities
│       ├── config.py         # Environment variable configuration
│       ├── database.py       # SQLAlchemy database setup
│       ├── main.py           # FastAPI application and routers
│       ├── models.py         # Database models
│       └── schemas.py        # Request and response schemas
├── tests/                    # pytest suite
├── pytest.ini
├── requirements.txt
└── README.md
```

## Getting started

**Requirements:** Python 3.10+ and a free USDA FoodData Central API key.

1. Clone the repository and open a terminal in the project root.
2. Install the dependencies:

   ```bash
   python -m pip install -r requirements.txt
   ```

3. Create a `.env` file in the project root:

   ```dotenv
   SECRET_KEY=replace_with_a_long_random_secret
   USDA_API_KEY=your_usda_api_key
   ```

   The `.env` file is excluded from version control. Never commit real API keys or secrets.

4. Start the API:

   ```bash
   python -m uvicorn backend.app.main:calorie_app --reload
   ```

5. Open **http://127.0.0.1:8000/docs** to use the interactive API documentation.

The SQLite database is created automatically on startup if it does not already exist.

### Trying the API

Register an account with `POST /auth/register`, then log in using `POST /auth/token`. In Swagger UI, select **Authorize** and enter your account credentials. You can then create a profile, request a goal recommendation, save your targets and start logging food.

## Main API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create an account |
| POST | `/auth/token` | Log in and receive a JWT |
| GET / PUT / DELETE | `/users/me` | View, edit or delete your account |
| POST / GET / PUT | `/profile/me` | Create, view or update your profile |
| GET | `/goals/recommendation` | Calculate suggested targets and estimated goal date |
| POST | `/goals/` | Save nutrition targets |
| GET / PUT | `/goals/me` | View or update saved targets |
| GET | `/foods/search?query=banana` | Search the USDA database |
| GET | `/foods/{fdc_id}?quantity_g=150` | View scaled food nutrition and portions |
| POST | `/food_entries/` | Log food manually |
| POST | `/food_entries/from-search` | Log a USDA food by weight |
| GET | `/food_entries/me?day=2026-10-24` | View entries for a date |
| PATCH | `/food_entries/{entry_id}/quantity` | Update the weight of a USDA entry |
| PATCH | `/food_entries/{entry_id}/date` | Move a food entry to another date |
| GET | `/summary/daily?day=2026-10-24` | View daily totals, remaining targets and meals |

Food entries can also be viewed individually, manually edited or deleted. The complete list of routes and request schemas is available at `/docs`.

## Testing

The backend has **15 passing pytest tests** covering key nutrition calculations and API behaviour, including authentication, goal validation, food logging and access controls between users.

Tests use an in-memory SQLite database rather than the application's database. USDA responses are mocked where needed, so tests do not depend on live API calls.

Run from the project root:

```bash
python -m pytest -v
```

See [`README_TEST.md`](README_TEST.md) for more detail about the test setup and planned additional coverage.

## Next steps

The backend is complete for the first version, with the following improvements planned:

- **React frontend:** onboarding, food search, meal diary, calorie/macro dashboard and account settings.
- **Deployment:** make the API and, later, the frontend available online.
- **Database migrations:** introduce Alembic for schema changes without recreating the database.
- **More tests and validation:** extend coverage for account changes, error handling, edge cases and external API failures.
- **Nutrition refinements:** improve recommendation safeguards and estimates as the project develops.

*Calorie and weight-change recommendations are estimates, not personalised medical advice.*
