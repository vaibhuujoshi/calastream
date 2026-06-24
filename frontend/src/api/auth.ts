// const BASE_URL = import.meta.env.BACKEND_URL;
const BASE_URL = "http://localhost:3000/api/v1";

export async function SigninUser(username: string, password: string) {
  const response = await fetch(`${BASE_URL}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include"
  });

  const data = await response.json();
  return data;
}

export async function SignupUser(username: string, password: string, gender: string, channelName: string) {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, gender, channelName }),
    credentials: "include"
  });

  const data = await response.json();
  return data;
}

export async function getUserProfile() {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    throw error;
  }
}

export async function logoutUser() {
  const response = await fetch(`${BASE_URL}/logout`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });

  const data = await response.json();

  return data;
}