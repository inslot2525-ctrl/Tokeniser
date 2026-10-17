// Point this at your deployed backend to use the extension without running it locally.
const API_BASE = "http://127.0.0.1:8000";

const $ = (id) => document.getElementById(id);
const prompt = $("prompt");
const output = $("output");

async function call(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: prompt.value }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || `Request failed (${response.status})`);
  return data;
}

function showMetrics({ original_tokens, optimized_tokens, savings_percent = 0 }) {
  $("originalTokens").textContent = original_tokens;
  $("optimizedTokens").textContent = optimized_tokens;
  const saved = $("savedTokens");
  saved.textContent = `${savings_percent}%`;
  saved.style.color = savings_percent > 25 ? "#10b981" : savings_percent > 10 ? "#f59e0b" : "#ef4444";
}

// Compress: local and free, works without any model or key.
$("compressBtn").addEventListener("click", async () => {
  try {
    const data = await call("/compress");
    output.value = data.optimized;
    showMetrics(data);
  } catch (error) {
    alert(error.message);
  }
});

// Improve: grammar fixes, which need a model (Ollama running next to the backend).
$("enhanceBtn").addEventListener("click", async () => {
  try {
    output.value = (await call("/enhance")).enhanced;
  } catch (error) {
    alert(error.message);
  }
});

$("copyBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.value);
  $("copyBtn").textContent = "Copied!";
  setTimeout(() => ($("copyBtn").textContent = "Copy"), 1500);
});
