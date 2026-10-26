
import { useState } from "react";
import { searchFoods, getFoodDetails } from "../api/client";

const micronutrientNames = {
  fiber: "Fibre",
  calcium: "Calcium",
  iron: "Iron",
  potassium: "Potassium",
  sodium: "Sodium",
  vitamin_c: "Vitamin C",
  vitamin_d: "Vitamin D",
};

function displayNutrient(value, unit) {
  return value == null ? "Not available" : `${value} ${unit}`;
}

function FoodSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [details, setDetails] = useState(null);

  const [quantity, setQuantity] = useState("100");
  const [portionIndex, setPortionIndex] = useState(0);

  const [searching, setSearching] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();

    if (!query.trim()) return;

    setSearching(true);
    setError("");
    setResults([]);
    setSelectedFood(null);
    setDetails(null);
    setHasSearched(false);

    try {
      const foods = await searchFoods(query.trim());
      setResults(foods);
      setHasSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  async function handleSelectFood(food) {
    setSelectedFood(food);
    setDetails(null);
    setQuantity("100");
    setPortionIndex(0);
    setError("");
    setLoadingDetails(true);

    try {
      const foodDetails = await getFoodDetails(food.id, 100);
      setDetails(foodDetails);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  }

  function handlePortionChange(event) {
    const index = Number(event.target.value);

    setPortionIndex(index);
    setQuantity(index === 0 ? "100" : "1");
  }

  async function handleUpdateNutrition(event) {
    event.preventDefault();

    const amount = Number(quantity);
    const portion = details?.portions?.[portionIndex];

    if (!portion || !Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid quantity.");
      return;
    }

    const totalGrams = amount * portion.gram_weight;

    setError("");
    setLoadingDetails(true);

    try {
      const updatedDetails = await getFoodDetails(
        selectedFood.id,
        totalGrams
      );

      setDetails(updatedDetails);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  }

  const micronutrients = Object.entries(
    details?.micronutrients ?? {}
  );

  return (
    <>
      <div className="profile-header">
        <div>
          <p className="subtitle">FOOD DATABASE</p>
          <h1>Food search</h1>
          <p className="description">
            Search foods and view their nutritional information.
          </p>
        </div>
      </div>

      <div className="food-search-layout">
        <section className="food-search-card">
          <h3>Search foods</h3>

          <form className="food-search-form" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search for a food..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              required
            />

            <button
              type="submit"
              disabled={searching || loadingDetails}
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </form>

          <p className="food-search-hint">
            Results provided by USDA FoodData Central.
          </p>

          {searching && <p className="food-message">Searching foods...</p>}

          {!searching && hasSearched && results.length === 0 && (
            <p className="food-message">
              No foods found. Try another search.
            </p>
          )}

          <div className="food-results">
            {results.map((food) => (
              <button
                key={food.id}
                type="button"
                disabled={loadingDetails}
                className={
                  selectedFood?.id === food.id
                    ? "food-result selected"
                    : "food-result"
                }
                onClick={() => handleSelectFood(food)}
              >
                <span>{food.name}</span>
                <small>USDA ID: {food.id}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="food-details-card">
          {!selectedFood ? (
            <div className="food-empty">
              <h3>Nutrition details</h3>
              <p>Select a food from the search results to view its details.</p>
            </div>
          ) : (
            <>
              <h3>{selectedFood.name}</h3>

              {details && (
                <form
                  className="food-portion-form"
                  onSubmit={handleUpdateNutrition}
                >
                  <div className="profile-field">
                    <label htmlFor="portion">Portion</label>
                    <select
                      id="portion"
                      value={portionIndex}
                      onChange={handlePortionChange}
                    >
                      {details.portions.map((portion, index) => (
                        <option key={index} value={index}>
                          {portion.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="profile-field">
                    <label htmlFor="quantity">Quantity</label>
                    <input
                      id="quantity"
                      type="number"
                      min="0.01"
                      step="any"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" disabled={loadingDetails}>
                    Update nutrition
                  </button>
                </form>
              )}

              {loadingDetails && (
                <p className="food-message">Loading nutrition details...</p>
              )}

              {details && (
                <>
                  <p className="food-serving">
                    Nutrition for {details.quantity_g} g
                  </p>

                  <div className="food-calorie-card">
                    <span>Calories</span>
                    <strong>
                      {displayNutrient(details.calories, "kcal")}
                    </strong>
                  </div>

                  <h4 className="food-section-title">Macronutrients</h4>

                  <div className="food-nutrient-grid">
                    <div className="food-nutrient">
                      <span>Protein</span>
                      <strong>
                        {displayNutrient(details.protein, "g")}
                      </strong>
                    </div>

                    <div className="food-nutrient">
                      <span>Carbs</span>
                      <strong>
                        {displayNutrient(details.carbs, "g")}
                      </strong>
                    </div>

                    <div className="food-nutrient">
                      <span>Fats</span>
                      <strong>
                        {displayNutrient(details.fats, "g")}
                      </strong>
                    </div>
                  </div>

                  <h4 className="food-section-title">Micronutrients</h4>

                  {micronutrients.length > 0 ? (
                    <div className="food-micro-grid">
                      {micronutrients.map(([name, nutrient]) => (
                        <div className="food-micro" key={name}>
                          <span>
                            {micronutrientNames[name] ?? name}
                          </span>

                          <strong>
                            {displayNutrient(
                              nutrient.amount,
                              nutrient.unit
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="food-message">
                      No micronutrient information available for this food.
                    </p>
                  )}

                  <p className="food-search-hint">
                    Nutrients are shown when available from USDA.
                    Food logging will be added in the next stage.
                  </p>
                </>
              )}
            </>
          )}

          {error && <p className="error-message food-error">{error}</p>}
        </section>
      </div>
    </>
  );
}

export default FoodSearchPage;
