# /goal — Autonomous Goal Loop

Set a persistent objective. Work toward it across turns until it's met.

## How It Works

```
/goal all tests in test/auth pass and the lint step is clean
  ↓
goal-parse.sh → extracts condition, test cmd, budget
  ↓
goal-manage.sh create → goal.json written
  ↓
Agent works → runs tests → spawns evaluator subagent
  ↓
goal-eval.sh parse-result → NO → agent continues (same turn)
goal-eval.sh parse-result → YES → goal-eval.sh signal → goal-manage.sh done
  ↓
Turn ends → stop hook checks goal.json
  ↓
Still active → followup_message (auto-continue)
Achieved → {} (allow stop)
```

## Setting a Goal

When the user says `/goal`, use `goal-parse.sh` to extract structured args:

```bash
# Parse natural language into structured args
eval "$(bash ~/.cursor/skills/goal/goal-parse.sh "<raw user input after /goal>")"
# Outputs: CONDITION, TEST_CMD, BUDGET, GOAL_CMD (or SUBCOMMAND for status/pause/etc.)

# For subcommands (status, pause, resume, clear, stop):
eval "$GOAL_CMD"

# For new goals:
eval "$GOAL_CMD"    # runs goal-manage.sh create with extracted args
```

After creating the goal, **immediately start working toward the condition**.
Do not checkpoint. Do not ask what to do. Begin.

## Command Reference

| Command | Action |
|---------|--------|
| `/goal <condition>` | Set goal and start working |
| `/goal status` | Show current goal state |
| `/goal pause` | Pause auto-continuation |
| `/goal resume` | Resume a paused goal |
| `/goal clear` | Remove goal entirely |

Aliases for clear: `stop`, `off`, `reset`, `cancel`

## Working Toward the Goal

While the goal is active (`status: "pursuing"`), repeat this cycle:

1. **Do focused work** — make code changes, run commands, fix issues
2. **Run validation** (if `--test` provided) — execute the test command via Shell
3. **Evaluate** — spawn a readonly evaluator subagent (details below)
4. **Act on result** — YES → signal + done. NO → continue.

### Evaluation via Subagent

After each significant work phase, generate the evaluator prompt and spawn a subagent:

```bash
# Step 1: Generate the evaluator prompt
EVAL_PROMPT=$(bash ~/.cursor/skills/goal/goal-eval.sh prompt --work-summary "what you just did")
```

Then spawn a **readonly** evaluator subagent with the generated prompt. Use whatever
subagent tool your platform provides — e.g. `Task`, `Agent`, `runSubagent`:

```
Spawn subagent(readonly: true, prompt: $EVAL_PROMPT)
```

The evaluator returns "YES: ..." or "NO: ...".

### Acting on Evaluation Result

Parse the result programmatically:

```bash
# Step 2: Parse the evaluator's response
bash ~/.cursor/skills/goal/goal-eval.sh parse-result "<subagent response>"
# Outputs: VERDICT=YES/NO, REASON=...
# Exit code: 0 for YES, 1 for NO/UNCLEAR
```

**If YES** (exit 0):
```bash
# Step 3: Signal and mark done
bash ~/.cursor/skills/goal/goal-eval.sh signal
bash ~/.cursor/skills/goal/goal-manage.sh done     # Rejects if no signal — enforced by harness
```
Then report the achievement to the user.

**If NO** (exit 1):
1. Read the REASON — it tells you what remains
2. Continue working toward the goal in the same turn
3. After more work, evaluate again (back to step 1)

### When to Evaluate

Evaluate after:
- Running the validation command and seeing a new result
- Completing a logical unit of work (e.g., fixing a failing test)
- Making changes that could plausibly satisfy the condition

Do NOT evaluate after:
- Every single file edit
- Reading files or gathering context
- Planning or thinking (no observable change)

## Stop Hook Safety Net

The stop hook (`goal-stop.sh`) fires when your turn ends. If the goal is
still active, it returns a `followup_message` that auto-continues you.

**You should NOT rely on the stop hook as the primary evaluator.** It is
a safety net for cases where you forget to evaluate or end the turn
prematurely. The subagent evaluation within your turn is the primary
mechanism.

The stop hook also:
- Increments the turn counter
- Checks the turn budget
- Runs the validation command (if configured) for quick feedback
- Forces a budget-limit wrap-up when turns are exhausted

## Turn Budget

Default budget is 20 turns. When the budget is hit:
1. The stop hook sets `status: "budget-limited"` and `active: false`
2. You receive a final `followup_message` asking you to wrap up
3. Summarize progress, list what remains, and stop

Users can customize: `/goal "condition" --budget 50`
or naturally: `/goal fix the bug, stop after 10 turns`

## Writing Good Conditions

Conditions work best when they describe a verifiable end state:

```
✓ all tests in test/auth pass and the lint step is clean
✓ every call site of the old API has been migrated and the build succeeds
✓ no ESLint errors in src/, stop after 15 turns
✗ the code is clean          (vague, no observable proof)
✗ implement the feature       (no completion criteria)
```

## State File

Located at `~/.durable-request/data/goal.json`:

```json
{
  "active": true,
  "condition": "all tests pass",
  "validation_command": "npm test",
  "created_at": "2026-05-22T19:00:00Z",
  "turn_budget": 20,
  "turns_used": 3,
  "status": "pursuing",
  "last_reason": "2 tests still failing in auth module",
  "last_validation_output": "Tests: 2 failed, 48 passed, 50 total"
}
```

Status values: `pursuing`, `paused`, `achieved`, `budget-limited`

## Followup Message Format

When the stop hook auto-continues you, you'll receive:

```
[GOAL] Turn 3/20 (17 remaining). Continue working toward: all tests pass
```

When you see `[GOAL]` prefix, you're in an auto-continued turn.
Resume working toward the condition immediately.
