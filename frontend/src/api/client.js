
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
