
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Utensils,
  UserRound,
  Target,
  Settings2,
} from "lucide-react";

import { loginUser, registerUser, verifyUser } from "./api/client";
import DashboardPage from "./pages/DashboardPage";
import MealsPage from "./pages/MealsPage";
import FoodSearchPage from "./pages/FoodSearchPage";
import FoodLogPage from "./pages/FoodLogPage";
import ProfilePage from "./pages/ProfilePage";
import GoalsPage from "./pages/GoalsPage";
import AccountPage from "./pages/AccountPage";
import "./App.css";

const TOKEN_KEY = "calorie_tracker_token";

function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const [page, setPage] = useState("profile");
  const [dashboardDay, setDashboardDay] = useState(getToday);
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [foodToLog, setFoodToLog] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(
    Boolean(localStorage.getItem(TOKEN_KEY))
  );

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (!savedToken) return;

    let active = true;

    async function restoreSession() {
      try {
        const loggedInUser = await verifyUser(savedToken);

        if (active) {
          setUser(loggedInUser);
        }
      } catch {
        if (active) {
          localStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await registerUser(email, password);
      }

      const token = await loginUser(email, password);
      const loggedInUser = await verifyUser(token);

      localStorage.setItem(TOKEN_KEY, token);
      setUser(loggedInUser);
      setPage("profile");
      setPassword("");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Make sure FastAPI is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setEmail("");
    setPassword("");
    setMode("login");
    setPage("profile");
    setDashboardDay(getToday());
    setSelectedMeal("breakfast");
    setFoodToLog(null);
    setError("");
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setPassword("");
    setError("");
  }

  function openMealSearch(meal) {
    setSelectedMeal(meal);
    setFoodToLog(null);
    setPage("food-search");
  }

  function openManualLog(meal) {
    setSelectedMeal(meal);
    setFoodToLog(null);
    setPage("food-log");
  }

  function openSelectedFood(food) {
    setFoodToLog(food);
    setPage("food-log");
  }

  function handleFoodSaved(day) {
    setDashboardDay(day);
    setFoodToLog(null);
    setPage("meals");
  }

  const mealsActive = ["meals", "food-search", "food-log"].includes(page);

  return (
    <div className="app">
      <header className="app-header">
        <h2>Calorie Tracker</h2>
      </header>

      <main className="app-main">
        {checkingSession ? (
          <section className="login-card">
            <p>Checking your session...</p>
          </section>
        ) : user ? (
          <>
            <nav className="app-nav" aria-label="Main navigation">
              <button
                type="button"
                className={page === "dashboard" ? "active" : ""}
                onClick={() => setPage("dashboard")}
                aria-current={
                  page === "dashboard" ? "page" : undefined
                }
              >
                <LayoutDashboard size={19} aria-hidden="true" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                className={mealsActive ? "active" : ""}
                onClick={() => setPage("meals")}
                aria-current={mealsActive ? "page" : undefined}
              >
                <Utensils size={19} aria-hidden="true" />
                <span>Meals</span>
              </button>

              <button
                type="button"
                className={
                  page === "profile"
                    ? "nav-secondary active"
                    : "nav-secondary"
                }
                onClick={() => setPage("profile")}
              >
                <UserRound size={19} aria-hidden="true" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                className={
                  page === "goals"
                    ? "nav-secondary active"
                    : "nav-secondary"
                }
                onClick={() => setPage("goals")}
              >
                <Target size={19} aria-hidden="true" />
                <span>Goals</span>
              </button>

              <button
                type="button"
                className={
                  page === "account"
                    ? "active"
                    : ["profile", "goals"].includes(page)
                      ? "mobile-account-active"
                      : ""
                }
                onClick={() => setPage("account")}
              >
                <Settings2 size={19} aria-hidden="true" />
                <span>Account</span>
              </button>
            </nav>

            {page === "dashboard" ? (
              <DashboardPage
                day={dashboardDay}
                onDayChange={setDashboardDay}
                onOpenGoals={() => setPage("goals")}
              />
            ) : page === "meals" ? (
              <MealsPage
                day={dashboardDay}
                onDayChange={setDashboardDay}
                onSearch={openMealSearch}
                onManualLog={openManualLog}
              />
            ) : page === "food-search" ? (
              <FoodSearchPage onLogFood={openSelectedFood} />
            ) : page === "food-log" ? (
              <FoodLogPage
                food={foodToLog}
                defaultDay={dashboardDay}
                defaultMeal={selectedMeal}
                onSaved={handleFoodSaved}
                onCancel={() =>
                  setPage(foodToLog ? "food-search" : "meals")
                }
              />
            ) : page === "profile" ? (
              <ProfilePage
                email={user.email}
                onLogout={handleLogout}
                onOpenGoals={() => setPage("goals")}
              />
            ) : page === "goals" ? (
              <GoalsPage onBack={() => setPage("profile")} />
            ) : (
              <AccountPage
                user={user}
                onUserUpdated={setUser}
                onOpenProfile={() => setPage("profile")}
                onOpenGoals={() => setPage("goals")}
                onLogout={handleLogout}
              />
            )}
          </>
        ) : (
          <>
            <p className="subtitle">NUTRITION TRACKING</p>
            <h1>Track your nutrition.</h1>

            <p className="description">
              Log your meals, track your calories and stay on top of
              your nutrition goals.
            </p>

            <section className="login-card">
              <h3>
                {mode === "login" ? "Log in" : "Create an account"}
              </h3>

              <p className="form-description">
                {mode === "login"
                  ? "Enter your account details to continue."
                  : "Create an account to start tracking your nutrition."}
              </p>

              <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />

                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  minLength={mode === "register" ? 8 : undefined}
                  required
                />

                {error && <p className="error-message">{error}</p>}

                <button type="submit" disabled={loading}>
                  {loading
                    ? "Please wait..."
                    : mode === "login"
                      ? "Log in"
                      : "Create account"}
                </button>
              </form>

              <p className="auth-switch">
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}

                <button type="button" onClick={switchMode}>
                  {mode === "login" ? "Sign up" : "Log in"}
                </button>
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
