
import { useState } from "react";
import { logManualFood, logSearchedFood } from "../api/client";

const emptyFood = {
  name_of_food: "",
  calories: "",
  protein: "",
  carbs: "",
  fats: "",
};

function FoodLogPage({food, defaultDay, defaultMeal = "breakfast", onSaved, onCancel,}) {
  const [meal, setMeal] = useState(defaultMeal);
  const [day, setDay] = useState(defaultDay);
  const [manual, setManual] = useState(emptyFood);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setManual((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (food) {
        await logSearchedFood({
          fdc_id: food.id,
          quantity_g: food.quantityG,
          meal_type: meal,
          date_logged: day,
        });
      } else {
        await logManualFood({
          name_of_food: manual.name_of_food.trim(),
          calories: Number(manual.calories),
          protein: Number(manual.protein),
          carbs: Number(manual.carbs),
          fats: Number(manual.fats),
          meal_type: meal,
          date_logged: day,
        });
      }

      onSaved(day);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend."
          : err.message
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="profile-header">
        <div>
          <p className="subtitle">FOOD DIARY</p>
          <h1>{food ? "Log selected food" : "Add food manually"}</h1>

          <p className="description">
            Choose a meal and date to add an entry to your food diary.
          </p>
        </div>

        <button className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <section className="food-log-card">
        {food ? (
          <div className="food-log-selected">
            <span className="food-log-label">SELECTED FOOD</span>

            <h3>{food.name}</h3>

            <p>{food.quantityG} g</p>

            <div className="food-log-nutrition">
              <span>
                {food.calories ?? "N/A"} kcal
              </span>
              <span>
                Protein: {food.protein ?? "N/A"} g
              </span>
              <span>
                Carbs: {food.carbs ?? "N/A"} g
              </span>
              <span>
                Fat: {food.fats ?? "N/A"} g
              </span>
            </div>
          </div>
        ) : (
          <div className="food-log-manual">
            <h3>Food details</h3>

            <p className="food-log-help">
              Enter the nutritional values for the amount you ate.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!food && (
            <div className="food-log-grid">
              <div className="profile-field food-log-full">
                <label htmlFor="food-name">Food name</label>
                <input
                  id="food-name"
                  name="name_of_food"
                  type="text"
                  placeholder="e.g. Homemade chicken sandwich"
                  value={manual.name_of_food}
                  onChange={handleChange}
                  maxLength={200}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="food-calories">Calories (kcal)</label>
                <input
                  id="food-calories"
                  name="calories"
                  type="number"
                  min="0"
                  step="1"
                  value={manual.calories}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="food-protein">Protein (g)</label>
                <input
                  id="food-protein"
                  name="protein"
                  type="number"
                  min="0"
                  step="any"
                  value={manual.protein}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="food-carbs">Carbs (g)</label>
                <input
                  id="food-carbs"
                  name="carbs"
                  type="number"
                  min="0"
                  step="any"
                  value={manual.carbs}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="food-fats">Fats (g)</label>
                <input
                  id="food-fats"
                  name="fats"
                  type="number"
                  min="0"
                  step="any"
                  value={manual.fats}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <h3 className="food-log-section-title">Log details</h3>

          <div className="food-log-grid">
            <div className="profile-field">
              <label htmlFor="meal-type">Meal</label>
              <select
                id="meal-type"
                value={meal}
                onChange={(event) => setMeal(event.target.value)}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>

            <div className="profile-field">
              <label htmlFor="food-date">Date</label>
              <input
                id="food-date"
                type="date"
                value={day}
                onChange={(event) => setDay(event.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="error-message food-log-error">{error}</p>}

          <div className="food-log-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving food..." : "Log food"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

export default FoodLogPage;
