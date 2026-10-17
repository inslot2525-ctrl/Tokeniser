// Backend steps that report a problem or a limitation rather than a completed
// action, e.g. "Rule checks failed: …" or "No model available to answer".
const WARNING_STEP = /failed|flagged|not judged|no model|not compressed|blocked|escalated/i;

export const isWarningStep = (step: string) => WARNING_STEP.test(step);
