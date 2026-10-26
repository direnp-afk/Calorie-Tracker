
import { useEffect, useState } from "react";
import { loginUser, registerUser, verifyUser } from "./api/client";
import ProfilePage from "./pages/ProfilePage";
import GoalsPage from "./pages/GoalsPage";
import DashboardPage from "./pages/DashboardPage";
import FoodSearchPage from "./pages/FoodSearchPage";
import FoodLogPage from "./pages/FoodLogPage";
import AccountPage from "./pages/AccountPage";
import "./App.css";
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  UserRound,
  Target,
  Settings2,
} from "lucide-react";


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
    setPage("profile");
    setDashboardDay(getToday());
    setFoodToLog(null);
    setMode("login");
    setError("");
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setPassword("");
    setError("");
  }

  function openFoodLog(food = null) {
    setFoodToLog(food);
    setPage("food-log");
  }

  function handleFoodSaved(day) {
    setDashboardDay(day);
    setFoodToLog(null);
    setPage("dashboard");
  }

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
                aria-current={page === "dashboard" ? "page" : undefined}
              >
                <LayoutDashboard size={19} strokeWidth={1.8} aria-hidden="true" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                className={page === "food-search" ? "active" : ""}
                onClick={() => setPage("food-search")}
                aria-current={page === "food-search" ? "page" : undefined}
              >
                <Search size={19} strokeWidth={1.8} aria-hidden="true" />
                <span>Search</span>
              </button>

              <button
                type="button"
                className={page === "food-log" ? "active" : ""}
                onClick={() => openFoodLog()}
                aria-current={page === "food-log" ? "page" : undefined}
              >
                <PlusCircle size={19} strokeWidth={1.8} aria-hidden="true" />
                <span>Log food</span>
              </button>

              <button
                type="button"
                className={`nav-secondary ${page === "profile" ? "active" : ""}`}
                onClick={() => setPage("profile")}
                aria-current={page === "profile" ? "page" : undefined}
              >
                <UserRound size={19} strokeWidth={1.8} aria-hidden="true" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                className={`nav-secondary ${page === "goals" ? "active" : ""}`}
                onClick={() => setPage("goals")}
                aria-current={page === "goals" ? "page" : undefined}
              >
                <Target size={19} strokeWidth={1.8} aria-hidden="true" />
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
                aria-current={page === "account" ? "page" : undefined}
              >
                <Settings2 size={19} strokeWidth={1.8} aria-hidden="true" />
                <span>Account</span>
              </button>
            </nav>


            {page === "dashboard" ? (
              <DashboardPage
                day={dashboardDay}
                onDayChange={setDashboardDay}
                onOpenGoals={() => setPage("goals")}
              />
            ) : page === "food-search" ? (
              <FoodSearchPage onLogFood={openFoodLog} />
            ) : page === "food-log" ? (
              <FoodLogPage
                food={foodToLog}
                defaultDay={dashboardDay}
                onSaved={handleFoodSaved}
                onCancel={() =>
                  setPage(foodToLog ? "food-search" : "dashboard")
                }
              />
            ) : page === "goals" ? (
              <GoalsPage onBack={() => setPage("profile")} />
            ) : page === "account" ? (
              <AccountPage
                user={user}
                onUserUpdated={setUser}
                onOpenProfile={() => setPage("profile")}
                onOpenGoals={() => setPage("goals")}
                onLogout={handleLogout}
              />
            ) : (
              <ProfilePage
                email={user.email}
                onLogout={handleLogout}
                onOpenGoals={() => setPage("goals")}
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
              <h3>{mode === "login" ? "Log in" : "Create an account"}</h3>

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
                    mode === "login" ? "current-password" : "new-password"
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
