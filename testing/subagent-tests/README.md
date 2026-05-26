# Subagent-Based Testing for /goal

Automated testing of 14 cursor-goal features via Task subagents.

## What's Tested

Features that can be triggered in a single-turn subagent execution:

| Feature | Name | Mechanism |
|---------|------|-----------|
| F11 | Goal state initialization | `goal-manage.sh create` |
| F12 | Subagent goal evaluation | `Task` call with evaluator prompt |
| F13a | Validation command execution | Shell pytest/eslint |
| F13b | Goal completion marking | `goal-manage.sh done` |
| F15 | Natural language condition parsing | `goal-parse.sh` |
| F17 | Budget inline parsing | `goal-parse.sh` |
| F18 | Goal clear/cancel | `goal-manage.sh clear` |
| F19 | Evaluator uses correct subagent_type | `Task` call inspection |
| F20 | Evaluator runs as readonly | `Task` call inspection |
| F21 | Evaluator prompt contains condition | `Task` prompt inspection |
| F22 | No self-assessment (done after eval) | Action ordering |
| F23 | Goal creation non-empty condition | Create command inspection |
| F24 | Done follows evaluator directly | Action ordering |

## What's NOT Tested

Features requiring Cursor IDE infrastructure (stop hooks, multi-turn interaction):

- F13: Stop hook auto-continuation
- F14: Pause/resume lifecycle (requires mid-execution user input)
- F16: Multi-cycle evaluation (depends on F13 for turn chaining)

## Running

```bash
cd testing/subagent-tests
python3 run-subagent-tests.py
```

Results are saved to `results/<timestamp>/`.
