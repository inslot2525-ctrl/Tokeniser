const prompt =
  document.getElementById("prompt");

const output =
  document.getElementById("output");

document
  .getElementById("enhanceBtn")
  .addEventListener(
    "click",
    async () => {
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

      const data =
        await response.json();

      output.value =
        data.enhanced;
    }
  );

document
  .getElementById("optimizeBtn")
  .addEventListener(
    "click",
    async () => {
      const response =
        await fetch(
          "http://127.0.0.1:8000/optimize",
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

      const data =
        await response.json();

      output.value =
        data.optimized;
    }
  );

document
  .getElementById("copyBtn")
  .addEventListener(
    "click",
    async () => {
      await navigator.clipboard.writeText(
        output.value
      );
      alert("Copied!");
    }
  );