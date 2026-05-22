# cursor-goal

Autonomous goal loop for Cursor IDE. Set a completion condition, and the agent keeps working until it's met.

Equivalent to Claude Code's `/goal` — but for Cursor.

## Without cursor-goal

- Agent stops after one turn — you re-prompt manually
- No persistent objective — the agent forgets what it was working toward
- No budget tracking — no way to limit turns or monitor progress

## With cursor-goal

- Set a persistent objective that survives across turns
- Auto-continuation via stop hook — the agent keeps working until done
- Subagent evaluator — a separate model judges completion (like Claude Code's Haiku eval)
- Turn budgets — cap how many turns the agent gets, with automatic wrap-up
- Full lifecycle control — pause, resume, clear

## Install

```bash
git clone https://github.com/SyntaxArchmage/cursor-goal.git
cd cursor-goal && ./install-goal.sh
```

This installs:
- `goal-manage.sh` — state management
- `goal-stop.sh` — stop hook for auto-continuation
- `SKILL.md` — agent behavior protocol
- `hooks.json` — Cursor stop hook configuration

### Requirements

- Cursor IDE (1.7+)
- `jq` (`sudo apt install jq`)
- `bash` 4+

## Usage

In Cursor agent chat:

```
/goal "all tests pass" --test "npm test"
```

| Command | Description |
|---------|-------------|
| `/goal "<condition>"` | Set goal and start working |
| `/goal "<condition>" --test "<cmd>"` | Set goal with validation command |
| `/goal "<condition>" --budget <N>` | Custom turn budget (default: 20) |
| `/goal status` | Show current goal state |
| `/goal pause` | Pause auto-continuation |
| `/goal resume` | Resume a paused goal |
| `/goal clear` | Remove goal entirely |

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│  User: /goal "all tests pass" --test "npm test"         │
│         │                                                │
│         ▼                                                │
│  Agent works → runs tests → spawns evaluator subagent    │
│         │                                                │
│         ├── Subagent: NO (3 tests failing)               │
│         │   └── Agent continues working (same turn)      │
│         │                                                │
│         └── Subagent: YES (all tests pass)               │
│             └── Goal achieved → agent stops              │
│                                                          │
│  Safety net: if agent ends turn with goal still active   │
│  → stop hook sends followup_message → auto-continues     │
└─────────────────────────────────────────────────────────┘
```

### Two-Layer Architecture

1. **In-Turn Evaluation (subagent):** Agent spawns a readonly subagent to evaluate the goal condition. If NO, agent continues working in the same turn.

2. **Between-Turn Safety Net (stop hook):** If the agent ends a turn with the goal still active, `goal-stop.sh` fires and returns a `followup_message` that auto-continues the agent.

### How This Compares to Claude Code

| Aspect | Claude Code `/goal` | cursor-goal |
|--------|---------------------|-------------|
| Evaluator | Haiku (prompt-based hook) | Cursor subagent (Task, readonly) |
| Evaluation timing | Between turns only | **Within turn** + between turns |
| Validation | Transcript text only | Transcript + validation command output |
| Loop guard | `stop_hook_active` flag | `loop_count` + `turn_budget` |
| Cost | Haiku tokens per eval | Same model pool (subagent) |

## Writing Good Conditions

Good conditions are specific and verifiable:

```
✓ "all tests in test/auth/ pass"
✓ "npm run build exits with code 0"
✓ "no ESLint errors in src/"
```

Bad conditions are vague:

```
✗ "the code is clean"
✗ "implement the feature"
```

When a condition has a natural test command, always use `--test`:

```
/goal "all tests pass" --test "npm test"
/goal "build succeeds" --test "npm run build"
/goal "no lint errors" --test "eslint src/ --quiet"
```

## File Layout

```
~/.cursor/skills/goal/
├── SKILL.md              # Agent behavior protocol
├── goal-manage.sh        # State management
└── goal-stop.sh          # Stop hook (auto-continuation)

~/.durable-request/data/
└── goal.json             # Runtime state
```

## Compatible With

- **Standalone:** Works on its own for any Cursor project
- **durable-request:** When combined, goal completion triggers `/deep-sleep` instead of a checkpoint

## License

MIT
