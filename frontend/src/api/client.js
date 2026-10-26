
export async function loginUser(email, password) {
  const response = await fetch("/api/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: email,
      password: password,
    }),
  });

  if (!response.ok) {
    if (response.status === 404 || response.status === 401) {
      throw new Error("Incorrect email or password.");
    }

    throw new Error("Login failed. Please try again.");
  }

  const data = await response.json();
  return data.access_token;
}

export async function registerUser(email, password) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("An account with this email already exists.");
    }

    if (response.status === 422) {
      throw new Error("Please check your registration details.");
    }

    throw new Error("Registration failed. Please try again.");
  }

  return await response.json();
}

export async function verifyUser(token) {
  const response = await fetch("/api/auth/verify-token", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Could not verify your account.");
  }

  const data = await response.json();
  return data.user;
}



export async function getUserProfile() {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch("/api/profile/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Could not load your profile.");
  }

  return await response.json();
}

export async function saveUserProfile(profileData, hasProfile) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch("/api/profile/me", {
    method: hasProfile ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    if (response.status === 422) {
      throw new Error("Please check your profile details.");
    }

    throw new Error("Could not save your profile.");
  }

  return await response.json();
}



export async function getUserGoal() {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch("/api/goals/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Could not load your nutrition goals.");
  }

  return await response.json();
}

export async function getGoalRecommendation() {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch("/api/goals/recommendation", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : "Could not calculate your recommendation."
    );
  }

  return await response.json();
}

export async function saveUserGoal(goalData, hasGoal) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch(
    hasGoal ? "/api/goals/me" : "/api/goals/",
    {
      method: hasGoal ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(goalData),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : "Could not save your nutrition goals."
    );
  }

  return await response.json();
}


export async function getDailySummary(day) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch(`/api/summary/daily?day=${day}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Could not load your daily summary.");
  }

  return await response.json();
}


export async function searchFoods(query) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch(
    `/api/foods/search?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Could not search foods. Please try again.");
  }

  return await response.json();
}

export async function getFoodDetails(fdcId, quantityG = 100) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch(
    `/api/foods/${fdcId}?quantity_g=${quantityG}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Could not load food details.");
  }

  return await response.json();
}


async function getFoodEntryError(response) {
  const data = await response.json().catch(() => null);

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg).join(". ");
  }

  return "Could not save food entry.";
}

export async function logSearchedFood(foodData) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch("/api/food_entries/from-search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(foodData),
  });

  if (!response.ok) {
    throw new Error(await getFoodEntryError(response));
  }

  return await response.json();
}

export async function logManualFood(foodData) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch("/api/food_entries/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(foodData),
  });

  if (!response.ok) {
    throw new Error(await getFoodEntryError(response));
  }

  return await response.json();
}


export async function getFoodEntries(day) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch(
    `/api/food_entries/me?day=${encodeURIComponent(day)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Could not load your food diary.");
  }

  return await response.json();
}

export async function updateManualEntry(id, data) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch(`/api/food_entries/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await getFoodEntryError(response));
  }

  return await response.json();
}

export async function updateUsdaEntryQuantity(id, quantityG) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch(
    `/api/food_entries/${id}/quantity`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity_g: quantityG }),
    }
  );

  if (!response.ok) {
    throw new Error(await getFoodEntryError(response));
  }

  return await response.json();
}

export async function moveFoodEntry(id, date) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch(`/api/food_entries/${id}/date`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ date_logged: date }),
  });

  if (!response.ok) {
    throw new Error(await getFoodEntryError(response));
  }

  return await response.json();
}

export async function deleteFoodEntry(id) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch(`/api/food_entries/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getFoodEntryError(response));
  }
}


async function getAccountError(response) {
  const data = await response.json().catch(() => null);

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg).join(". ");
  }

  return "Account request failed. Please try again.";
}

export async function updateAccountEmail(email) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch("/api/users/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(await getAccountError(response));
  }

  return await response.json();
}

export async function changeAccountPassword(
  currentPassword,
  newPassword
) {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch("/api/users/me/change-password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  if (!response.ok) {
    throw new Error(await getAccountError(response));
  }
}

export async function deleteAccount() {
  const token = localStorage.getItem("calorie_tracker_token");

  const response = await fetch("/api/users/me", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getAccountError(response));
  }
}
