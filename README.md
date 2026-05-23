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
cd cursor-goal

# Copy agent + skill files
mkdir -p ~/.cursor/agents ~/.cursor/skills/goal ~/.durable-request/data
cp .cursor/agents/goal.md ~/.cursor/agents/
cp .cursor/skills/goal/goal-manage.sh ~/.cursor/skills/goal/
cp .cursor/skills/goal/goal-stop.sh ~/.cursor/skills/goal/
chmod +x ~/.cursor/skills/goal/*.sh
```

Then add the stop hook to `~/.cursor/hooks.json` (create if missing):

```json
{
  "version": 1,
  "hooks": {
    "stop": [
      {
        "command": "~/.cursor/skills/goal/goal-stop.sh",
        "loop_limit": null,
        "timeout": 30
      }
    ]
  }
}
```

See [install.md](install.md) for full details, verification steps, and uninstall instructions.

### Automated Install (alternative)

```bash
./install-goal.sh
```

Handles hooks.json merging automatically.

### Requirements

- Cursor IDE (1.7+)
- `jq` (`sudo apt install jq` / `brew install jq`)
- `bash` 4+

## Usage

In Cursor agent chat, just type `/goal` followed by what you want done:

```
/goal all tests in test/auth pass and the lint step is clean
/goal migrate every API call to v2 until the build succeeds, stop after 20 turns
/goal fix the failing CI checks
/goal every exported function in src/services has JSDoc
```

The agent parses your natural language condition, starts working immediately, and keeps going until the condition is met.

You can also use explicit flags if you prefer:

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

## How It Works

```
┌──────────────────────────────────────────────────────────────────┐
│  User: /goal all tests pass and lint is clean, stop after 15     │
│         │                                                         │
│         ▼                                                         │
│  Agent works → runs tests → spawns evaluator subagent             │
│         │                                                         │
│         ├── Subagent: NO (3 tests failing)                        │
│         │   └── Agent continues working (same turn)               │
│         │                                                         │
│         └── Subagent: YES (all passing, lint clean)               │
│             └── Goal achieved → agent stops                       │
│                                                                   │
│  Safety net: if agent ends turn with goal still active            │
│  → stop hook sends followup_message → auto-continues              │
└──────────────────────────────────────────────────────────────────┘
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

You can include the check method and turn cap inline:

```
/goal all tests pass, verified by npm test, stop after 20 turns
/goal drain the P1 issue backlog until the queue is empty
```

## File Layout

```
~/.cursor/agents/
└── goal.md               # Subagent definition (Cursor picks this up natively)

~/.cursor/skills/goal/
├── SKILL.md              # Agent behavior protocol
├── goal-manage.sh        # State management
└── goal-stop.sh          # Stop hook (auto-continuation)

~/.durable-request/data/
└── goal.json             # Runtime state (created at first use)
```

## Compatible With

- **Standalone:** Works on its own for any Cursor project
- **durable-request:** When combined, goal completion triggers `/deep-sleep` instead of a checkpoint

## License

MIT
