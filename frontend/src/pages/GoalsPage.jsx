
import { useEffect, useState } from "react";
import {
  getUserGoal,
  getGoalRecommendation,
  saveUserGoal,
} from "../api/client";

const defaultManual = {
  calorie_target: "2000",
  protein_percent: "25",
  carb_percent: "45",
  fat_percent: "30",
};

function GoalsPage({ onBack }) {
  const [goal, setGoal] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [manual, setManual] = useState(defaultManual);
  const [mode, setMode] = useState("choose");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadGoal() {
      try {
        const savedGoal = await getUserGoal();

        if (!active) return;

        if (savedGoal) {
          setGoal(savedGoal);
          setMode("view");

          const protein = Number(
            ((savedGoal.protein_target * 4 / savedGoal.calorie_target) * 100)
              .toFixed(1)
          );

          const carbs = Number(
            ((savedGoal.carb_target * 4 / savedGoal.calorie_target) * 100)
              .toFixed(1)
          );

          setManual({
            calorie_target: String(savedGoal.calorie_target),
            protein_percent: String(protein),
            carb_percent: String(carbs),
            fat_percent: String(
              Number((100 - protein - carbs).toFixed(1))
            ),
          });
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadGoal();

    return () => {
      active = false;
    };
  }, []);

  function handleManualChange(event) {
    const { name, value } = event.target;

    setManual((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleRecommendation() {
    setError("");
    setLoading(true);

    try {
      const data = await getGoalRecommendation();
      setRecommendation(data);
      setMode("recommendation");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveGoal(goalData) {
    setSaving(true);
    setError("");

    try {
      const savedGoal = await saveUserGoal(goalData, goal !== null);
      setGoal(savedGoal);
      setMode("view");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleAcceptRecommendation() {
    if (!recommendation) return;

    saveGoal({
      calorie_target: recommendation.calorie_target,
      protein_target: recommendation.protein_target,
      carb_target: recommendation.carb_target,
      fat_target: recommendation.fat_target,
    });
  }

  function handleManualSubmit(event) {
    event.preventDefault();
    setError("");

    const calories = Number(manual.calorie_target);
    const protein = Number(manual.protein_percent);
    const carbs = Number(manual.carb_percent);
    const fats = Number(manual.fat_percent);

    if (!Number.isInteger(calories) || calories <= 0) {
      setError("Enter a valid daily calorie target.");
      return;
    }

    if (
      [protein, carbs, fats].some(
        (value) => !Number.isFinite(value) || value <= 0 || value > 100
      )
    ) {
      setError("Each macro percentage must be greater than 0.");
      return;
    }

    if (Math.abs(protein + carbs + fats - 100) > 0.001) {
      setError("Your macro percentages must add up to 100%.");
      return;
    }

    saveGoal({
      calorie_target: calories,
      protein_target: Number((calories * protein / 100 / 4).toFixed(1)),
      carb_target: Number((calories * carbs / 100 / 4).toFixed(1)),
      fat_target: Number((calories * fats / 100 / 9).toFixed(1)),
    });
  }

  const calories = Number(manual.calorie_target);
  const proteinGrams = (calories * Number(manual.protein_percent) / 400).toFixed(1);
  const carbGrams = (calories * Number(manual.carb_percent) / 400).toFixed(1);
  const fatGrams = (calories * Number(manual.fat_percent) / 900).toFixed(1);

  return (
    <>
      <div className="profile-header">
        <div>
          <p className="subtitle">NUTRITION GOALS</p>
          <h1>Your daily targets</h1>
          <p className="description">
            Choose recommended targets or set your own.
          </p>
        </div>

        <button className="secondary-button" onClick={onBack}>
          Back to profile
        </button>
      </div>

      <section className="goal-card">
        {loading ? (
          <p>Loading nutrition goals...</p>
        ) : (
          <>
            {mode === "choose" && (
              <>
                <h3>Choose how to set your goals</h3>

                <div className="goal-options">
                  <div className="goal-option">
                    <h4>Recommended goals</h4>
                    <p>
                      Calculate calorie and macro targets using your
                      profile, activity level and fitness goal.
                    </p>
                    <button onClick={handleRecommendation}>
                      Get recommendation
                    </button>
                  </div>

                  <div className="goal-option">
                    <h4>Set goals manually</h4>
                    <p>
                      Choose your daily calories and how much of them
                      should come from protein, carbs and fats.
                    </p>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setError("");
                        setMode("manual");
                      }}
                    >
                      Set manually
                    </button>
                  </div>
                </div>
              </>
            )}

            {mode === "recommendation" && recommendation && (
              <>
                <h3>Your recommendation</h3>

                <div className="goal-calories">
                  <span>Daily calorie target</span>
                  <strong>{recommendation.calorie_target} kcal</strong>
                </div>

                <div className="goal-macros">
                  <div>
                    <span>Protein</span>
                    <strong>{recommendation.protein_target} g</strong>
                  </div>
                  <div>
                    <span>Carbs</span>
                    <strong>{recommendation.carb_target} g</strong>
                  </div>
                  <div>
                    <span>Fats</span>
                    <strong>{recommendation.fat_target} g</strong>
                  </div>
                </div>

                {recommendation.estimated_goal_date && (
                  <p className="goal-note">
                    Estimated goal date:{" "}
                    {recommendation.estimated_goal_date}
                  </p>
                )}

                <p className="goal-note">
                  These values are estimates based on your profile.
                </p>

                <div className="goal-actions">
                  <button
                    onClick={handleAcceptRecommendation}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Accept recommendation"}
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => setMode("choose")}
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {mode === "manual" && (
              <>
                <h3>Set your own targets</h3>

                <form onSubmit={handleManualSubmit}>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <label htmlFor="calories">
                        Daily calories (kcal)
                      </label>
                      <input
                        id="calories"
                        name="calorie_target"
                        type="number"
                        min="1"
                        step="1"
                        value={manual.calorie_target}
                        onChange={handleManualChange}
                        required
                      />
                    </div>

                    <div className="profile-field">
                      <label htmlFor="protein">Protein (%)</label>
                      <input
                        id="protein"
                        name="protein_percent"
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.1"
                        value={manual.protein_percent}
                        onChange={handleManualChange}
                        required
                      />
                    </div>

                    <div className="profile-field">
                      <label htmlFor="carbs">Carbs (%)</label>
                      <input
                        id="carbs"
                        name="carb_percent"
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.1"
                        value={manual.carb_percent}
                        onChange={handleManualChange}
                        required
                      />
                    </div>

                    <div className="profile-field">
                      <label htmlFor="fats">Fats (%)</label>
                      <input
                        id="fats"
                        name="fat_percent"
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.1"
                        value={manual.fat_percent}
                        onChange={handleManualChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="goal-preview">
                    <h4>Calculated macro targets</h4>
                    <p>Protein: {proteinGrams} g</p>
                    <p>Carbs: {carbGrams} g</p>
                    <p>Fats: {fatGrams} g</p>
                    <p className="goal-note">
                      Percentages must total 100%.
                    </p>
                  </div>

                  <div className="goal-actions">
                    <button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save goals"}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setError("");
                        setMode(goal ? "view" : "choose");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}

            {mode === "view" && goal && (
              <>
                <h3>Saved nutrition goals</h3>

                <div className="goal-calories">
                  <span>Daily calorie target</span>
                  <strong>{goal.calorie_target} kcal</strong>
                </div>

                <div className="goal-macros">
                  <div>
                    <span>Protein</span>
                    <strong>{goal.protein_target} g</strong>
                  </div>
                  <div>
                    <span>Carbs</span>
                    <strong>{goal.carb_target} g</strong>
                  </div>
                  <div>
                    <span>Fats</span>
                    <strong>{goal.fat_target} g</strong>
                  </div>
                </div>

                <div className="goal-actions">
                  <button
                    onClick={() => {
                      setError("");
                      setMode("manual");
                    }}
                  >
                    Edit goals
                  </button>

                  <button
                    className="secondary-button"
                    onClick={handleRecommendation}
                  >
                    New recommendation
                  </button>
                </div>
              </>
            )}

            {error && <p className="error-message goal-error">{error}</p>}
          </>
        )}
      </section>
    </>
  );
}

export default GoalsPage;
