from app import config
from eval import constraints, survival

ROW = {
    "prompt": 'Write exactly 4 bullets. Do not use commas. Include the word "kubernetes" two times.',
    "instruction_id_list": ["detectable_format:number_bullet_lists", "punctuation:no_comma", "keywords:frequency"],
    "kwargs": [{"num_bullets": 4}, {}, {"keyword": "kubernetes", "frequency": 2, "relation": "at least"}],
}


def survived(compressed, row=ROW):
    return dict(survival.check(row["prompt"], compressed, row))


# ─── What counts as a checkable parameter ────────────────────────────────────


def test_parameters_keep_numbers_and_short_text_and_skip_the_rest():
    kwargs = {"N": 5.0, "ratio": 0.5, "word": "impact", "letter": "e", "relation": "at least", "x": None,
              "flag": True, "reference_text": "a long passage" * 20, "keywords": ["alpha", "b", "gamma"]}
    assert survival.parameters(kwargs) == [("num", 5), ("text", "impact"), ("text", "alpha"), ("text", "gamma")]


def test_numbers_match_as_digits_or_words():
    assert survival.has_number("write four bullets", 4)
    assert survival.has_number("write 1,000 words", 1000)
    assert survival.has_number("write 300+ words", 300)
    assert not survival.has_number("write 3000 words", 300)  # not a substring match
    assert not survival.has_number("write bullets", 4)


# ─── Survival ────────────────────────────────────────────────────────────────


def test_intact_prompt_survives():
    assert survived(ROW["prompt"]) == {
        "detectable_format:number_bullet_lists": True, "punctuation:no_comma": True, "keywords:frequency": True}


def test_each_dropped_requirement_is_attributed_to_its_instruction():
    out = survived('Write bullets. Do not use. Include the word "kubernetes" two times.')
    assert out == {"detectable_format:number_bullet_lists": False,   # the 4 is gone
                   "punctuation:no_comma": False,                    # "comma" is gone
                   "keywords:frequency": True}


def test_a_parameter_the_original_never_states_is_not_checkable():
    row = {"prompt": "Write a poem.", "instruction_id_list": ["x:y"], "kwargs": [{"N": 7}]}
    assert survival.check(row["prompt"], "Poem.", row) == []
    twice = {"prompt": 'Use "kubernetes" twice.', "instruction_id_list": ["keywords:frequency"],
             "kwargs": [{"keyword": "kubernetes", "frequency": 2}]}
    assert survival.check(twice["prompt"], twice["prompt"], twice) == []  # "twice" is neither "2" nor "two"


def test_ifeval_cues_matter_even_without_parameters():
    row = {"prompt": "Reply in all lowercase letters.", "instruction_id_list": ["change_case:english_lowercase"],
           "kwargs": [{}]}
    assert survival.check(row["prompt"], "Reply in all lower case.", row) == [("change_case:english_lowercase", True)]
    assert survival.check(row["prompt"], "Reply in all small letters.", row) == [("change_case:english_lowercase", False)]


def test_lost_negation():
    assert survival.lost_negation("Do not use commas and don't be long.", "Use commas, don't be long.")
    assert not survival.lost_negation("Do not use commas.", "Not use commas.")


# ─── Harness plumbing ────────────────────────────────────────────────────────

FILLER_ROW = {
    "prompt": "Hi there! Could you please write exactly 4 bullets about DNS? Thanks so much!",
    "instruction_id_list": ["detectable_format:number_bullet_lists"],
    "kwargs": [{"num_bullets": 4}],
}


def test_settings_restores_config():
    before = config.CONTRACT_GUARD
    with constraints.settings(CONTRACT_GUARD=not before):
        assert config.CONTRACT_GUARD is (not before)
    assert config.CONTRACT_GUARD is before


def test_rules_method_saves_tokens_and_keeps_the_requirements():
    outputs, ms = constraints.run_method("rules", [FILLER_ROW["prompt"]], rate=0.6)
    scores = constraints.score([FILLER_ROW], outputs, ms)
    assert scores["saved_pct"] > 0
    assert scores["prompts_intact_pct"] == 100.0 and scores["negation_lost"] == 0


def test_score_counts_a_damaged_prompt():
    scores = constraints.score([FILLER_ROW], ["Write bullets about DNS."], [1.0])
    assert scores["prompts_intact_pct"] == 0.0 and scores["instructions_kept_pct"] == 0.0
    assert scores["failures"]["detectable_format:number_bullet_lists"] == 1


def test_render_reports_every_method():
    outputs, ms = constraints.run_method("rules", [FILLER_ROW["prompt"]], rate=0.6)
    scores = {"rules": constraints.score([FILLER_ROW], outputs, ms)}
    report = constraints.render({"ifeval": (1, "tuned on", scores)}, 0.6)
    assert "## ifeval: 1 prompts, 1 checkable instructions (tuned on)" in report and "| rules |" in report
