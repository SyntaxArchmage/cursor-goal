# Install cursor-goal

## Quick Install (Recommended — Let the Agent Do It)

The simplest way to install is to tell your agent:

```
Install the /goal skill from https://github.com/SyntaxArchmage/cursor-goal
```

The agent will clone the repo, run the install script, and configure everything. This
works in Cursor IDE, Cursor CLI, and any environment where the agent has Shell access.

If the agent needs more specific instructions, point it to:

```
bash <(curl -s https://raw.githubusercontent.com/SyntaxArchmage/cursor-goal/main/install-goal.sh)
```

Or from a local clone:

```bash
git clone https://github.com/SyntaxArchmage/cursor-goal.git
cd cursor-goal && ./install-goal.sh
```

## What Gets Installed

| File | Purpose |
|------|---------|
| `~/.cursor/agents/goalKeeper.md` | Agent definition — tells your platform when/how to use /goal |
| `~/.cursor/skills/goal/SKILL.md` | Skill protocol — the agent reads this to learn the workflow |
| `~/.cursor/skills/goal/goal-manage.sh` | State lifecycle (create, pause, resume, done, clear) |
| `~/.cursor/skills/goal/goal-eval.sh` | Evaluator harness (prompt generation, signal, result parsing) |
| `~/.cursor/skills/goal/goal-parse.sh` | Input parser (natural language → structured args) |
| `~/.cursor/skills/goal/goal-stop.sh` | Stop hook — auto-continues agent between turns |
| `~/.cursor/hooks.json` | Registers the stop hook with Cursor |
| `~/.durable-request/data/goal.json` | Runtime state (created at first use) |

## Requirements

- `jq` — `sudo apt install jq` (Linux) / `brew install jq` (macOS)
- `bash` 4+

### Platform-Specific

| Platform | Required | Notes |
|---|---|---|
| Cursor IDE | Cursor 1.7+ | Fully tested |
| Cursor CLI | cursor-agent | Harness works; stop hook works |
| Claude Code | Claude CLI | Copy `.claude/agents/goalKeeper.md` manually (see below) |
| Copilot IDE | VS Code + Copilot | Copy `.github/agents/goal-evaluator.md` manually |
| OpenCode | opencode CLI | Configure agent in `opencode.json` |

See [platform-compatibility.md](platform-compatibility.md) for the full matrix.

## Manual Install (Any Platform)

If you prefer manual setup or are on a non-Cursor platform:

```bash
git clone https://github.com/SyntaxArchmage/cursor-goal.git
cd cursor-goal

# 1. Copy harness scripts (universal — all platforms use these)
mkdir -p ~/.cursor/skills/goal ~/.durable-request/data
cp .cursor/skills/goal/goal-manage.sh ~/.cursor/skills/goal/
cp .cursor/skills/goal/goal-eval.sh   ~/.cursor/skills/goal/
cp .cursor/skills/goal/goal-parse.sh  ~/.cursor/skills/goal/
cp .cursor/skills/goal/goal-stop.sh   ~/.cursor/skills/goal/
cp .cursor/skills/goal/SKILL.md       ~/.cursor/skills/goal/
chmod +x ~/.cursor/skills/goal/*.sh

# 2. Copy agent definition (pick your platform)
# Cursor IDE / CLI:
mkdir -p ~/.cursor/agents
cp .cursor/agents/goalKeeper.md ~/.cursor/agents/

# Claude Code:
# mkdir -p .claude/agents
# cp .claude/agents/goalKeeper.md .claude/agents/

# Copilot IDE:
# mkdir -p .github/agents
# cp .github/agents/goal-evaluator.md .github/agents/
```

Then add the stop hook to `~/.cursor/hooks.json` (Cursor only):

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

If you already have a `hooks.json`, add the stop entry to your existing `hooks.stop` array.

## Verify Installation

After install, type this in any agent chat:

```
/goal status
```

You should see: `[goal] No active goal.`

## Uninstall

```bash
rm -f ~/.cursor/agents/goalKeeper.md
rm -rf ~/.cursor/skills/goal
rm -f ~/.durable-request/data/goal.json
rm -f ~/.durable-request/data/goal-eval-done
# Remove the stop hook entry from ~/.cursor/hooks.json manually
```
