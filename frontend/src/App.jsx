
import "./App.css";

function App() {
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

        <section className="dashboard-preview">
          <h3>Your dashboard</h3>
          <p>daily nutrition overview will appear here.</p>
        </section>
      </main>
    </div>
  );
}

export default App;
