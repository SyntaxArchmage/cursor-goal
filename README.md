# cursor-goal

Autonomous goal loop for AI coding agents. Set a completion condition, and the agent keeps working until it's met.

Works with Cursor IDE, Cursor CLI, Claude Code, Copilot IDE, and OpenCode.

## Without cursor-goal

- Agent stops after one turn — you re-prompt manually
- No persistent objective — the agent forgets what it was working toward
- No budget tracking — no way to limit turns or monitor progress

## With cursor-goal

- Set a persistent objective that survives across turns
- Auto-continuation via stop hook — the agent keeps working until done
- Subagent evaluator — a separate agent judges completion (no self-assessment)
- Harness-enforced rules — `goal-manage.sh done` **rejects** if no evaluator ran
- Turn budgets — cap how many turns the agent gets, with automatic wrap-up
- Full lifecycle control — pause, resume, clear

## Install

Tell your agent:

```
Install the /goal skill from https://github.com/SyntaxArchmage/cursor-goal
```

Or from a local clone:

```bash
git clone https://github.com/SyntaxArchmage/cursor-goal.git
cd cursor-goal && ./install-goal.sh
```

See [install.md](install.md) for manual setup, multi-platform instructions, and uninstall.

### Requirements

- `jq` (`sudo apt install jq` / `brew install jq`)
- `bash` 4+

### Platform Support

| Platform | Tested | Agent Definition |
|---|---|---|
| Cursor IDE | **Yes** | `.cursor/agents/goalKeeper.md` |
| Cursor CLI | No | `.cursor/agents/goalKeeper.md` |
| Claude Code | No | `.claude/agents/goalKeeper.md` |
| Copilot IDE | No | `.github/agents/goal-evaluator.md` |
| OpenCode | No | `opencode.json` (inline) |

See [platform-compatibility.md](platform-compatibility.md) for the full matrix.

## Usage

In any agent chat, type `/goal` followed by what you want done:

```
/goal all tests in test/auth pass and the lint step is clean
/goal migrate every API call to v2 until the build succeeds, stop after 20 turns
/goal fix the failing CI checks
/goal every exported function in src/services has JSDoc
```

The agent parses your natural language condition, starts working immediately, and keeps going until the condition is met.

Explicit flags also work:

```
/goal "all tests pass" --test "npm test" --budget 20
```

| Command | Description |
|---------|-------------|
| `/goal <condition>` | Set goal and start working |
| `/goal status` | Show current goal state |
| `/goal pause` | Pause auto-continuation |
| `/goal resume` | Resume a paused goal |
| `/goal clear` | Remove goal entirely |

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  User: /goal all tests pass and lint is clean, stop after 15     │
│         │                                                         │
│         ▼                                                         │
│  goal-parse.sh → extracts condition, test cmd, budget             │
│         │                                                         │
│         ▼                                                         │
│  goal-manage.sh create → goal.json written                        │
│         │                                                         │
│         ▼                                                         │
│  Agent works → runs tests                                         │
│         │                                                         │
│         ▼                                                         │
│  goal-eval.sh prompt → generates evaluator prompt                 │
│  Agent spawns readonly evaluator subagent                         │
│         │                                                         │
│         ├── goal-eval.sh parse-result → NO (3 tests failing)      │
│         │   └── Agent continues working (same turn)               │
│         │                                                         │
│         └── goal-eval.sh parse-result → YES (all passing)         │
│             └── goal-eval.sh signal → goal-manage.sh done         │
│                 └── Goal achieved → agent stops                   │
│                                                                   │
│  Safety net: if agent ends turn with goal still active            │
│  → goal-stop.sh sends followup_message → auto-continues           │
└──────────────────────────────────────────────────────────────────┘
```

### Harness-Driven Design

Rules are enforced by programs, not prose:

| Script | What It Enforces |
|--------|-----------------|
| `goal-parse.sh` | Condition extraction, budget/validation detection from natural language |
| `goal-manage.sh` | State lifecycle; `done` rejects without evaluator signal (exit 1) |
| `goal-eval.sh` | Evaluator prompt generation, signal lifecycle, result parsing |
| `goal-stop.sh` | Auto-continuation between turns, budget enforcement |

The agent calls these scripts via Shell. The SKILL.md tells the agent *when* to call them — the scripts enforce *how* they work. This means:

- **No self-assessment**: `goal-manage.sh done` physically rejects if no evaluator ran
- **No prompt drift**: `goal-eval.sh prompt` generates the evaluator prompt, not the agent
- **No parsing errors**: `goal-eval.sh parse-result` extracts YES/NO deterministically
- **Cross-platform**: harness scripts work anywhere the agent has Shell access

### Two-Layer Evaluation

1. **In-Turn (subagent):** Agent spawns a readonly evaluator subagent with the prompt from `goal-eval.sh`. If NO, agent continues working in the same turn.

2. **Between-Turn (stop hook):** If the agent ends a turn with the goal still active, `goal-stop.sh` fires and returns a `followup_message` that auto-continues the agent.

### How This Compares to Claude Code

| Aspect | Claude Code `/goal` | cursor-goal |
|--------|---------------------|-------------|
| Evaluator | Haiku (prompt-based hook) | Subagent (readonly, any model) |
| Evaluation timing | Between turns only | **Within turn** + between turns |
| Validation | Transcript text only | Transcript + validation command output |
| Rule enforcement | Prose in CLAUDE.md | **Harness scripts** (programmatic) |
| Self-assessment guard | None | `goal-eval-done` signal file + `done` rejection |
| Loop guard | `stop_hook_active` flag | `loop_count` + `turn_budget` |
| Cross-platform | Claude Code only | Cursor, Claude Code, Copilot, OpenCode |

## Writing Good Conditions

Write conditions like you'd tell a colleague "keep going until...":

```
✓ all tests in test/auth pass and the lint step is clean
✓ every call site of the old API has been migrated and the build succeeds
✓ CHANGELOG.md has an entry for every PR merged this week
✓ no ESLint errors in src/, stop after 15 turns
✓ split utils.ts into focused modules until each is under 200 lines
```

Bad conditions are vague or have no observable end state:

```
✗ the code is clean
✗ implement the feature
✗ fix the bug
```

Include the check method and turn cap inline:

```
/goal all tests pass, verified by npm test, stop after 20 turns
/goal drain the P1 issue backlog until the queue is empty
```

## File Layout

```
~/.cursor/agents/
└── goalKeeper.md              # Agent definition (Cursor)

~/.cursor/skills/goal/
├── SKILL.md                   # Agent behavior protocol
├── goal-manage.sh             # State lifecycle
├── goal-eval.sh               # Evaluator harness
├── goal-parse.sh              # Input parser
└── goal-stop.sh               # Stop hook (auto-continuation)

~/.cursor-goal/data/
├── goal.json                  # Runtime state (created at first use)
└── goal-eval-done             # Evaluator signal (transient)
```

## Testing

```bash
# Harness unit tests (68 tests)
bash testing/test-harness.sh

# Subagent pattern tests (requires transcript samples)
bash testing/run-tests.sh
```

## Compatible With

- **Standalone:** Works on its own for any project
- **durable-request:** Optional integration — goal completion can trigger `/deep-sleep`

## License

MIT
