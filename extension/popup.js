const originalTokens =
  document.getElementById(
    "originalTokens"
  );

const optimizedTokens =
  document.getElementById(
    "optimizedTokens"
  );

const savedTokens =
  document.getElementById(
    "savedTokens"
  );

const prompt =
  document.getElementById("prompt");

const output =
  document.getElementById("output");

const enhanceBtn =
  document.getElementById(
    "enhanceBtn"
  );

const compressBtn =
  document.getElementById(
    "compressBtn"
  );

const smartBtn =
  document.getElementById(
    "smartBtn"
  );

const copyBtn =
  document.getElementById(
    "copyBtn"
  );

function updateMetrics(data) {
  if (
    data.original_tokens !==
      undefined &&
    data.optimized_tokens !==
      undefined
  ) {
    originalTokens.textContent =
      data.original_tokens;

    optimizedTokens.textContent =
      data.optimized_tokens;

    const percent =
      data.savings_percent || 0;

    savedTokens.textContent =
      percent + "%";

    if (percent > 25) {
      savedTokens.style.color =
        "#10b981";
    } else if (percent > 10) {
      savedTokens.style.color =
        "#f59e0b";
    } else {
      savedTokens.style.color =
        "#ef4444";
    }
  }
}

enhanceBtn.addEventListener(
  "click",
  async () => {
    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/enhance",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              prompt: prompt.value,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Enhancement failed"
        );
      }

      const data =
        await response.json();

      output.value =
        data.enhanced;

      if (
        data.original_tokens
      ) {
        updateMetrics(data);
      }
    } catch (error) {
      console.error(error);
      alert(
        "Enhancement failed"
      );
    }
  }
);

compressBtn.addEventListener(
  "click",
  async () => {
    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/compress",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              prompt: prompt.value,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Compression failed"
        );
      }

      const data =
        await response.json();

      output.value =
        data.optimized ||
        data.compressed;

      updateMetrics(data);
    } catch (error) {
      console.error(error);
      alert(
        "Compression failed"
      );
    }
  }
);

smartBtn.addEventListener(
  "click",
  async () => {
    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/smart-optimize",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              prompt: prompt.value,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Smart optimization failed"
        );
      }

      const data =
        await response.json();

      output.value =
        data.optimized;

      updateMetrics(data);
    } catch (error) {
      console.error(error);
      alert(
        "Smart optimization failed"
      );
    }
  }
);

copyBtn.addEventListener(
  "click",
  async () => {
    try {
      await navigator.clipboard.writeText(
        output.value
      );

      alert("Copied!");
    } catch (error) {
      console.error(error);
      alert(
        "Copy failed"
      );
    }
  }
);