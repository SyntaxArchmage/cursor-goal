"""
patterns.py — Feature definitions and regex detectors for cursor-goal testing.

Features F11-F13 detect /goal skill behaviors in agent session transcripts.
"""

import re
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Feature:
    id: str
    name: str
    pattern: re.Pattern
    min_samples: int = 10
    count_mode: str = "presence"  # "presence" or "count"


FEATURES = {
    "F11": Feature(
        id="F11",
        name="Goal state initialization",
        pattern=re.compile(
            r'goal-manage\.sh\s+create'
            r'|\[goal\]\s+Goal created'
            r'|"status":\s*"pursuing"',
            re.IGNORECASE,
        ),
        min_samples=10,
    ),
    "F12": Feature(
        id="F12",
        name="In-turn subagent goal evaluation",
        pattern=re.compile(
            r'Evaluate goal completion'
            r'|Evaluate whether.*goal.*achieved'
            r'|YES:\s*.+'
            r'|NO:\s*.+remain',
            re.IGNORECASE,
        ),
        min_samples=10,
        count_mode="count",
    ),
    "F13": Feature(
        id="F13",
        name="Stop hook auto-continuation",
        pattern=re.compile(
            r'\[GOAL\]\s*Turn\s+\d+/\d+'
            r'|\[GOAL BUDGET\]'
            r'|followup_message.*\[GOAL\]',
            re.IGNORECASE,
        ),
        min_samples=10,
    ),
    "F13a": Feature(
        id="F13a",
        name="Validation command execution",
        pattern=re.compile(
            r'--test\s+"[^"]+"'
            r'|Validation.*PASSED.*exit 0'
            r'|Validation.*FAILED.*exit',
            re.IGNORECASE,
        ),
        min_samples=5,
    ),
    "F13b": Feature(
        id="F13b",
        name="Goal completion marking",
        pattern=re.compile(
            r'goal-manage\.sh\s+done'
            r'|\[goal\].*Goal achieved'
            r'|"status":\s*"achieved"',
            re.IGNORECASE,
        ),
        min_samples=5,
    ),
    "F-NOT": Feature(
        id="F-NOT",
        name="No checkpoint during active goal (inverse check)",
        pattern=re.compile(
            r'AskQuestion.*\[GOAL\]|\[GOAL\].*AskQuestion',
            re.DOTALL | re.IGNORECASE,
        ),
        min_samples=5,
        count_mode="presence",
    ),
}

WORKLOAD_FEATURES = {
    "12-goal-with-test": ["F11", "F12", "F13", "F13a", "F13b"],
    "13-goal-budget": ["F11", "F13"],
    "14-goal-no-test": ["F11", "F12", "F13b"],
    "15-goal-pause-resume": ["F11"],
}


def check_feature(transcript: str, feature_id: str) -> dict:
    """Check if a feature is detected in a transcript."""
    feature = FEATURES.get(feature_id)
    if not feature:
        return {"found": False, "count": 0, "feature": None}

    matches = feature.pattern.findall(transcript)
    count = len(matches)

    # F-NOT is an inverse check: presence means FAILURE
    if feature_id == "F-NOT":
        return {
            "found": count == 0,  # pass if NOT found
            "count": count,
            "feature": feature,
        }

    return {
        "found": count > 0,
        "count": count,
        "feature": feature,
    }


def analyze_transcript(transcript: str, workload_id: str) -> dict:
    """Analyze a transcript for all features expected by a workload."""
    expected = WORKLOAD_FEATURES.get(workload_id, [])
    results = {}
    for fid in expected:
        results[fid] = check_feature(transcript, fid)
    passed = sum(1 for r in results.values() if r["found"])
    return {
        "workload": workload_id,
        "features_expected": len(expected),
        "features_passed": passed,
        "pass_rate": passed / len(expected) if expected else 0,
        "details": results,
    }


if __name__ == "__main__":
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python patterns.py <transcript_file> [workload_id]")
        sys.exit(1)

    with open(sys.argv[1], "r") as f:
        transcript = f.read()

    workload_id = sys.argv[2] if len(sys.argv) > 2 else "12-goal-with-test"
    result = analyze_transcript(transcript, workload_id)
    print(json.dumps(result, indent=2, default=str))
