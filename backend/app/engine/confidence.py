def estimate_answer_confidence(
    prompt: str,
    answer: str,
):

    confidence = 100

    if len(answer.split()) < 20:
        confidence -= 30

    uncertainty = [
        "i think",
        "maybe",
        "possibly",
        "i'm not sure",
        "cannot determine",
        "uncertain",
        "might be",
        "could be",
    ]

    lower = answer.lower()

    for phrase in uncertainty:
        if phrase in lower:
            confidence -= 15

    if len(answer.strip()) == 0:
        confidence = 0

    if len(answer.split()) > 600:
        confidence -= 10

    confidence = max(0, min(confidence, 100))

    return confidence