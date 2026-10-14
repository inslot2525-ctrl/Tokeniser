import tiktoken

# o200k_base is the gpt-4o encoding. Gemini and Gemma use their own
# tokenizers, so counts here are a model-independent approximation used to
# compare prompts against each other.
encoding = tiktoken.get_encoding("o200k_base")


def count_tokens(text: str) -> int:
    return len(encoding.encode(text))
