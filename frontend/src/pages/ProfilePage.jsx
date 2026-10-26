
import { useEffect, useState } from "react";
import { getUserProfile, saveUserProfile } from "../api/client";

const emptyProfile = {
  gender: "",
  age: "",
  weight_kg: "",
  height_cm: "",
  activity_level: "",
  fitness_goal: "",
  goal_weight_kg: "",
  weekly_weight_change_kg: "",
};

function ProfilePage({ email, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyProfile);
  const [editing, setEditing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const savedProfile = await getUserProfile();

        if (!active) return;

        if (savedProfile) {
          setProfile(savedProfile);

          setForm({
            gender: savedProfile.gender,
            age: String(savedProfile.age),
            weight_kg: String(savedProfile.weight_kg),
            height_cm: String(savedProfile.height_cm),
            activity_level: savedProfile.activity_level,
            fitness_goal: savedProfile.fitness_goal,
            goal_weight_kg: savedProfile.goal_weight_kg ?? "",
            weekly_weight_change_kg:
              savedProfile.weekly_weight_change_kg?.toString() ?? "",
          });

          setEditing(false);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  const needsWeightGoal =
    form.fitness_goal === "lose" || form.fitness_goal === "gain";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (needsWeightGoal) {
      const currentWeight = Number(form.weight_kg);
      const targetWeight = Number(form.goal_weight_kg);

      if (form.fitness_goal === "lose" && targetWeight >= currentWeight) {
        setError("Your target weight must be below your current weight.");
        return;
      }

      if (form.fitness_goal === "gain" && targetWeight <= currentWeight) {
        setError("Your target weight must be above your current weight.");
        return;
      }
    }

    const profileData = {
      gender: form.gender,
      age: Number(form.age),
      weight_kg: Number(form.weight_kg),
      height_cm: Number(form.height_cm),
      activity_level: form.activity_level,
      fitness_goal: form.fitness_goal,
      goal_weight_kg: needsWeightGoal
        ? Number(form.goal_weight_kg)
        : null,
      weekly_weight_change_kg: needsWeightGoal
        ? form.weekly_weight_change_kg
        : null,
    };

    setSaving(true);

    try {
      const savedProfile = await saveUserProfile(
        profileData,
        profile !== null
      );

      setProfile(savedProfile);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="profile-header">
        <div>
          <p className="subtitle">YOUR ACCOUNT</p>
          <h1>{profile ? "Your profile" : "Set up your profile"}</h1>
          <p className="description">
            {profile
              ? `Signed in as ${email}`
              : "Tell us a little about yourself to set up your nutrition goals."}
          </p>
        </div>

        <button className="secondary-button" onClick={onLogout}>
          Log out
        </button>
      </div>

      <section className="profile-card">
        {loading ? (
          <p>Loading your profile...</p>
        ) : editing ? (
          <>
            <h3>{profile ? "Edit profile" : "Your details"}</h3>

            <form onSubmit={handleSubmit}>
              <div className="profile-grid">
                <div className="profile-field">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer_not_to_say">
                      Prefer not to say
                    </option>
                  </select>
                </div>

                <div className="profile-field">
                  <label htmlFor="age">Age</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="119"
                    step="1"
                    value={form.age}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="weight">Current weight (kg)</label>
                  <input
                    id="weight"
                    name="weight_kg"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={form.weight_kg}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="height">Height (cm)</label>
                  <input
                    id="height"
                    name="height_cm"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={form.height_cm}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="activity">Activity level</label>
                  <select
                    id="activity"
                    name="activity_level"
                    value={form.activity_level}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select activity level</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="lightly_active">Lightly active</option>
                    <option value="moderately_active">
                      Moderately active
                    </option>
                    <option value="very_active">Very active</option>
                  </select>
                </div>

                <div className="profile-field">
                  <label htmlFor="goal">Fitness goal</label>
                  <select
                    id="goal"
                    name="fitness_goal"
                    value={form.fitness_goal}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your goal</option>
                    <option value="lose">Lose weight</option>
                    <option value="maintain">Maintain weight</option>
                    <option value="gain">Gain weight</option>
                  </select>
                </div>

                {needsWeightGoal && (
                  <>
                    <div className="profile-field">
                      <label htmlFor="goalWeight">
                        Target weight (kg)
                      </label>
                      <input
                        id="goalWeight"
                        name="goal_weight_kg"
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={form.goal_weight_kg}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="profile-field">
                      <label htmlFor="weeklyChange">
                        Weekly weight change
                      </label>
                      <select
                        id="weeklyChange"
                        name="weekly_weight_change_kg"
                        value={form.weekly_weight_change_kg}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select weekly rate</option>
                        {[
                          "0.15",
                          "0.25",
                          "0.375",
                          "0.5",
                          "0.625",
                          "0.75",
                          "0.875",
                          "1.0",
                        ].map((rate) => (
                          <option key={rate} value={rate}>
                            {rate} kg/week
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="profile-actions">
                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save profile"}
                </button>

                {profile && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setEditing(false);
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </>
        ) : (
          <>
            <h3>Profile details</h3>

            <div className="profile-details">
              <p><strong>Gender:</strong> {profile.gender.replaceAll("_", " ")}</p>
              <p><strong>Age:</strong> {profile.age}</p>
              <p><strong>Weight:</strong> {profile.weight_kg} kg</p>
              <p><strong>Height:</strong> {profile.height_cm} cm</p>
              <p>
                <strong>Activity:</strong>{" "}
                {profile.activity_level.replaceAll("_", " ")}
              </p>
              <p>
                <strong>Goal:</strong> {profile.fitness_goal}
              </p>

              {profile.fitness_goal !== "maintain" && (
                <>
                  <p>
                    <strong>Target weight:</strong>{" "}
                    {profile.goal_weight_kg} kg
                  </p>
                  <p>
                    <strong>Weekly change:</strong>{" "}
                    {profile.weekly_weight_change_kg} kg/week
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => {
                setError("");
                setEditing(true);
              }}
            >
              Edit profile
            </button>

            <p className="profile-next">
              Profile saved. Nutrition goal setup will be added next.
            </p>
          </>
        )}
      </section>
    </>
  );
}

export default ProfilePage;
