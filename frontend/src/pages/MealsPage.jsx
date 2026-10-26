
import { useEffect, useState } from "react";
import { ChevronDown, Plus, Search, Pencil, ScanLine } from "lucide-react";
import { getFoodEntries } from "../api/client";
import FoodDiary from "./FoodDiary";

const meals = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snacks", label: "Snacks" },
];

function MealsPage({ day, onDayChange, onSearch, onManualLog }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadEntries() {
      setLoading(true);
      setError("");

      try {
        const data = await getFoodEntries(day);

        if (active) setEntries(data);
      } catch (err) {
        if (active) {
          setError(err.message);
          setEntries([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadEntries();

    return () => {
      active = false;
    };
  }, [day]);

  async function refreshEntries() {
    const data = await getFoodEntries(day);
    setEntries(data);
  }

  function getTotals(foods) {
    return foods.reduce(
      (totals, food) => ({
        calories: totals.calories + food.calories,
        protein: totals.protein + food.protein,
        carbs: totals.carbs + food.carbs,
        fats: totals.fats + food.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }

  return (
    <>
      <div className="profile-header">
        <div>
          <p className="subtitle">FOOD DIARY</p>
          <h1>Meals</h1>
          <p className="description">
            Log foods and review what you've eaten throughout the day.
          </p>
        </div>

        <div className="dashboard-date">
          <label htmlFor="meals-date">Date</label>
          <input
            id="meals-date"
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

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p className="food-message">Loading your meals...</p>
      ) : (
        <div className="meals-grid">
          {meals.map((meal) => {
            const mealEntries = entries.filter(
              (entry) => entry.meal_type === meal.key
            );

            const totals = getTotals(mealEntries);

            return (
              <section className="meal-panel" key={meal.key}>
                <div className="meal-panel-header">
                  <div className="meal-panel-info">
                    <h3>{meal.label}</h3>

                    <div className="meal-panel-calories">
                      <strong>{totals.calories}</strong>
                      <span>kcal</span>
                    </div>
                  </div>

                  <div className="meal-add-wrapper">
                    <button
                      type="button"
                      className="meal-add-button"
                      aria-label={`Add food to ${meal.label}`}
                      aria-expanded={openMenu === meal.key}
                      onClick={() =>
                        setOpenMenu(
                          openMenu === meal.key ? null : meal.key
                        )
                      }
                    >
                      <Plus size={17} aria-hidden="true" />
                      Add
                    </button>

                    {openMenu === meal.key && (
                      <div className="meal-add-menu">
                        <button
                          type="button"
                          onClick={() => onSearch(meal.key)}
                        >
                          <Search size={16} aria-hidden="true" />
                          Search food
                        </button>

                        <button
                          type="button"
                          onClick={() => onManualLog(meal.key)}
                        >
                          <Pencil size={16} aria-hidden="true" />
                          Add manually
                        </button>

                        <button type="button" disabled>
                          <ScanLine size={16} aria-hidden="true" />
                          Scan barcode (soon)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="meal-panel-macros">
                  <span>Protein {totals.protein.toFixed(1)} g</span>
                  <span>Carbs {totals.carbs.toFixed(1)} g</span>
                  <span>Fats {totals.fats.toFixed(1)} g</span>
                </div>

                <details className="meal-dropdown">
                  <summary>
                    <span>
                      Logged foods ({mealEntries.length})
                    </span>
                    <ChevronDown
                      size={17}
                      aria-hidden="true"
                    />
                  </summary>

                  <FoodDiary
                    entries={mealEntries}
                    onChanged={refreshEntries}
                  />
                </details>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

export default MealsPage;
