export type AIProvider = "openai" | "anthropic" | "gemini" | "ollama";

export interface AIRequest {
  provider: AIProvider;
  apiKey?: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  context: unknown;
}

export interface AIResponse {
  text: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

export async function askAI(_input: AIRequest): Promise<AIResponse> {
  throw new Error(
    "askAI not implemented yet. Provider adapters land in Phase 1. " +
      "This package only ships the contract for now."
  );
}
