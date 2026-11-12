
import re


def analyze_statement(statement):
    text = statement.strip()

    if not text:
        return {
            "status": "unverified",
            "score": None,
            "result": "Please enter a statement for analysis.",
            "signals": []
        }

    signals = []
    words = re.findall(r"\b[\w']+\b", text.lower())

    repeated = sorted({
        word for word in words
        if words.count(word) > 2 and len(word) > 3
    })

    if len(words) < 5:
        signals.append(
            "Statement is very short. More context is needed."
        )

    if repeated:
        signals.append(
            "Repeated words found: " + ", ".join(repeated)
        )

    uncertainty_words = [
        "maybe", "perhaps", "possibly",
        "probably", "might", "not sure"
    ]

    found_uncertainty = [
        word for word in uncertainty_words
        if word in text.lower()
    ]

    if found_uncertainty:
        signals.append(
            "Uncertainty language found: "
            + ", ".join(found_uncertainty)
        )

    absolute_words = [
        "always", "never", "everyone",
        "nobody", "definitely", "100%"
    ]

    found_absolute = [
        word for word in absolute_words
        if word in text.lower()
    ]

    if found_absolute:
        signals.append(
            "Absolute language found: "
            + ", ".join(found_absolute)
        )

    if not signals:
        signals.append(
            "No specific language patterns detected. "
            "This does not establish factual accuracy."
        )

    return {
        "status": "unverified",
        "score": None,
        "result": (
            "Language analysis completed. "
            "These patterns are observations only, "
            "not proof of truth or deception."
        ),
        "signals": signals
    }
