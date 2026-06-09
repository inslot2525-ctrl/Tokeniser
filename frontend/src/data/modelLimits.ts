export const models = {
  "gpt-4o": {
    contextWindow: 128000,
    outputLimit: 16384,
  },

  "gpt-4-turbo": {
    contextWindow: 128000,
    outputLimit: 4096,
  },

  "gpt-3.5-turbo": {
    contextWindow: 16385,
    outputLimit: 4096,
  },

  "claude-3.5-sonnet": {
    contextWindow: 200000,
    outputLimit: 8192,
  },

  "claude-3-opus": {
    contextWindow: 200000,
    outputLimit: 4096,
  },

  "gemini-1.5-pro": {
    contextWindow: 2000000,
    outputLimit: 8192,
  },

  "gemini-1.5-flash": {
    contextWindow: 1000000,
    outputLimit: 8192,
  },
}

export type ModelName =
  keyof typeof models