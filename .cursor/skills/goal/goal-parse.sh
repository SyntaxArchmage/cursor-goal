#!/usr/bin/env bash
set -euo pipefail

# goal-parse.sh — Parse natural language /goal input into structured args
#
# Extracts condition, validation command, and budget from freeform user input.
# Replaces prose rules about "parse flexibly" with deterministic regex.
#
# Usage:
#   goal-parse.sh "<raw /goal input>"
#
# Output (eval-safe):
#   CONDITION="all tests pass"
#   TEST_CMD="npm test"
#   BUDGET=20
#   GOAL_CMD="bash ~/.cursor/skills/goal/goal-manage.sh create \"all tests pass\" --test \"npm test\" --budget 20"

die() { echo "[goal-parse] Error: $*" >&2; exit 1; }

raw="${1:-}"
[ -z "$raw" ] && die "Usage: goal-parse.sh \"<raw /goal input>\""

# Strip leading /goal prefix if present
raw=$(echo "$raw" | sed 's|^/goal[[:space:]]*||')

# Handle subcommands first
case "$raw" in
  status|pause|resume|clear|stop|off|reset|cancel)
    echo "SUBCOMMAND=${raw}"
    case "$raw" in
      stop|off|reset|cancel) echo "GOAL_CMD=\"bash ~/.cursor/skills/goal/goal-manage.sh clear\"" ;;
      *) echo "GOAL_CMD=\"bash ~/.cursor/skills/goal/goal-manage.sh ${raw}\"" ;;
    esac
    exit 0
    ;;
esac

condition="$raw"
test_cmd=""
budget=20

# Extract explicit flags first (--test "...", --budget N)
if echo "$condition" | grep -q '\-\-test'; then
  test_cmd=$(echo "$condition" | grep -oP '\-\-test\s+"([^"]+)"' | sed 's/--test[[:space:]]*"//' | sed 's/"$//')
  if [ -z "$test_cmd" ]; then
    test_cmd=$(echo "$condition" | grep -oP '\-\-test\s+(\S+)' | sed 's/--test[[:space:]]*//')
  fi
  condition=$(echo "$condition" | sed 's/--test[[:space:]]*"[^"]*"//g' | sed 's/--test[[:space:]]*\S*//g')
fi

if echo "$condition" | grep -q '\-\-budget'; then
  budget=$(echo "$condition" | grep -oP '\-\-budget\s+(\d+)' | grep -oP '\d+')
  condition=$(echo "$condition" | sed 's/--budget[[:space:]]*[0-9]*//g')
fi

# Extract natural language budget hints: "stop after N turns", "limit to N", "max N turns"
if echo "$condition" | grep -qiP '(stop|limit|max)\s+(after\s+|to\s+)?(\d+)\s*(turns?|iterations?|cycles?|rounds?)'; then
  nl_budget=$(echo "$condition" | grep -oiP '(stop|limit|max)\s+(after\s+|to\s+)?(\d+)' | grep -oP '\d+' | head -1)
  if [ -n "$nl_budget" ]; then
    budget="$nl_budget"
    condition=$(echo "$condition" | sed -E 's/,?\s*(stop|limit|max)\s+(after\s+|to\s+)?[0-9]+\s*(turns?|iterations?|cycles?|rounds?)//gi')
  fi
fi

# Extract natural language validation hints: "verified by <cmd>", "run <cmd>", "using <cmd>"
if [ -z "$test_cmd" ]; then
  for pattern in \
    'verified\s+by\s+' \
    'run\s+' \
    'check\s+with\s+' \
    'using\s+' \
    'via\s+'; do
    match=$(echo "$condition" | grep -oiP "${pattern}[\`\"]?([^\`\",]+)[\`\"]?" | head -1 || true)
    if [ -n "$match" ]; then
      candidate=$(echo "$match" | sed -E "s/^(verified|run|check|using|via)\s+(by\s+|with\s+)?//i" | sed 's/^[`"]//' | sed 's/[`"]$//' | xargs)
      # Only accept if it looks like a command (contains no spaces OR is a known pattern)
      if echo "$candidate" | grep -qP '^(npm|yarn|pnpm|make|cargo|go|python|pytest|jest|vitest|rspec|mix|dotnet|gradle|mvn)\b'; then
        test_cmd="$candidate"
        condition=$(echo "$condition" | sed -E "s/,?\s*(verified|run|check|using|via)\s+(by\s+|with\s+)?[\`\"]?${candidate}[\`\"]?//gi")
      fi
    fi
  done
fi

# Clean up condition: trim quotes, commas, whitespace
condition=$(echo "$condition" | sed 's/^[[:space:]"]*//;s/[[:space:]",]*$//' | sed 's/[[:space:]]\+/ /g')

[ -z "$condition" ] && die "Could not extract a condition from: $raw"

# Build the goal-manage.sh command
cmd="bash ~/.cursor/skills/goal/goal-manage.sh create \"${condition}\""
[ -n "$test_cmd" ] && cmd="${cmd} --test \"${test_cmd}\""
[ "$budget" != "20" ] && cmd="${cmd} --budget ${budget}"

echo "CONDITION=\"${condition}\""
echo "TEST_CMD=\"${test_cmd}\""
echo "BUDGET=${budget}"
echo "GOAL_CMD=${cmd}"
