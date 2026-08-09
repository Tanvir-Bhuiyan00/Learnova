/* eslint-disable @typescript-eslint/no-explicit-any */

import { envVars } from "../../config/env";

const API_URL = "https://openrouter.ai/api/v1";

const SYSTEM_PROMPT = `You are the Learnova AI course assistant for an online learning platform.

You help students and visitors find courses, understand pricing, learn about instructors, lessons, and read reviews.

Answer ONLY based on the provided context. If the context does not contain the answer, say you don't have enough information.

Be concise, friendly, and structured. Format lists cleanly.`;

export const LLMService = {
  async generateResponse(
    prompt: string,
    context: string[] = [],
  ): Promise<string> {
    const apiKey = envVars.RAG.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set in the server .env file");
    }

    const model = envVars.RAG.OPENROUTER_LLM_MODEL;

    const fullPrompt =
      context.length > 0
        ? `Context information:\n${context.join("\n\n")}\n\nQuestion: ${prompt}\n\nAnswer based on the context above.`
        : prompt;

    const bodyPayload: any = {
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: fullPrompt },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    };

    const response = await fetch(`${API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Learnova",
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.status} - ${errorData?.error?.message || "unknown error"}`,
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  },
};
