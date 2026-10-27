
# NutraLog — Calorie & Nutrition Tracker

**A full-stack nutrition tracking web application** built with React, FastAPI and PostgreSQL. NutraLog helps users log meals, monitor calorie and macronutrient intake, and set personalised nutrition goals.

[![CI](https://github.com/direnp-afk/Calorie-Tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/direnp-afk/Calorie-Tracker/actions/workflows/ci.yml)

**Live app:** (https://nutralog-calorie-tracker.vercel.app/)   
**API documentation:** [FastAPI Swagger UI](https://nutralog-api.onrender.com/docs)  
**Source code:** [GitHub repository](https://github.com/direnp-afk/Calorie-Tracker)

> **Hosting note:** The backend runs on Render's free tier and may take a short time to respond after a period of inactivity.




## Screenshots

### Desktop

<table>
  <tr>
    <th align="center">Dashboard</th>
    <th align="center">Meal Diary</th>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/04d4736a-2b69-4dec-ba24-2a3614fa2e4c" alt="NutraLog Dashboard" width="420">
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/3cf768bb-37f5-48c9-8a8f-d258ec26a0f7" alt="NutraLog Meal Diary" width="420">
    </td>
  </tr>
</table>

### Mobile

<table>
  <tr>
    <th align="center">Dashboard</th>
    <th align="center">Meals</th>
    <th align="center">Account</th>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/98592174-50c3-4306-936e-b99045792a11" alt="NutraLog Mobile Dashboard" width="190">
    </td>
    <td align="center">
      <img src="docs/screenshots/mobile-meals.png" alt="NutraLog Mobile Meals" width="190">
    </td>
    <td align="center">
      <img src="docs/screenshots/mobile-account.png" alt="NutraLog Mobile Account" width="190">
    </td>
  </tr>
</table>



## Features

### Accounts and profiles

- Register and sign in using JWT-based authentication and hashed passwords.
- Manage account details and update or delete an account.
- Save a profile with details used to calculate nutrition recommendations.
- Keep food entries, profiles and nutrition goals associated with the authenticated user.

### Nutrition goals

- Generate suggested daily calorie and macronutrient targets using resting metabolic rate (RMR), estimated energy expenditure (TDEE) and a selected weight goal.
- View an estimated timeline for reaching a target weight.
- Accept calculated recommendations or manually create and update calorie, protein, carbohydrate and fat targets.
- Validate nutrition goals, including consistency between calorie and macronutrient totals.

### Food search and diary

- Search the **USDA FoodData Central API** for foods and nutritional information.
- Log foods by weight, with nutritional values scaled to the selected quantity.
- Add manual food entries when a food is not available through search.
- Organise entries into **breakfast, lunch, dinner and snacks**.
- Edit or delete food entries, update quantities and move entries between dates.

### Dashboard

- View daily calories and macronutrients consumed against saved targets.
- Review remaining daily targets and intake by meal category.
- Navigate between dates to review logged food.
- Use a responsive interface designed for desktop and mobile screens.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React, JavaScript, Vite, CSS, Lucide React |
| Backend | Python, FastAPI, Pydantic, REST API |
| Data | PostgreSQL (production), SQLite (local development/testing), SQLAlchemy ORM |
| Migrations | Alembic |
| Authentication | JWT, OAuth2 password flow, Argon2 password hashing |
| Nutrition data | USDA FoodData Central API |
| Testing and quality | pytest, FastAPI TestClient, HTTPX, ESLint |
| Automation | GitHub Actions CI |
| Hosting | Vercel (frontend), Render (backend), Neon (PostgreSQL) |

## Architecture

```text
                         Browser
                            |
                            v
                     React + Vite
                       (Vercel)
                            |
                     /api/* requests
                            |
                            v
                     Vercel rewrite
                            |
                            v
                      FastAPI REST
                        (Render)
                       /        \
                      v          v
              Neon PostgreSQL   USDA FoodData
               (SQLAlchemy)     Central API
```

The React application calls `/api/...` endpoints. During local development, Vite proxies these requests to FastAPI; in production, Vercel rewrites them to the Render backend.

FastAPI uses SQLAlchemy to access PostgreSQL in production and SQLite for local development. Alembic manages schema changes in both environments.

### Key engineering decisions

- **Separation of concerns:** API routes, SQLAlchemy models, Pydantic schemas and nutrition calculations are organised into separate modules.
- **User-scoped data:** Protected routes use the authenticated user's identity when accessing saved profiles, goals and food entries.
- **Isolated tests:** The pytest suite uses an in-memory SQLite database and mocked USDA responses, avoiding changes to real user data or reliance on an external service.
- **Versioned schema:** Alembic migrations make database changes repeatable rather than creating tables automatically when the application starts.
- **Automated checks:** GitHub Actions runs backend tests, validates migrations, checks frontend code with ESLint and builds the React app on pushes and pull requests.

## Project structure

```text
Calorie-Tracker/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated backend and frontend checks
├── alembic/
│   └── versions/                 # Database migration revisions
├── backend/
│   └── app/
│       ├── routers/             # Auth, accounts, profiles, goals, foods, summaries
│       ├── services/            # Nutrition calculations and other backend logic
│       ├── auth.py              # Authentication utilities
│       ├── config.py            # Environment-based configuration
│       ├── database.py          # SQLAlchemy engine and sessions
│       ├── main.py              # FastAPI app entry point
│       ├── models.py            # Database models
│       └── schemas.py           # Request/response validation
├── frontend/
│   ├── src/
│   │   ├── api/                 # API requests
│   │   ├── pages/               # App screens
│   │   └── App.jsx              # App navigation and state
│   ├── vercel.json              # Production API rewrite
│   └── package.json
├── tests/                       # Backend pytest suite
├── alembic.ini
├── requirements.txt
├── start.sh                     # Run migrations and start deployed API
└── README.md
```

## Run locally

### Prerequisites

- Python **3.12**
- Node.js and npm (Node.js **24**, as used in CI, is recommended)
- A free [USDA FoodData Central API key](https://fdc.nal.usda.gov/api-key-signup/)

### 1. Clone and install backend dependencies

```bash
git clone https://github.com/direnp-afk/Calorie-Tracker.git
cd Calorie-Tracker
python -m venv .venv
```

Activate the virtual environment:

- **Windows PowerShell:** `.\.venv\Scripts\Activate.ps1`
- **macOS / Linux:** `source .venv/bin/activate`

Then install the requirements:

```bash
python -m pip install -r requirements.txt
```

### 2. Configure local environment variables

Create a **`.env`** file in the project root:

```dotenv
SECRET_KEY=replace_with_a_long_random_secret
USDA_API_KEY=your_usda_fooddata_central_api_key
DATABASE_URL=sqlite:///./calorie_tracker.db
```

Generate a development secret using:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Never commit `.env`, production credentials or database files.

`DATABASE_URL` is optional for local SQLite development because the application defaults to `sqlite:///./calorie_tracker.db`.

### 3. Apply database migrations and start FastAPI

From the **project root**:

```bash
python -m alembic upgrade head
python -m uvicorn backend.app.main:calorie_app --reload
```

- Backend: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs

### 4. Start React

Open a **second terminal**:

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL shown by Vite, normally http://localhost:5173.

> **Windows PowerShell:** If `npm` is blocked by your execution policy, use `npm.cmd ci` and `npm.cmd run dev` instead.

## Testing and CI

Run the backend tests from the project root:

```bash
python -m pytest -q
```

Check and build the frontend:

```bash
cd frontend
npm run lint
npm run build
```

The backend tests cover authentication, nutrition calculations, goal validation, food logging, account-level data separation and daily summaries. They use a fresh in-memory database for each test and mock external USDA requests.

GitHub Actions (`.github/workflows/ci.yml`) runs two jobs:

1. **Backend:** Install dependencies, apply Alembic migrations to a fresh SQLite database and run pytest.
2. **Frontend:** Install dependencies, run ESLint and verify that Vite builds successfully.

[View workflow runs](https://github.com/direnp-afk/Calorie-Tracker/actions)

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/token` | Log in and receive an access token |
| `GET / PUT / DELETE` | `/users/me` | Manage the current account |
| `POST / GET / PUT` | `/profile/me` | Create or update a profile |
| `GET` | `/goals/recommendation` | Calculate nutrition recommendations |
| `POST` | `/goals/` or `/goals` | Save targets |
| `GET / PUT` | `/goals/me` | Retrieve or update targets |
| `GET` | `/foods/search?query=banana` | Search USDA foods |
| `GET` | `/foods/{fdc_id}?quantity_g=150` | Retrieve nutrition scaled by quantity |
| `POST` | `/food_entries/` | Log a food manually |
| `POST` | `/food_entries/from-search` | Log a USDA search result |
| `GET` | `/food_entries/me?day=YYYY-MM-DD` | Retrieve a day's food diary |
| `GET` | `/summary/daily?day=YYYY-MM-DD` | Retrieve daily totals and targets |

Additional food-entry editing, deletion and date/quantity update routes are documented through FastAPI's `/docs` endpoint.

## Deployment

| Component | Hosting provider | Configuration |
| --- | --- | --- |
| React frontend | Vercel | Project root directory: `frontend`; Vite build |
| FastAPI API | Render | Build: `pip install -r requirements.txt`; start: `bash start.sh` |
| PostgreSQL | Neon | Private `DATABASE_URL` environment variable |

The Render startup script runs `alembic upgrade head` before starting Uvicorn.

Production credentials are configured as Render environment variables (`DATABASE_URL`, `SECRET_KEY` and `USDA_API_KEY`); they are **not** included in the repository.

## Planned improvements

NutraLog is usable today. These are **future enhancements**, not implemented features:

- **API security and reliability:** Rate limiting for authentication and food search, stronger automated authorisation tests and improved production error monitoring.
- **Reusable meals:** Save combinations of foods and log them again quickly.
- **Recent foods:** Quickly re-log recently used foods.
- **More nutrition detail:** Display daily micronutrient totals when data is available.
- **Barcode lookup:** Streamline logging packaged foods.
- **Usability refinements:** Improve meal-entry controls and validation around recommended calorie targets.

## Acknowledgements

Food search and nutrition information are powered by the [USDA FoodData Central API](https://fdc.nal.usda.gov/).

Nutritional calculations are estimates and are not medical advice.
