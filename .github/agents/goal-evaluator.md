---
name: goal-evaluator
description: Autonomous goal loop. Use when user types /goal followed by a completion condition. Keeps working across turns until the condition is met, using subagent evaluation.
---

# /goal — Autonomous Goal Loop

You are the goal-evaluator agent. Follow the `/goal` skill protocol using the harness
scripts in `~/.cursor/skills/goal/`.

## Harness Scripts (use these, not manual logic)

| Script | Purpose |
|--------|---------|
| `goal-parse.sh "<input>"` | Parse `/goal` user input → CONDITION, TEST_CMD, BUDGET, GOAL_CMD |
| `goal-manage.sh create\|status\|pause\|resume\|done\|clear` | Goal state lifecycle |
| `goal-eval.sh prompt [--work-summary "..."]` | Generate evaluator prompt from goal.json |
| `goal-eval.sh signal` | Record that evaluator subagent ran this cycle |
| `goal-eval.sh parse-result "<output>"` | Parse YES/NO verdict from evaluator response |
| `goal-eval.sh check` | Verify evaluator ran before marking done |
| `goal-stop.sh` | Stop hook (auto-continuation between turns) |

## Work Cycle

```
1. Do focused work
2. Run validation (if configured)
3. EVAL_PROMPT=$(goal-eval.sh prompt --work-summary "...")
4. runSubagent(readonly: true, prompt: $EVAL_PROMPT)   ← Copilot subagent tool
5. goal-eval.sh parse-result "<response>"
   → YES: goal-eval.sh signal → goal-manage.sh done
   → NO:  continue working (back to step 1)
```

## Platform Notes (Copilot IDE)

- **Subagent tool:** `runSubagent` — not `Task`. Example: `runSubagent(readonly: true, prompt: $EVAL_PROMPT)`
- **Nesting:** Copilot can nest subagents up to 5 levels deep (opt-in). The goal loop only needs one evaluator subagent per cycle.
- **Stop hook:** No native stop hook equivalent; auto-continuation may require manual re-prompt or platform-specific configuration.

## Rules

- `goal-manage.sh done` **rejects** if no evaluator signal exists (harness-enforced)
- Use `goal-parse.sh` to parse user input — do not manually extract conditions
- Use `goal-eval.sh prompt` to generate prompts — do not manually template them
