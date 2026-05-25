#!/usr/bin/env bash
set -euo pipefail

# goal-eval.sh — Evaluator prompt generation and lifecycle for /goal skill
#
# Moves evaluator logic from prose rules into a programmatic harness.
# The agent calls this script instead of manually assembling prompts.
#
# Usage:
#   goal-eval.sh prompt [--work-summary "..."]      → print evaluator prompt
#   goal-eval.sh signal                              → record that evaluator ran
#   goal-eval.sh check                               → exit 0 if evaluator ran, 1 if not
#   goal-eval.sh parse-result "<subagent output>"    → print YES/NO and reason

DATA_DIR="${CURSOR_GOAL_DATA:-${HOME}/.cursor-goal/data}"
GOAL_FILE="${DATA_DIR}/goal.json"
EVAL_FLAG="${DATA_DIR}/goal-eval-done"

die() { echo "[goal-eval] Error: $*" >&2; exit 1; }

require_goal() {
  [ -f "$GOAL_FILE" ] || die "No active goal. Run goal-manage.sh create first."
}

cmd_prompt() {
  require_goal

  local work_summary=""
  while [ $# -gt 0 ]; do
    case "$1" in
      --work-summary) work_summary="${2:-}"; shift 2 ;;
      *) shift ;;
    esac
  done

  local condition validation_cmd last_validation_output
  condition=$(jq -r '.condition' "$GOAL_FILE")
  validation_cmd=$(jq -r '.validation_command // empty' "$GOAL_FILE")
  last_validation_output=$(jq -r '.last_validation_output // empty' "$GOAL_FILE")

  local validation_section
  if [ -n "$last_validation_output" ]; then
    validation_section="Validation command: ${validation_cmd}
Output:
${last_validation_output}"
  elif [ -n "$validation_cmd" ]; then
    validation_section="Validation command (${validation_cmd}) has not been run yet."
  else
    validation_section="No validation command configured."
  fi

  local work_section
  if [ -n "$work_summary" ]; then
    work_section="Recent work summary:
${work_summary}"
  else
    work_section="(No work summary provided — evaluate based on validation output and any available evidence.)"
  fi

  cat <<PROMPT
You are a goal completion evaluator. Determine whether this goal condition has been achieved based on the evidence provided.

Goal condition: ${condition}

${validation_section}

${work_section}

Rules:
1. Answer ONLY with 'YES: <reason>' or 'NO: <reason>'
2. Be conservative — only YES when there is clear evidence
3. If validation command passed (exit 0), that is strong evidence
4. Keep reason to 1-2 sentences
5. For NO, explain what specific work remains
PROMPT
}

cmd_signal() {
  mkdir -p "$DATA_DIR"
  touch "$EVAL_FLAG"
  echo "[goal-eval] Evaluator signal recorded."
}

cmd_check() {
  if [ -f "$EVAL_FLAG" ]; then
    echo "[goal-eval] OK: Evaluator has run for this cycle."
    exit 0
  else
    echo "[goal-eval] FAIL: No evaluator signal for this cycle."
    echo "[goal-eval] You must spawn an evaluator subagent before marking done."
    exit 1
  fi
}

cmd_parse_result() {
  local result="${1:-}"
  [ -z "$result" ] && die "Usage: goal-eval.sh parse-result \"<subagent output>\""

  # Extract verdict (first line containing YES or NO)
  local verdict=""
  local reason=""

  if echo "$result" | grep -qi "^YES:"; then
    verdict="YES"
    reason=$(echo "$result" | grep -i "^YES:" | head -1 | sed 's/^YES:[[:space:]]*//')
  elif echo "$result" | grep -qi "^NO:"; then
    verdict="NO"
    reason=$(echo "$result" | grep -i "^NO:" | head -1 | sed 's/^NO:[[:space:]]*//')
  elif echo "$result" | grep -qi "YES"; then
    verdict="YES"
    reason=$(echo "$result" | head -3)
  elif echo "$result" | grep -qi "NO"; then
    verdict="NO"
    reason=$(echo "$result" | head -3)
  else
    verdict="UNCLEAR"
    reason="Could not parse evaluator response. Treat as NO and re-evaluate."
  fi

  # Update goal.json with the evaluation reason
  if [ -f "$GOAL_FILE" ]; then
    jq --arg reason "$reason" '.last_reason = $reason' "$GOAL_FILE" \
      > "${GOAL_FILE}.tmp" && mv "${GOAL_FILE}.tmp" "$GOAL_FILE" 2>/dev/null || true
  fi

  # Output structured result
  echo "VERDICT=${verdict}"
  echo "REASON=${reason}"

  # Return exit code: 0 for YES, 1 for NO/UNCLEAR
  [ "$verdict" = "YES" ] && exit 0 || exit 1
}

# Dispatch
case "${1:-help}" in
  prompt)       shift; cmd_prompt "$@" ;;
  signal)       cmd_signal ;;
  check)        cmd_check ;;
  parse-result) shift; cmd_parse_result "$@" ;;
  help|*)
    echo "Usage: goal-eval.sh <command> [args...]"
    echo "  prompt [--work-summary \"...\"]    Generate evaluator prompt from goal.json"
    echo "  signal                            Record that evaluator ran this cycle"
    echo "  check                             Verify evaluator ran (exit 0/1)"
    echo "  parse-result \"<output>\"           Parse YES/NO from subagent response"
    ;;
esac
