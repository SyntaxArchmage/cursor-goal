---
name: goal
description: Autonomous goal loop. Use when user types /goal followed by a completion condition. Keeps working across turns until the condition is met, using subagent evaluation and stop hook auto-continuation.
model: inherit
readonly: false
is_background: false
---

# /goal — Autonomous Goal Loop

Set a persistent objective. Work toward it across turns until it's met.

## How It Works

The user states a completion condition in natural language. After each work phase, a subagent evaluates whether the condition holds. If not, you continue working. A stop hook provides a safety net between turns — if you end a turn with the goal still active, the hook auto-continues you with a `followup_message`.

## Parsing User Input

Users type `/goal` followed by a natural language condition. Parse it flexibly:

```
/goal all tests pass                              → condition only
/goal all tests in test/auth pass, run npm test   → infer validation from context
/goal build succeeds, stop after 15 turns         → infer budget from condition text
/goal migrate to the new API until every call site compiles and tests pass
```

Extract from the natural language:
- **condition**: the completion criteria (required)
- **validation command**: if the user mentions a specific command to run, use it as `--test`
- **budget**: if the user says "stop after N turns" or similar, use it as `--budget`

If the user uses explicit flags, honor those too:
```
/goal "all tests pass" --test "npm test" --budget 20
```

## Setting a Goal

When the user says `/goal`, parse the command and manage state:

```bash
bash ~/.cursor/skills/goal/goal-manage.sh create "<condition>" --test "<cmd>" --budget <N>

# Other lifecycle commands
bash ~/.cursor/skills/goal/goal-manage.sh status
bash ~/.cursor/skills/goal/goal-manage.sh pause
bash ~/.cursor/skills/goal/goal-manage.sh resume
bash ~/.cursor/skills/goal/goal-manage.sh done
bash ~/.cursor/skills/goal/goal-manage.sh clear
```

After creating the goal, **immediately start working toward the condition**.
Do not checkpoint. Do not ask what to do. Begin.

## Working Toward the Goal

### Work Phase Protocol

While the goal is active (`status: "pursuing"`), repeat this cycle:

1. **Do focused work** — make code changes, run commands, fix issues
2. **Run validation** (if `--test` provided) — execute the test command via Shell
3. **MANDATORY: Evaluate** — spawn a readonly subagent to judge completion
4. **Act on result** — YES → mark done. NO → incorporate reason, continue.

⚠️ **CRITICAL RULE:** You MUST call the evaluator subagent (step 3) before
calling `goal-manage.sh done`. NEVER self-assess. NEVER skip the subagent.
The whole point of the two-layer architecture is that a SEPARATE model judges
completion — not you. If you mark done without spawning an evaluator, the
goal protocol is violated.

### Evaluation via Subagent (MANDATORY)

After each significant work phase (not every micro-action), you MUST evaluate
by spawning a real `Task` subagent:

```
Task(
  subagent_type: "generalPurpose",
  readonly: true,
  description: "Evaluate goal completion",
  prompt: "You are a goal completion evaluator. Determine whether this goal
           condition has been achieved based on the evidence provided.

           Goal condition: <condition from goal.json>

           Validation command output (if available):
           <last validation output, or 'no validation command configured'>

           Recent work summary:
           <brief description of what was just done>

           Rules:
           1. Answer ONLY with 'YES: <reason>' or 'NO: <reason>'
           2. Be conservative — only YES when there is clear evidence
           3. If validation command passed (exit 0), that is strong evidence
           4. Keep reason to 1-2 sentences
           5. For NO, explain what specific work remains"
)
```

### Acting on Evaluation Result

**Subagent returns "YES: ..."**
1. Run `goal-manage.sh done` via Shell
2. Report the achievement to the user
3. End turn normally

**Subagent returns "NO: ..."**
1. Parse the reason — it tells you what remains
2. Continue working toward the goal in the same turn
3. After more work, evaluate again
4. Do NOT end the turn while the goal is still pursuing

### Checklist Before Marking Done

Before you call `goal-manage.sh done`, verify ALL of these:
- [ ] A `Task(readonly: true)` subagent was spawned with the evaluation prompt
- [ ] The subagent returned a response starting with "YES:"
- [ ] You are NOT self-assessing (your own judgment does not count)

If any of these are false, DO NOT mark done. Spawn the evaluator first.

### When to Evaluate

Evaluate after:
- Running the validation command and seeing a new result
- Completing a logical unit of work (e.g., fixing a failing test)
- Making changes that could plausibly satisfy the condition

Do NOT evaluate after:
- Every single file edit
- Reading files or gathering context
- Planning or thinking (no observable change)

## Command Reference

| Command | Action |
|---------|--------|
| `/goal <condition>` | Set goal and start working |
| `/goal status` | Show current goal state |
| `/goal pause` | Pause auto-continuation |
| `/goal resume` | Resume a paused goal |
| `/goal clear` | Remove goal entirely |

Aliases for clear: `stop`, `off`, `reset`, `cancel`

## Stop Hook Safety Net

The stop hook (`goal-stop.sh`) fires when your turn ends. If the goal is
still active, it returns a `followup_message` that auto-continues you.

**You should NOT rely on the stop hook as the primary evaluator.** It is
a safety net for cases where you forget to evaluate or end the turn
prematurely. The subagent evaluation within your turn is the primary
mechanism.

## Turn Budget

Default budget is 20 turns. When the budget is hit:
1. The stop hook sets `status: "budget-limited"` and `active: false`
2. You receive a final `followup_message` asking you to wrap up
3. Summarize progress, list what remains, and stop

Users can set custom budgets in their condition ("stop after 50 turns") or with `--budget 50`.

## Followup Message Format

When the stop hook auto-continues you, you'll receive a user message like:

```
[GOAL] Turn 3/20 (17 remaining). Continue working toward: all tests pass
```

When you see `[GOAL]` prefix in a user message, you know you're in an
auto-continued turn. Resume working toward the condition immediately.
Do not re-introduce yourself or ask what to do.
