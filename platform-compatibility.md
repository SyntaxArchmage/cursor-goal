# Platform Compatibility

The `/goal` harness scripts (`goal-*.sh`) are platform-agnostic shell. They work on any
platform where the agent can run Shell commands. Agent definitions and subagent APIs
differ per platform.

**Install:** `./install-goal.sh` copies harness scripts to `~/.cursor/skills/goal/`.

## Compatibility Matrix

| Platform | Agent Def Location | Agent File | Subagent Tool | Nested Subagents | Stop Hook | Tested |
|---|---|---|---|---|---|---|
| Cursor IDE | `.cursor/agents/` | `goalKeeper.md` | `Task` | Yes | `hooks.json` | **YES** |
| Cursor CLI | `.cursor/agents/` | `goalKeeper.md` | `Task` | Yes (since fix) | `hooks.json` | NO |
| Claude Code | `.claude/agents/` | `goalKeeper.md` | `Agent` | No (1 depth) | `CLAUDE.md` | NO |
| Copilot IDE | `.github/agents/` | `goal-evaluator.md` | `runSubagent` | Yes (depth 5, opt-in) | N/A | NO |
| OpenCode | `opencode.json` | (inline config) | `Task` | Yes (opt-in) | N/A | NO |
| Copilot CLI | `.github/agents/` | `goal-evaluator.md` | `/agent` (limited) | No | N/A | NO |

Only **Cursor IDE** has been end-to-end tested. All other platforms are **UNTESTED** —
definitions are provided based on documented platform APIs.

## Files Per Platform

### Cursor IDE / Cursor CLI

```
.cursor/agents/goalKeeper.md     → ~/.cursor/agents/goalKeeper.md
.cursor/skills/goal/SKILL.md     → ~/.cursor/skills/goal/SKILL.md
.cursor/skills/goal/goal-*.sh    → ~/.cursor/skills/goal/
~/.cursor/hooks.json             → stop hook → goal-stop.sh
```

### Claude Code

```
.claude/agents/goalKeeper.md     → project or ~/.claude/agents/
~/.cursor/skills/goal/goal-*.sh  → harness (via install-goal.sh)
CLAUDE.md                        → stop hook → goal-stop.sh
```

### Copilot IDE / Copilot CLI

```
.github/agents/goal-evaluator.md → project .github/agents/
~/.cursor/skills/goal/goal-*.sh  → harness (via install-goal.sh)
```

### OpenCode

Configure agent inline in `opencode.json`. Reference harness scripts at
`~/.cursor/skills/goal/` and use `Task` for evaluator subagents.

## Harness Scripts (Universal)

All platforms use the same scripts via Shell:

| Script | Purpose |
|--------|---------|
| `goal-parse.sh` | Parse `/goal` input → structured args |
| `goal-manage.sh` | Goal state lifecycle (create, status, pause, resume, done, clear) |
| `goal-eval.sh` | Evaluator prompt generation, signal, result parsing |
| `goal-stop.sh` | Stop hook auto-continuation |

State file: `~/.durable-request/data/goal.json`

## Platform Limitations

| Platform | Limitation |
|---|---|
| Cursor IDE | Reference implementation; fully tested |
| Cursor CLI | Same agent defs as IDE; CLI-specific behavior untested |
| Claude Code | Subagents cannot nest — evaluator cannot spawn further subagents |
| Copilot IDE | No native stop hook; may need manual continuation |
| OpenCode | Agent config in JSON, not markdown; untested |
| Copilot CLI | `/agent` command is limited; no nested subagents |

## Subagent Invocation Pattern

Every platform follows the same cycle; only the subagent tool name changes:

```bash
EVAL_PROMPT=$(bash ~/.cursor/skills/goal/goal-eval.sh prompt --work-summary "...")
# Platform-specific spawn:
#   Cursor:     Task(readonly: true, prompt: $EVAL_PROMPT)
#   Claude:     Agent(readonly: true, prompt: $EVAL_PROMPT)
#   Copilot:    runSubagent(readonly: true, prompt: $EVAL_PROMPT)
bash ~/.cursor/skills/goal/goal-eval.sh parse-result "<response>"
```
