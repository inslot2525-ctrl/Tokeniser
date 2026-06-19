const API_BASE = "http://127.0.0.1:8000";

export async function optimizePrompt(prompt: string) {
  const response = await fetch(
    `${API_BASE}/optimize`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to optimize prompt"
    );
  }

  return response.json();
}

export async function enhancePrompt(prompt: string) {
  const response = await fetch(
    `${API_BASE}/enhance`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to enhance prompt"
    );
  }

  return response.json();
}