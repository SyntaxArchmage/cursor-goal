"""
Workload definitions for subagent-based /goal testing.

Each workload defines:
  - id: unique identifier
  - prompt: the full prompt sent to the subagent
  - features: list of feature IDs expected to be triggered
  - setup: optional shell commands to run before the subagent
  - teardown: optional shell commands to run after
"""

import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SKILL_DIR = os.path.join(REPO_ROOT, ".cursor", "skills", "goal")
SCRIPTS_DIR = os.path.join(REPO_ROOT, "testing", "scripts")

GOAL_SKILL_PREAMBLE = f"""You have access to the /goal skill at {SKILL_DIR}.
The scripts are: goal-parse.sh, goal-manage.sh, goal-eval.sh.

IMPORTANT: You are testing the /goal skill. Follow its protocol exactly:
1. Parse the goal with goal-parse.sh
2. Create the goal with goal-manage.sh create
3. Do the work
4. Generate evaluator prompt with goal-eval.sh prompt
5. Spawn a readonly evaluator subagent (subagent_type must NOT be "generalPurpose")
6. Parse the evaluator result with goal-eval.sh parse-result
7. If YES: signal with goal-eval.sh signal, then goal-manage.sh done
8. If NO: continue working, then re-evaluate

Return a summary of what you did and all shell commands you executed."""

WORKLOADS = [
    {
        "id": "W1-goal-with-test",
        "name": "Goal with validation test command",
        "features": ["F11", "F12", "F13a", "F13b", "F19", "F20", "F21", "F22", "F23", "F24"],
        "prompt": f"""{GOAL_SKILL_PREAMBLE}

The user says:
/goal "fibonacci tests pass" --test "python -m pytest {SCRIPTS_DIR}/test_fibonacci.py -q" --budget 10

The test file {SCRIPTS_DIR}/test_fibonacci.py has failing tests. Fix the implementation in {SCRIPTS_DIR}/fibonacci.py until all tests pass.

Work in this directory: {SCRIPTS_DIR}""",
        "setup": f"""cp {SCRIPTS_DIR}/fibonacci.py {SCRIPTS_DIR}/fibonacci.py.bak 2>/dev/null || true""",
        "teardown": f"""cp {SCRIPTS_DIR}/fibonacci.py.bak {SCRIPTS_DIR}/fibonacci.py 2>/dev/null; rm -f {SCRIPTS_DIR}/fibonacci.py.bak; bash {SKILL_DIR}/goal-manage.sh clear 2>/dev/null || true""",
    },
    {
        "id": "W2-natural-language-goal",
        "name": "Natural language goal condition",
        "features": ["F11", "F12", "F13b", "F15", "F19", "F20", "F22", "F23"],
        "prompt": f"""{GOAL_SKILL_PREAMBLE}

The user says:
/goal the todo_app.py search function is case-insensitive

The file {SCRIPTS_DIR}/todo_app.py has a search method that is currently case-sensitive.
Fix it to be case-insensitive (convert both query and title to lowercase before comparing).

Work in this directory: {SCRIPTS_DIR}""",
        "setup": f"""cp {SCRIPTS_DIR}/todo_app.py {SCRIPTS_DIR}/todo_app.py.bak 2>/dev/null || true""",
        "teardown": f"""cp {SCRIPTS_DIR}/todo_app.py.bak {SCRIPTS_DIR}/todo_app.py 2>/dev/null; rm -f {SCRIPTS_DIR}/todo_app.py.bak; bash {SKILL_DIR}/goal-manage.sh clear 2>/dev/null || true""",
    },
    {
        "id": "W3-budget-parsing",
        "name": "Budget inline parsing",
        "features": ["F11", "F17", "F23"],
        "prompt": f"""{GOAL_SKILL_PREAMBLE}

The user says:
/goal fix the calculator divide function, stop after 5 turns

The file {SCRIPTS_DIR}/calculator.py divide function works fine already.
Just parse the goal, create it, check that the budget was set to 5, then clear the goal.
Report the goal.json contents after creation.

Work in this directory: {SCRIPTS_DIR}""",
        "teardown": f"""bash {SKILL_DIR}/goal-manage.sh clear 2>/dev/null || true""",
    },
    {
        "id": "W4-goal-clear",
        "name": "Goal creation then clear",
        "features": ["F11", "F18", "F23"],
        "prompt": f"""{GOAL_SKILL_PREAMBLE}

The user says:
/goal implement a REST API with 20 endpoints

Create the goal, verify goal.json exists with the condition, then immediately:
/goal clear

Verify goal.json is removed. Report both states.

Work in this directory: {SCRIPTS_DIR}""",
        "teardown": f"""bash {SKILL_DIR}/goal-manage.sh clear 2>/dev/null || true""",
    },
    {
        "id": "W5-no-test-goal",
        "name": "Goal without validation command",
        "features": ["F11", "F12", "F13b", "F19", "F20", "F21", "F22", "F23"],
        "prompt": f"""{GOAL_SKILL_PREAMBLE}

The user says:
/goal the calculator.py power function handles negative exponents correctly by returning a float

Read {SCRIPTS_DIR}/calculator.py. The power function already works correctly for negative exponents (a ** b handles this in Python). Evaluate the goal — it should pass immediately.

Work in this directory: {SCRIPTS_DIR}""",
        "teardown": f"""bash {SKILL_DIR}/goal-manage.sh clear 2>/dev/null || true""",
    },
    {
        "id": "W6-evaluator-correctness",
        "name": "Evaluator structural correctness",
        "features": ["F19", "F20", "F21", "F24"],
        "prompt": f"""{GOAL_SKILL_PREAMBLE}

The user says:
/goal all calculator tests pass --test "python -m pytest {SCRIPTS_DIR}/test_calculator.py -q"

The calculator tests should already pass. Create the goal, run the test, then evaluate.
When spawning the evaluator subagent, you MUST:
- Set readonly: true
- Include the goal condition in the evaluator prompt
- Use the goal-eval.sh prompt command to generate the evaluator prompt

After evaluation, if YES: signal and mark done. Report the full sequence of actions.

Work in this directory: {SCRIPTS_DIR}""",
        "teardown": f"""bash {SKILL_DIR}/goal-manage.sh clear 2>/dev/null || true""",
    },
]
