
import { useEffect, useState } from "react";
import {
  getFoodEntries,
  updateManualEntry,
  updateUsdaEntryQuantity,
  moveFoodEntry,
  deleteFoodEntry,
} from "../api/client";

const meals = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snacks", label: "Snacks" },
];

function FoodDiary({ day, revision, onChanged }) {
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEntries() {
      setLoading(true);
      setError("");
      setEditingId(null);

      try {
        const data = await getFoodEntries(day);

        if (active) {
          setEntries(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setEntries([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEntries();

    return () => {
      active = false;
    };
  }, [day, revision]);

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
      quantity_g: entry.quantity_g?.toString() ?? "",
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

  async function handleSave(event) {
    event.preventDefault();

    const entry = entries.find((item) => item.id === editingId);
    if (!entry) return;

    const isUsda = entry.quantity_g != null;

    if (isUsda) {
      if (!Number.isFinite(Number(form.quantity_g)) ||
          Number(form.quantity_g) <= 0) {
        setError("Enter a valid quantity in grams.");
        return;
      }
    } else {
      const values = [
        Number(form.protein),
        Number(form.carbs),
        Number(form.fats),
      ];

      if (
        !form.name_of_food.trim() ||
        !Number.isInteger(Number(form.calories)) ||
        Number(form.calories) < 0 ||
        values.some((value) => !Number.isFinite(value) || value < 0)
      ) {
        setError("Please enter valid food and nutrition values.");
        return;
      }
    }

    setError("");
    setSaving(true);

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

      setEditingId(null);
      setMessage("Food entry updated.");
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleMove() {
    if (!form.date_logged) {
      setError("Choose a valid date.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      await moveFoodEntry(editingId, form.date_logged);

      setEditingId(null);
      setMessage(`Entry moved to ${form.date_logged}.`);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entry) {
    const confirmed = window.confirm(
      `Delete "${entry.name_of_food}" from your diary?`
    );

    if (!confirmed) return;

    setError("");
    setSaving(true);

    try {
      await deleteFoodEntry(entry.id);

      setEditingId(null);
      setMessage("Food entry deleted.");
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="summary-card diary-section">
      <div className="diary-heading">
        <div>
          <h3>Food diary</h3>
          <p>Individual entries for {day}</p>
        </div>

        <span className="diary-count">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {message && <p className="diary-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Loading food diary...</p>
      ) : entries.length === 0 ? (
        <p>No food entries logged for this day.</p>
      ) : (
        meals.map(({ key, label }) => {
          const mealEntries = entries.filter(
            (entry) => entry.meal_type === key
          );

          return (
            <div className="diary-meal" key={key}>
              <h4>{label}</h4>

              {mealEntries.length === 0 ? (
                <p className="diary-empty">No foods logged.</p>
              ) : (
                mealEntries.map((entry) => {
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
                        <span>Protein: {entry.protein.toFixed(1)} g</span>
                        <span>Carbs: {entry.carbs.toFixed(1)} g</span>
                        <span>Fats: {entry.fats.toFixed(1)} g</span>
                      </div>

                      {isEditing ? (
                        <div className="diary-editor">
                          <form onSubmit={handleSave}>
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

                                <p className="diary-note">
                                  FastAPI will recalculate nutrition from USDA.
                                </p>
                              </div>
                            ) : (
                              <div className="diary-edit-grid">
                                <div className="profile-field diary-full">
                                  <label htmlFor="edit-name">
                                    Food name
                                  </label>
                                  <input
                                    id="edit-name"
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
                                    <label htmlFor={`edit-${name}`}>
                                      {label}
                                    </label>
                                    <input
                                      id={`edit-${name}`}
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
                                  <label htmlFor="edit-meal">Meal</label>
                                  <select
                                    id="edit-meal"
                                    name="meal_type"
                                    value={form.meal_type}
                                    onChange={handleChange}
                                  >
                                    {meals.map((meal) => (
                                      <option key={meal.key} value={meal.key}>
                                        {meal.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={saving}
                              className="diary-save"
                            >
                              {saving ? "Saving..." : "Save changes"}
                            </button>
                          </form>

                          <div className="diary-move">
                            <div className="profile-field">
                              <label htmlFor={`move-${entry.id}`}>
                                Move to another date
                              </label>
                              <input
                                id={`move-${entry.id}`}
                                name="date_logged"
                                type="date"
                                value={form.date_logged}
                                onChange={handleChange}
                              />
                            </div>

                            <button
                              type="button"
                              className="secondary-button"
                              onClick={handleMove}
                              disabled={
                                saving ||
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
                            onClick={() => {
                              setEditingId(null);
                              setError("");
                            }}
                            disabled={saving}
                          >
                            Cancel editing
                          </button>
                        </div>
                      ) : (
                        <div className="diary-entry-actions">
                          <button
                            type="button"
                            onClick={() => startEditing(entry)}
                            disabled={saving}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="diary-delete"
                            onClick={() => handleDelete(entry)}
                            disabled={saving}
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
        })
      )}
    </section>
  );
}

export default FoodDiary;
