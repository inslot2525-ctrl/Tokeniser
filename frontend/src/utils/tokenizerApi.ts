import { tokenizePrompt } from "../services/api";

export async function getTokenCount(prompt: string): Promise<number> {
  const result = await tokenizePrompt(prompt);
  return result.tokens;
}
