# Calorie & Nutrition Tracking Application

A full-stack calorie and macronutrient tracking application currently in development, designed to help users log their daily food intake, manage nutritional goals, and monitor their progress.

The project is being built with a Python/FastAPI backend and a planned React frontend, with a focus on RESTful API development, database design, authentication, and maintainable software architecture.

## Technologies

**Backend:** Python, FastAPI, SQLAlchemy, Pydantic

**Database:** SQLite

**Authentication:** JWT, OAuth2, bcrypt (integration in progress)

**Frontend:** React (planned)

**Version Control:** Git and GitHub

## Features

### Implemented Backend Features

- RESTful endpoints supporting CRUD operations for food entries and nutritional goals.
- SQLite database integration using SQLAlchemy ORM.
- Pydantic schemas for request validation and structured API responses.
- Individual food logging with calorie, protein, carbohydrate and fat values.
- Food categorisation into breakfast, lunch, dinner and snacks.
- Filtering of food entries by meal category.
- Database-generated identifiers and timestamps.
- HTTP error handling for missing records.
- Interactive API documentation and endpoint testing through FastAPI Swagger UI.

### In Development

- User registration and login using JWT authentication.
- Secure password hashing and token verification.
- User-specific food entries and nutritional goals.
- Personal fitness profiles containing measurements and activity information.

### Planned Features

- Automatic estimation of calorie and macronutrient targets from user profile information.
- Manual customisation of nutritional goals.
- Daily calorie and macronutrient summaries.
- Remaining daily calories and macros compared with targets.
- React dashboard for logging food and viewing progress.
- Food search using an external nutrition API.
- Barcode-based food lookup and reusable saved meals.
- Automated testing and deployment.

## Project Structure

```text
Calorie-Tracking-Project/
├── backend/
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── config.py
│       ├── auth.py
│       └── routers/
├── frontend/              # Planned React application
├── .gitignore
├── README.md
└── requirements.txt
```

The backend follows a modular structure:

- `main.py` — FastAPI application setup and router registration.
- `database.py` — database engine and session management.
- `models.py` — SQLAlchemy database models.
- `schemas.py` — Pydantic request and response schemas.
- `config.py` — application configuration.
- `auth.py` — authentication and security functions.
- `routers/` — API endpoints organised by resource.

## Running the Backend Locally

### 1. Clone the repository


### 2. Create a virtual environment

```bash
python -m venv .venv
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your_generated_secret_key
```

Generate a secure secret using:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

The `.env` file is excluded from version control to protect sensitive configuration.

### 5. Start the backend

From the project root:

```bash
python -m uvicorn backend.app.main:calorie_app --reload
```

### 6. Open the API documentation

Visit:

http://127.0.0.1:8000/docs

FastAPI provides interactive Swagger documentation for exploring and testing the available endpoints.

## Example API Requests

The food-entry API supports operations such as:

```text
GET     /food_entries
GET     /food_entries/{entry_id}
POST    /food_entries
PUT     /food_entries/{entry_id}
DELETE  /food_entries/{entry_id}
```

Entries can also be filtered by meal category:

```text
GET /food_entries?of_meal_type=breakfast
```

Example food-entry request body:

```json
{
  "name_of_food": "Banana",
  "calories": 105,
  "protein": 1.3,
  "carbs": 27,
  "fats": 0.3,
  "meal_type": "breakfast"
}
```

## Development Goals

The aim is to develop a complete, secure full-stack application while gaining practical experience with:

- REST API design and development.
- Relational databases and ORM integration.
- Authentication and authorisation.
- Frontend/backend integration.
- Automated testing and deployment.
- Git-based version control and incremental development.

## Project Status

**In active development.**

The core food-entry and nutritional-goal backend functionality has been implemented. The current focus is authentication and personalised user data, followed by nutritional calculations and frontend development.
