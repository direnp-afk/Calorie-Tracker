
import { useState } from "react";
import {
  updateManualEntry,
  updateUsdaEntryQuantity,
  moveFoodEntry,
  deleteFoodEntry,
} from "../api/client";

const mealOptions = [
  ["breakfast", "Breakfast"],
  ["lunch", "Lunch"],
  ["dinner", "Dinner"],
  ["snacks", "Snacks"],
];

function FoodDiary({ entries, onChanged }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function startEditing(entry) {
    setEditingId(entry.id);
    setError("");
    setMessage("");

    setForm({
      name_of_food: entry.name_of_food,
      calories: String(entry.calories),
      protein: String(entry.protein),
      carbs: String(entry.carbs),
      fats: String(entry.fats),
      meal_type: entry.meal_type,
      quantity_g: String(entry.quantity_g ?? ""),
      date_logged: entry.date_logged,
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSave(event, entry) {
    event.preventDefault();
    setError("");

    const isUsda = entry.quantity_g != null;

    if (isUsda) {
      if (!Number.isFinite(Number(form.quantity_g)) ||
          Number(form.quantity_g) <= 0) {
        setError("Enter a valid quantity.");
        return;
      }
    } else {
      const calories = Number(form.calories);
      const macros = [
        Number(form.protein),
        Number(form.carbs),
        Number(form.fats),
      ];

      if (
        !form.name_of_food.trim() ||
        !Number.isInteger(calories) ||
        calories < 0 ||
        macros.some((value) => !Number.isFinite(value) || value < 0)
      ) {
        setError("Please check your food details.");
        return;
      }
    }

    setBusy(true);

    try {
      if (isUsda) {
        await updateUsdaEntryQuantity(
          entry.id,
          Number(form.quantity_g)
        );
      } else {
        await updateManualEntry(entry.id, {
          name_of_food: form.name_of_food.trim(),
          calories: Number(form.calories),
          protein: Number(form.protein),
          carbs: Number(form.carbs),
          fats: Number(form.fats),
          meal_type: form.meal_type,
          date_logged: entry.date_logged,
        });
      }

      await onChanged();

      setEditingId(null);
      setMessage("Entry updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleMove(entry) {
    if (!form.date_logged ||
        form.date_logged === entry.date_logged) {
      return;
    }

    setError("");
    setBusy(true);

    try {
      await moveFoodEntry(entry.id, form.date_logged);
      await onChanged();
      setEditingId(null);
      setMessage("Entry moved to the selected date.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(entry) {
    if (!window.confirm(`Delete "${entry.name_of_food}"?`)) {
      return;
    }

    setError("");
    setBusy(true);

    try {
      await deleteFoodEntry(entry.id);
      await onChanged();
      setEditingId(null);
      setMessage("Entry deleted.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="meal-diary-content">
      {message && (
        <p className="diary-message" role="status">{message}</p>
      )}

      {error && (
        <p className="error-message" role="alert">{error}</p>
      )}

      {entries.length === 0 ? (
        <p className="diary-empty">No foods logged yet.</p>
      ) : (
        entries.map((entry) => {
          const isUsda = entry.quantity_g != null;
          const isEditing = editingId === entry.id;

          return (
            <div className="diary-entry" key={entry.id}>
              <div className="diary-entry-header">
                <div>
                  <h5>{entry.name_of_food}</h5>
                  <p>
                    {isUsda
                      ? `USDA · ${entry.quantity_g} g`
                      : "Manual entry"}
                  </p>
                </div>

                <strong>{entry.calories} kcal</strong>
              </div>

              <div className="diary-entry-macros">
                <span>P {entry.protein.toFixed(1)} g</span>
                <span>C {entry.carbs.toFixed(1)} g</span>
                <span>F {entry.fats.toFixed(1)} g</span>
              </div>

              {isEditing ? (
                <div className="diary-editor">
                  <form onSubmit={(event) => handleSave(event, entry)}>
                    {isUsda ? (
                      <div className="profile-field">
                        <label htmlFor={`quantity-${entry.id}`}>
                          Quantity (g)
                        </label>
                        <input
                          id={`quantity-${entry.id}`}
                          name="quantity_g"
                          type="number"
                          min="0.01"
                          step="any"
                          value={form.quantity_g}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    ) : (
                      <div className="diary-edit-grid">
                        <div className="profile-field diary-full">
                          <label htmlFor={`name-${entry.id}`}>
                            Food name
                          </label>
                          <input
                            id={`name-${entry.id}`}
                            name="name_of_food"
                            value={form.name_of_food}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        {[
                          ["calories", "Calories (kcal)"],
                          ["protein", "Protein (g)"],
                          ["carbs", "Carbs (g)"],
                          ["fats", "Fats (g)"],
                        ].map(([name, label]) => (
                          <div className="profile-field" key={name}>
                            <label htmlFor={`${name}-${entry.id}`}>
                              {label}
                            </label>
                            <input
                              id={`${name}-${entry.id}`}
                              name={name}
                              type="number"
                              min="0"
                              step={name === "calories" ? "1" : "any"}
                              value={form[name]}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        ))}

                        <div className="profile-field diary-full">
                          <label htmlFor={`meal-${entry.id}`}>
                            Meal
                          </label>
                          <select
                            id={`meal-${entry.id}`}
                            name="meal_type"
                            value={form.meal_type}
                            onChange={handleChange}
                          >
                            {mealOptions.map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="diary-save"
                      disabled={busy}
                    >
                      {busy ? "Saving..." : "Save changes"}
                    </button>
                  </form>

                  <div className="diary-move">
                    <div className="profile-field">
                      <label htmlFor={`date-${entry.id}`}>
                        Move to another date
                      </label>
                      <input
                        id={`date-${entry.id}`}
                        name="date_logged"
                        type="date"
                        value={form.date_logged}
                        onChange={handleChange}
                      />
                    </div>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleMove(entry)}
                      disabled={
                        busy ||
                        !form.date_logged ||
                        form.date_logged === entry.date_logged
                      }
                    >
                      Move entry
                    </button>
                  </div>

                  <button
                    type="button"
                    className="diary-cancel"
                    disabled={busy}
                    onClick={() => {
                      setEditingId(null);
                      setError("");
                    }}
                  >
                    Cancel editing
                  </button>
                </div>
              ) : (
                <div className="diary-entry-actions">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => startEditing(entry)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="diary-delete"
                    disabled={busy}
                    onClick={() => handleDelete(entry)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default FoodDiary;
