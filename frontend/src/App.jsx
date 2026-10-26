
import { useState } from "react";
import { loginUser, verifyUser } from "./api/client";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = await loginUser(email, password);
      const loggedInUser = await verifyUser(token);

      setUser(loggedInUser);
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setUser(null);
    setEmail("");
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

        {user ? (
          <section className="dashboard-preview">
            <h3>Welcome back!</h3>
            <p>Logged in as {user.email}</p>
            <p>Your dashboard will appear here.</p>

            <button onClick={handleLogout} className="secondary-button">
              Log out
            </button>
          </section>
        ) : (
          <section className="login-card">
            <h3>Log in</h3>
            <p className="form-description">
              Enter your account details to continue.
            </p>

            <form onSubmit={handleLogin}>
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
                autoComplete="current-password"
                required
              />

              {error && <p className="error-message">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
