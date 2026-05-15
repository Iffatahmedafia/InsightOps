async function generateAiJson({ messages, temperature = 0.2 }) {
  const provider = process.env.AI_PROVIDER || "openrouter";

  if (provider !== "openrouter") {
    throw new Error(`Unsupported AI_PROVIDER "${provider}". Configure AI_PROVIDER=openrouter.`);
  }

  return generateOpenRouterJson({ messages, temperature });
}

async function generateOpenRouterJson({ messages, temperature }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openrouter/free";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || "http://localhost:3000",
      "X-Title": "InsightOps",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenRouter request failed with status ${response.status}: ${message}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenRouter returned an empty AI response.");
  }

  return {
    model: data.model || model,
    json: parseJsonContent(content),
  };
}

function parseJsonContent(content) {
  const trimmed = content.trim();
  const withoutFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(withoutFence);
}

module.exports = { generateAiJson };
