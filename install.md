# Install cursor-goal

## Quick Install (Recommended)

Copy the agent and skill files into your Cursor config:

```bash
# Clone the repo
git clone https://github.com/SyntaxArchmage/cursor-goal.git
cd cursor-goal

# Copy subagent definition
mkdir -p ~/.cursor/agents
cp .cursor/agents/goal.md ~/.cursor/agents/goal.md

# Copy skill files (state management + stop hook)
mkdir -p ~/.cursor/skills/goal
cp .cursor/skills/goal/goal-manage.sh ~/.cursor/skills/goal/goal-manage.sh
cp .cursor/skills/goal/goal-stop.sh ~/.cursor/skills/goal/goal-stop.sh
chmod +x ~/.cursor/skills/goal/goal-manage.sh ~/.cursor/skills/goal/goal-stop.sh

# Create data directory
mkdir -p ~/.durable-request/data
```

Then add the stop hook to `~/.cursor/hooks.json`:

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

If you already have a `hooks.json`, just add the stop entry to your existing `hooks.stop` array.

That's it. Open Cursor and type `/goal`.

## Requirements

- Cursor IDE (1.7+)
- `jq` — `sudo apt install jq` (Linux) / `brew install jq` (macOS)
- `bash` 4+

## Alternative: Automated Install

If you prefer a one-command install that handles `hooks.json` merging automatically:

```bash
git clone https://github.com/SyntaxArchmage/cursor-goal.git
cd cursor-goal && ./install-goal.sh
```

This runs the same steps above plus merges the stop hook into your existing `hooks.json` if one exists.

## What Gets Installed

| File | Purpose |
|------|---------|
| `~/.cursor/agents/goal.md` | Subagent definition — tells Cursor when/how to use /goal |
| `~/.cursor/skills/goal/goal-manage.sh` | State management (create, pause, resume, done, clear) |
| `~/.cursor/skills/goal/goal-stop.sh` | Stop hook — auto-continues agent between turns |
| `~/.cursor/hooks.json` | Registers the stop hook with Cursor |
| `~/.durable-request/data/goal.json` | Runtime state (created at first use) |

## Verify Installation

After install, type this in any Cursor agent chat:

```
/goal status
```

You should see: `[goal] No active goal.`

## Uninstall

```bash
rm -f ~/.cursor/agents/goal.md
rm -rf ~/.cursor/skills/goal
rm -f ~/.durable-request/data/goal.json
# Remove the stop hook entry from ~/.cursor/hooks.json manually
```
