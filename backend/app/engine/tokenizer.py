import tiktoken

encoding = tiktoken.encoding_for_model(
    "gpt-4o"
)


def count_tokens(text: str) -> int:
    tokens = encoding.encode(text)

    return len(tokens)