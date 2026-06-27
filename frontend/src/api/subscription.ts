const BASE_URL = "http://localhost:3000/api/v1";

interface SubscriptionResponse {
    subscribed: boolean;
    message: string;
    error?: string; 
}

export async function toggleSubscription(creatorId: string): Promise<SubscriptionResponse> {
    const response = await fetch(`${BASE_URL}/subscribe/${creatorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include" 
    });

    const data = await response.json();

    // 2. Intercept non-200 HTTP statuses safely
    if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
    }

    return data;
}

export async function checkSubscriptionStatus(creatorId: string): Promise<{ isSubscribed: boolean }> {
  const response = await fetch(`${BASE_URL}/subscribe/status/${creatorId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });

  if (!response.ok) throw new Error("Failed to fetch subscription status");
  return response.json();
}