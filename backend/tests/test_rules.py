from app.engine.answer_checks import check_answer
from app.engine.rule_compressor import compress

# ─── Rule compressor ─────────────────────────────────────────────────────────


def test_removes_filler_and_reports_it():
    r = compress("Hi! Could you please explain DNS? Thanks so much!")
    assert r.text == "Explain DNS."
    assert [x["label"] for x in r.removed] == ["greeting", "asking", "thanks"]


def test_keeps_negations_numbers_and_constraints():
    text = (
        "Please list exactly four advantages. Number them 1 to 4, and please "
        "don't mention Kubernetes. Do not use more than 20 words."
    )
    out = compress(text).text
    for kept in ["exactly four", "1 to 4", "don't mention Kubernetes", "Do not use more than 20 words"]:
        assert kept in out


def test_leaves_plain_prompts_alone():
    for text in ["Explain the difference between TCP and UDP.",
                 "What is the time complexity of quicksort in the worst case, and why?"]:
        r = compress(text)
        assert r.text == text and r.removed == []


def test_never_touches_code():
    text = "Hi! Please fix this:\n```python\nprint('thanks so much')  # please\n```\nThanks!"
    out = compress(text).text
    assert "print('thanks so much')  # please" in out
    assert not out.startswith("Hi")


def test_only_questions_turned_into_instructions_lose_the_question_mark():
    assert compress("What is DNS? Can you also explain TCP?").text == "What is DNS? Also explain TCP."


# ─── Answer checks ───────────────────────────────────────────────────────────

DOCKER = ("List exactly four advantages of Docker. Number them 1 to 4 and "
          "don't mention Kubernetes.")
FOUR = "1. Portable.\n2. Isolated.\n3. Fast to start.\n4. Reproducible."


def test_correct_answer_passes():
    assert check_answer(DOCKER, FOUR) == {"passed": True, "issues": []}


def test_wrong_item_count():
    issues = check_answer(DOCKER, FOUR + "\n5. Scales.")["issues"]
    assert issues == ["Asked for 4 items, answer lists 5"]


def test_forbidden_word():
    issues = check_answer(DOCKER, FOUR.replace("Fast to start", "Runs on Kubernetes"))["issues"]
    assert issues == ["Answer mentions 'Kubernetes', which the prompt ruled out"]


def test_quoted_forbidden_word():
    prompt = "Write a haiku. It must not use the word 'fall' anywhere."
    assert not check_answer(prompt, "Leaves fall softly\non the cold ground\nwind")["passed"]
    assert check_answer(prompt, "Leaves drift softly\non the cold ground\nwind")["passed"]


def test_sentence_count_has_tolerance_of_one():
    prompt = "Summarize evolution in three sentences."
    assert check_answer(prompt, "One idea here. Two ideas here. Three ideas here. Four.")["passed"]
    assert not check_answer(prompt, " ".join(f"Sentence {i} is here." for i in range(8)))["passed"]


def test_missing_code_and_inline_code():
    prompt = "Write a Python function to reverse a list."
    assert not check_answer(prompt, "Walk the list and flip each pointer as you go.")["passed"]
    assert check_answer(prompt, "Use `items[::-1]` to get a reversed copy.")["passed"]


def test_refusal_empty_and_cut_off():
    assert not check_answer("Explain DNS.", "I'm sorry, but I can't help with that.")["passed"]
    assert not check_answer("Explain DNS.", "")["passed"]
    assert not check_answer("Write code.", "Here you go:\n```python\ndef f():")["passed"]


def test_no_false_alarms_on_common_phrasings():
    # "two examples that match and two that don't" -> 4 items is correct.
    zip_prompt = "Give a regex for ZIP codes and give me two examples that match and two that don't."
    zip_answer = "Use `^\\d{5}$`.\n- 12345\n- 54321\n- 1234\n- abcde"
    assert check_answer(zip_prompt, zip_answer)["passed"]
    # An answer may name what it avoided.
    assert check_answer("Sum a list without using recursion.",
                        "This loops instead of using recursion, adding each item.")["passed"]
