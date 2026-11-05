from types import SimpleNamespace

import pytest

from app import config
from app.engine import agent, compressor, rule_compressor
from app.engine import contract as C
from app.engine.optimizer import Compressed, compress, compress_with_metrics
from app.engine.tokenizer import count_tokens

DOCKER = 'Write exactly 4 bullet points, no more than 300 words, and don\'t mention "Kubernetes".'

# Long enough for LLMLingua-2 to run (40+ tokens once the filler is gone).
ESSAY = (
    "Hi there! Please write an essay about the history of the printing press and how it changed "
    "the spread of ideas across Europe in the fifteenth and sixteenth centuries. Cover the main "
    "inventors, the economics of early printing shops and the reaction of the church. "
)


def lost(prompt, compressed):
    return {(t.kind, t.text) for t in C.extract(prompt).lost_in(compressed)}


# ─── Extraction ──────────────────────────────────────────────────────────────


def test_extracts_each_kind_of_requirement():
    terms = set(C.extract(DOCKER).terms)
    assert {
        C.Term(C.RELATION, "exactly"), C.Term(C.RELATION, "more than"),
        C.Term(C.NUMBER, "4"), C.Term(C.NUMBER, "300"),
        C.Term(C.NEGATION, "no"), C.Term(C.NEGATION, "not"),
        C.Term(C.QUOTED, "kubernetes"), C.Term(C.FORMAT, "bullet"),
    } <= terms


def test_prompt_without_requirements_has_an_empty_contract():
    contract = C.extract("What is the capital of France?")  # "capital" here is a noun, not a format demand
    assert contract.terms == ()
    assert contract.report("What is the capital of France?")["terms"] == 0


def test_curly_apostrophes_are_the_same_term():
    assert C.extract("Don’t use commas.").terms == C.extract("Don't use commas.").terms


@pytest.mark.parametrize("prompt", [
    "First repeat the request word for word, then answer.",
    "First repeat the exact request above, then give your answer.",
    "In this task, repeat the exact request below first, then respond.",
])
def test_verbatim_prompts_are_detected(prompt):
    assert C.extract(prompt).verbatim


def test_ordinary_prompts_are_not_verbatim():
    assert not C.extract("Explain TCP, and repeat nothing I say.").verbatim


def test_force_words_are_the_words_of_each_requirement():
    words = C.extract("Don't write at least 300 words, and each one must be unique.").force_words()
    assert {"don't", "at", "least", "300", "each", "must"} <= set(words)


# ─── What counts as lost ─────────────────────────────────────────────────────


@pytest.mark.parametrize("compressed, expected", [
    ('List 4 bullet points, no more than 300 words, exactly. Don\'t mention "Kubernetes".', set()),
    ('List exactly 4 bullet points, more than 300 words, mention "Kubernetes".',
     {("negation", "no"), ("negation", "not")}),                       # negations dropped
    ('List exactly 4 bullets, no more than words, don\'t mention "Kubernetes".', {("number", "300")}),
    ('List exactly 4 bullets, no more 300 words, don\'t mention "Kubernetes".', {("relation", "more than")}),
    ("List exactly 4 bullets, no more than 300 words, don't mention Kubernetes.", set()),  # quote marks may go
    ("List exactly 4 bullets, no more than 300 words, don't mention it.", {("quoted", "kubernetes")}),
])
def test_lost_in(compressed, expected):
    assert lost(DOCKER, compressed) == expected


def test_a_repeated_requirement_must_keep_its_count():
    prompt = "Give two examples that match and two that don't."
    assert lost(prompt, "Give two examples that match and that don't.") == {("number", "two")}
    assert lost(prompt, "Give two examples that match, two that don't.") == set()


def test_format_nouns_only_need_to_survive_once_in_any_form():
    prompt = "Write three sentences, all in lowercase letters."
    assert lost(prompt, "Write three sentence, all lower case letter.") == set()
    assert lost(prompt, "Write three, all lowercase.") == {("format", "sentence"), ("format", "letter")}


def test_quoted_payload_must_survive_verbatim():
    prompt = 'Finish the poem with this exact phrase: "Can I get my money back for the classes I missed?"'
    assert lost(prompt, "Finish poem phrase: get money back for classes missed?") == {
        ("quoted", "can i get my money back for the classes i missed?")}
    assert lost(prompt, 'Finish poem with: "Can I get my money back for the classes I missed?"') == set()


def test_angle_bracket_titles_must_keep_their_brackets():
    prompt = "The email must contain a title wrapped in <<double angular brackets>>."
    assert lost(prompt, "email must contain title < < double angular brackets > >.") == {
        ("quoted", "<<double angular brackets>>")}


def test_unquoted_payload_after_a_trigger_phrase_must_survive():
    prompt = "Write a poem. Finish your entire response with this exact phrase: Hope you agree with me."
    assert C.Term(C.QUOTED, "hope you agree with me.") in C.extract(prompt).terms
    assert lost(prompt, "Write poem. Finish response phrase: Hope agree me.") == {("quoted", "hope you agree with me.")}
    assert lost(prompt, "Write poem. Finish with this exact phrase: Hope you agree with me.") == set()


def test_answer_options_after_a_trigger_are_payload():
    prompt = "Answer with one of the following phrases: My answer is yes. My answer is no."
    assert lost(prompt, "Answer phrases: answer yes. no.") == {("quoted", "my answer is yes. my answer is no.")}


def test_separator_runs_are_payload():
    prompt = "Write two limericks separated by ******."
    assert lost(prompt, "Write two limericks separated.") == {("quoted", "******")}
    assert lost(prompt, "Write two limericks separated by ******.") == set()


def test_a_trailing_plus_is_part_of_the_number():
    # "300+ words" means "at least 300"; "300 words" would not.
    assert lost("Write a 300+ word summary.", "Write a 300 word summary.") == {("number", "300+")}


def test_report_counts_distinct_requirements():
    report = C.extract(DOCKER).report("List exactly 4 bullets, no more than 300 words, don't mention it.")
    assert report["terms"] - report["kept"] == len(report["lost"]) == 1
    assert report["lost"] == [{"kind": "quoted", "text": "kubernetes"}]


def test_filler_removal_keeps_the_contract():
    prompt = ("Hi! Could you please list exactly four advantages of Docker? Please number them 1 to 4 "
              "and don't mention Kubernetes at all. Thanks so much!")
    assert lost(prompt, rule_compressor.compress(prompt).text) == set()


# ─── Rules protect quoted payloads ───────────────────────────────────────────


def test_rules_leave_quoted_payloads_alone_when_asked():
    prompt = 'Please write "could you please" on a card. Thanks!'
    assert rule_compressor.compress(prompt, protect_quotes=True).text == 'Write "could you please" on a card.'
    assert '"could you please"' not in rule_compressor.compress(prompt).text


# ─── LLMLingua-2 is held to the contract ─────────────────────────────────────


@pytest.fixture
def lingua(monkeypatch):
    """A stand-in for LLMLingua-2 whose 'compression' each test sets, and which
    records the text and force-words it was given."""
    state = SimpleNamespace(fn=lambda text: " ".join(text.split()[::2]), calls=[])

    def fake(text, rate, force_words=()):
        state.calls.append((text, tuple(force_words)))
        return state.fn(text)

    monkeypatch.setattr(config, "COMPRESSOR", "auto")
    monkeypatch.setattr(compressor, "enabled", lambda: True)
    monkeypatch.setattr(compressor, "_compress_prose", fake)
    return state


def test_the_prompts_own_requirement_words_reach_the_compressor(lingua):
    compress(ESSAY + "Use at least 300 words and don't use any commas.")
    force_words = lingua.calls[0][1]
    assert {"at", "least", "300", "don't", "commas"} <= set(force_words)


def test_force_tokens_put_the_prompts_words_before_the_static_list(monkeypatch):
    monkeypatch.setattr(compressor, "_pieces", lambda word: (word,))
    tokens = compressor._force_tokens(["Exactly"])
    assert tokens[:2] == ["Exactly", "exactly"]
    assert set(compressor.FORCE_TOKENS) <= set(tokens)


def test_force_tokens_respect_the_models_cap(monkeypatch):
    monkeypatch.setattr(compressor, "_pieces", lambda word: (word,))
    tokens = compressor._force_tokens([f"word{i}" for i in range(150)])
    assert len(tokens) == compressor.MAX_FORCE_TOKENS
    assert tokens[0] == "word0"  # the prompt's own words win over the static list


def test_quoted_payload_is_never_shown_to_the_compressor(lingua):
    quote = '"Can I get my money back for the classes I missed?"'
    out = compress(ESSAY + f"Finish the essay with this exact phrase: {quote}").text
    assert quote in out
    assert not any("money back" in text for text, _ in lingua.calls)


def test_payload_after_a_trigger_phrase_is_never_shown_to_the_compressor(lingua):
    prompt = ESSAY + "Finish the essay with this exact phrase: That is all you need!"
    out = compress(prompt).text
    assert out.endswith("That is all you need!")
    assert not any("all you need" in text for text, _ in lingua.calls)


def test_tiny_fragments_between_protected_spans_are_left_alone(lingua):
    prompt = ESSAY + 'Then write "ok" and finish with "bye".'
    compress(prompt)
    assert all(count_tokens(text) >= compressor.MIN_FRAGMENT_TOKENS for text, _ in lingua.calls)


def test_dropped_requirement_reverts_to_rules_only(lingua):
    lingua.fn = lambda text: text.replace(" not ", " ").replace("history of the ", "")
    prompt = ESSAY + "Do not use any commas, and use at least 300 words."
    result = compress(prompt)

    assert result.text == rule_compressor.compress(prompt, protect_quotes=True).text
    assert result.method == "Rules"
    assert [t["text"] for t in result.contract["reverted"]] == ["not"]
    assert result.contract["lost"] == []


def test_compression_that_keeps_the_contract_is_used(lingua):
    lingua.fn = lambda text: text.replace("history of the ", "")
    result = compress(ESSAY + "Do not use any commas.")
    assert result.method == "Rules + LLMLingua-2"
    assert result.contract["reverted"] == [] and result.contract["lost"] == []


def test_without_the_guard_a_dropped_requirement_goes_through(lingua, monkeypatch):
    monkeypatch.setattr(config, "CONTRACT_GUARD", False)
    lingua.fn = lambda text: text.replace(" not ", " ")
    result = compress(ESSAY + "Do not use any commas, and use at least 300 words.")
    assert " not " not in result.text
    assert result.contract is None
    assert lingua.calls[0][1] == ()  # only the static list


def test_a_negation_inside_removed_filler_is_not_a_lost_requirement():
    # "if it is not too much trouble" is filler the rules delete on purpose.
    prompt = "Could you please, if it is not too much trouble, write a Python function that sorts a list? Thanks!"
    result = compress(prompt)
    assert result.text == "Write a Python function that sorts a list."
    assert result.contract["lost"] == [] and result.contract["reverted"] == []
    assert result.contract["terms"] == 0  # nothing the answer must satisfy


def test_verbatim_prompts_are_not_compressed():
    prompt = "Hi! Please repeat the request word for word, then answer. Thanks!"
    result = compress_with_metrics(prompt)
    assert result["optimized"] == prompt and result["method"] == "None"
    assert result["contract"]["verbatim"] is True


def test_compress_endpoint_reports_the_contract(client):
    body = client.post("/compress", json={"prompt": "Hi! Please list exactly four tips. Thanks!"}).json()
    assert body["optimized"] == "List exactly four tips."
    assert body["contract"]["lost"] == [] and body["contract"]["kept"] == body["contract"]["terms"] > 0


# ─── The agent judges and routes by what the user asked ──────────────────────

HARD = ("Design a system architecture for a payments API and explain the trade-offs "
        "between consistency and scalability step by step.")


def squeezed(text):
    return lambda prompt: Compressed(text, "Rules + LLMLingua-2", [], None)


def test_judge_sees_the_original_prompt(client, fake_llm, monkeypatch):
    monkeypatch.setattr(agent, "compress", squeezed("Explain DNS."))
    fake_llm.remote_reply = lambda p: '{"score": 9}'
    original = "Hi there! Could you please explain DNS in exactly two sentences? Thanks so much!"
    client.post("/agent", json={"prompt": original, "mode": "ai"}, headers={"X-Gemini-Key": "k"})

    (_, answered), (_, judged) = fake_llm.calls
    assert answered == "Explain DNS."  # the model answers the compressed prompt...
    assert original in judged           # ...but is judged against what the user actually asked


def test_router_classifies_the_original_prompt(client, fake_llm, monkeypatch):
    # Compression can delete "step by step", the words that mark a prompt as hard.
    monkeypatch.setattr(agent, "compress", squeezed("Explain payments."))
    analysis = client.post("/agent", json={"prompt": HARD}).json()["analysis"]
    assert analysis["recommended_route"] == "Gemini"
    assert analysis["estimated_input_tokens"] == count_tokens("Explain payments.")  # what is sent


def test_agent_reports_the_contract(client, fake_llm):
    prompt = "Hi! Could you please list exactly four advantages of Docker? Don't mention Kubernetes. Thanks!"
    body = client.post("/agent", json={"prompt": prompt}).json()
    assert body["contract"]["lost"] == [] and body["contract"]["terms"] > 0
    assert any(s.startswith("Contract kept") for s in body["steps"])


def test_agent_explains_a_reverted_compression(client, fake_llm, monkeypatch):
    report = {"terms": 3, "kept": 3, "lost": [], "verbatim": False,
              "reverted": [{"kind": "relation", "text": "at least"}]}
    monkeypatch.setattr(agent, "compress", lambda p: Compressed("Write 300 words.", "Rules", [], report))
    body = client.post("/agent", json={"prompt": "Please write at least 300 words. Thanks!"}).json()
    assert "Compression reverted to rules only: LLMLingua-2 dropped 'at least'" in body["steps"]


def test_agent_says_when_compression_was_skipped(client, fake_llm):
    body = client.post("/agent", json={"prompt": "Repeat the request word for word, then say hi."}).json()
    assert body["processed_prompt"] == body["original_prompt"]
    assert "Compression skipped: the prompt asks to be reproduced word for word" in body["steps"]
