const BASE_URL = import.meta.env.BACKEND_URL;

export async function SigninUser(username: string, password: string) {
    const response = await fetch(`${BASE_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password}),
        credentials: "include"
    });

    const data = await response.json();
    return data;
}

export async function SignupUser(username: string, password: string, gender: string, channelName: string) {
    const response = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, gender, channelName}),
        credentials: "include"
    });

    const data = await response.json();
    return data;
}