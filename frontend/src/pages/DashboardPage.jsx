import FoodDiary from "./FoodDiary";
import { useEffect, useState } from "react";
import { getDailySummary } from "../api/client";


function NutrientProgress({ name, consumed, target }) {
  const percentage = target > 0
    ? Math.min((consumed / target) * 100, 100)
    : 0;

  return (
    <div className="nutrient-progress">
      <div className="nutrient-label">
        <span>{name}</span>
        <span>{consumed.toFixed(1)} / {target.toFixed(1)} g</span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

const mealNames = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

function DashboardPage({ onOpenGoals, day, onDayChange }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      setLoading(true);
      setError("");

      try {
        const data = await getDailySummary(day);

        if (active) {
          setSummary(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setSummary(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, [day, revision]);

  const caloriesConsumed = summary?.consumed.calories ?? 0;
  const calorieTarget = summary?.targets.calories ?? 0;

  const caloriePercentage = calorieTarget > 0
    ? Math.min((caloriesConsumed / calorieTarget) * 100, 100)
    : 0;

  return (
    <>
      <div className="profile-header">
        <div>
          <p className="subtitle">DAILY OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="description">
            Track your calories and macros throughout the day.
          </p>
        </div>

        <div className="dashboard-date">
          <label htmlFor="selected-day">Date</label>
          <input
            id="selected-day"
            type="date"
            value={day}
            onChange={(event) => {
              if (event.target.value) {
                onDayChange(event.target.value);
              }
            }}
          />
        </div>
      </div>

      {loading ? (
        <section className="summary-card">
          <p>Loading your daily summary...</p>
        </section>
      ) : error ? (
        <section className="summary-card">
          <p className="error-message">{error}</p>
        </section>
      ) : !summary ? (
        <section className="summary-card">
          <h3>No nutrition goals found</h3>
          <p className="description">
            Set your daily calorie and macro targets to start tracking
            your progress.
          </p>

          <button onClick={onOpenGoals}>
            Set nutrition goals
          </button>
        </section>
      ) : (
        <>
          <div className="dashboard-cards">
            <section className="summary-card">
              <h3>Calories</h3>

              <div className="calorie-total">
                <strong>{caloriesConsumed}</strong>
                <span>/ {calorieTarget} kcal</span>
              </div>

              <div className="progress-track calorie-track">
                <div
                  className="progress-fill"
                  style={{ width: `${caloriePercentage}%` }}
                />
              </div>

              <p className="calorie-remaining">
                {summary.remaining.calories >= 0
                  ? `${summary.remaining.calories} kcal remaining`
                  : `${Math.abs(summary.remaining.calories)} kcal over target`}
              </p>
            </section>

            <section className="summary-card">
              <h3>Macronutrients</h3>

              <NutrientProgress
                name="Protein"
                consumed={summary.consumed.protein}
                target={summary.targets.protein}
              />

              <NutrientProgress
                name="Carbs"
                consumed={summary.consumed.carbs}
                target={summary.targets.carbs}
              />

              <NutrientProgress
                name="Fats"
                consumed={summary.consumed.fats}
                target={summary.targets.fats}
              />
            </section>
          </div>

          <section className="summary-card meals-section">
            <h3>Meals</h3>

            <div className="meal-grid">
              {Object.entries(mealNames).map(([key, label]) => {
                const meal = summary.meals[key];

                return (
                  <div className="meal-card" key={key}>
                    <h4>{label}</h4>

                    <p className="meal-calories">
                      {meal.calories} kcal
                    </p>

                    <div className="meal-macros">
                      <span>Protein: {meal.protein.toFixed(1)} g</span>
                      <span>Carbs: {meal.carbs.toFixed(1)} g</span>
                      <span>Fats: {meal.fats.toFixed(1)} g</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
      <FoodDiary
        day={day}
        revision={revision}
        onChanged={() => setRevision((previous) => previous + 1)}
      />
    </>
  );
}

export default DashboardPage;
