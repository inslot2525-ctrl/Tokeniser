chrome.runtime.onMessage.addListener(
  async (message) => {
    if (
      message.action !==
      "OPTIMIZE_PROMPT"
    ) {
      return;
    }

    const editable =
      document.querySelector(
        '[contenteditable="true"]'
      );

    if (!editable) {
      alert("Prompt box not found");
      return;
    }

    const prompt =
      editable.innerText.trim();

    console.log(
      "Prompt found:",
      prompt
    );

    if (!prompt) {
      alert("Prompt empty");
      return;
    }

    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/enhance-optimize",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              prompt,
            }),
          }
        );

      const data =
        await response.json();

      const optimized =
        data.optimization_result
          .optimized;

      editable.innerText =
        optimized;

      editable.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          inputType:
            "insertText",
          data: optimized,
        })
      );

      alert(
        "Prompt optimized!"
      );
    } catch (error) {
      console.error(
        "Extension error:",
        error
      );
      alert(
        "Optimization failed"
      );
    }
  }
);