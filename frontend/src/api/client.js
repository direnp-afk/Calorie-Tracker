
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
