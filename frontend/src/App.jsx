import ProfilePage from "./pages/ProfilePage";
import { useEffect, useState } from "react";
import { loginUser, registerUser, verifyUser } from "./api/client";
import "./App.css";

const TOKEN_KEY = "calorie_tracker_token";

function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(
    Boolean(localStorage.getItem(TOKEN_KEY))
  );

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (!savedToken) {
      return;
    }

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
      setPassword("");
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError("Cannot connect to the backend. Make sure FastAPI is running.");
      } else {
        setError(err.message);
      }
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
    setError("");
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setPassword("");
    setError("");
  }

  return (
    <div className="app">
      <header className="app-header">
        <h2>Calorie Tracker</h2>
      </header>

      <main className="app-main">
        <p className="subtitle">NUTRITION TRACKING</p>

        <h1>Track your nutrition.</h1>

        <p className="description">
          Log your meals, track your calories and stay on top of your nutrition goals.
        </p>

        {checkingSession ? (
          <section className="login-card">
            <p>Checking your session...</p>
          </section>
        ) : user ? (
          <ProfilePage email={user.email} onLogout={handleLogout} />
        ) : (
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
                autoComplete={mode === "login" ? "current-password" : "new-password"}
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
        )}
      </main>
    </div>
  );
}

export default App;
