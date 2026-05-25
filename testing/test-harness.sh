#!/usr/bin/env bash
# test-harness.sh — Unit tests for /goal harness scripts
# Platform: Cursor IDE only (other platforms untested)

set -uo pipefail

PASS=0
FAIL=0
TOTAL=0

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="${REPO_ROOT}/.cursor/skills/goal"
TEST_HOME="$(mktemp -d)"
export HOME="$TEST_HOME"
DATA_DIR="${HOME}/.durable-request/data"

trap 'rm -rf "$TEST_HOME"' EXIT

cleanup_goal_state() {
  rm -rf "$DATA_DIR"
}

assert_eq() {
  local name="$1" expected="$2" actual="$3"
  TOTAL=$((TOTAL + 1))
  if [ "$expected" = "$actual" ]; then
    PASS=$((PASS + 1))
    echo "  PASS: $name"
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL: $name (expected '$expected', got '$actual')" >&2
  fi
}

assert_contains() {
  local name="$1" needle="$2" haystack="$3"
  TOTAL=$((TOTAL + 1))
  if echo "$haystack" | grep -qF "$needle"; then
    PASS=$((PASS + 1))
    echo "  PASS: $name"
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL: $name (expected to contain '$needle')" >&2
  fi
}

assert_exit() {
  local name="$1" expected_exit="$2"
  shift 2
  local output exit_code
  set +e
  output=$("$@" 2>&1)
  exit_code=$?
  set -e
  TOTAL=$((TOTAL + 1))
  if [ "$exit_code" -eq "$expected_exit" ]; then
    PASS=$((PASS + 1))
    echo "  PASS: $name"
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL: $name (expected exit $expected_exit, got $exit_code)" >&2
  fi
  REPLY="$output"
}

assert_file_exists() {
  local name="$1" path="$2"
  TOTAL=$((TOTAL + 1))
  if [ -f "$path" ]; then
    PASS=$((PASS + 1))
    echo "  PASS: $name"
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL: $name (missing file: $path)" >&2
  fi
}

assert_file_missing() {
  local name="$1" path="$2"
  TOTAL=$((TOTAL + 1))
  if [ ! -f "$path" ]; then
    PASS=$((PASS + 1))
    echo "  PASS: $name"
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL: $name (file still exists: $path)" >&2
  fi
}

parse_line_value() {
  local prefix="$1" line="$2"
  line="${line#${prefix}=}"
  if [[ "$line" == \"*\" ]]; then
    line="${line#\"}"
    line="${line%\"}"
  fi
  echo "$line"
}

run_parse() {
  local raw="$1"
  set +e
  PARSE_OUTPUT=$("$SCRIPT_DIR/goal-parse.sh" "$raw" 2>&1)
  PARSE_EXIT=$?
  set -e
  CONDITION=""
  TEST_CMD=""
  BUDGET=""
  SUBCOMMAND=""
  GOAL_CMD=""
  if [ "$PARSE_EXIT" -eq 0 ]; then
    local line
    while IFS= read -r line; do
      case "$line" in
        CONDITION=*) CONDITION="$(parse_line_value CONDITION "$line")" ;;
        TEST_CMD=*) TEST_CMD="$(parse_line_value TEST_CMD "$line")" ;;
        BUDGET=*) BUDGET="${line#BUDGET=}" ;;
        SUBCOMMAND=*) SUBCOMMAND="${line#SUBCOMMAND=}" ;;
        GOAL_CMD=*) GOAL_CMD="${line#GOAL_CMD=}" ;;
      esac
    done <<< "$PARSE_OUTPUT"
  fi
}

# ---------------------------------------------------------------------------
# goal-parse.sh
# ---------------------------------------------------------------------------

test_parse_simple_condition() {
  echo "goal-parse: simple condition"
  cleanup_goal_state
  run_parse "fix the login bug"
  assert_eq "parse simple condition exit" "0" "$PARSE_EXIT"
  assert_eq "CONDITION" "fix the login bug" "${CONDITION:-}"
  assert_eq "TEST_CMD empty" "" "${TEST_CMD:-}"
  assert_eq "BUDGET default" "20" "${BUDGET:-}"
}

test_parse_validation_hint() {
  echo "goal-parse: condition with validation hint"
  cleanup_goal_state
  run_parse "all tests pass, verified by npm test"
  assert_eq "parse validation hint exit" "0" "$PARSE_EXIT"
  assert_eq "CONDITION" "all tests pass" "${CONDITION:-}"
  assert_eq "TEST_CMD" "npm test" "${TEST_CMD:-}"
  assert_eq "BUDGET default" "20" "${BUDGET:-}"
}

test_parse_budget_hint() {
  echo "goal-parse: condition with budget hint"
  cleanup_goal_state
  run_parse "fix bugs, stop after 10 turns"
  assert_eq "parse budget hint exit" "0" "$PARSE_EXIT"
  assert_eq "CONDITION" "fix bugs" "${CONDITION:-}"
  assert_eq "BUDGET" "10" "${BUDGET:-}"
}

test_parse_full_combination() {
  echo "goal-parse: full combination"
  cleanup_goal_state
  run_parse "all tests pass, verified by pytest, stop after 15 turns"
  assert_eq "parse full combination exit" "0" "$PARSE_EXIT"
  assert_eq "CONDITION" "all tests pass" "${CONDITION:-}"
  assert_eq "TEST_CMD" "pytest" "${TEST_CMD:-}"
  assert_eq "BUDGET" "15" "${BUDGET:-}"
}

test_parse_explicit_flags() {
  echo "goal-parse: explicit flags"
  cleanup_goal_state
  run_parse '"all tests pass" --test "npm test" --budget 30'
  assert_eq "parse explicit flags exit" "0" "$PARSE_EXIT"
  assert_eq "CONDITION" "all tests pass" "${CONDITION:-}"
  assert_eq "TEST_CMD" "npm test" "${TEST_CMD:-}"
  assert_eq "BUDGET" "30" "${BUDGET:-}"
}

test_parse_subcommands() {
  echo "goal-parse: subcommands"
  cleanup_goal_state

  run_parse "status"
  assert_eq "subcommand status exit" "0" "$PARSE_EXIT"
  assert_eq "SUBCOMMAND status" "status" "${SUBCOMMAND:-}"
  assert_contains "GOAL_CMD status" "goal-manage.sh status" "$PARSE_OUTPUT"

  run_parse "pause"
  assert_eq "SUBCOMMAND pause" "pause" "${SUBCOMMAND:-}"
  assert_contains "GOAL_CMD pause" "goal-manage.sh pause" "$PARSE_OUTPUT"

  run_parse "resume"
  assert_eq "SUBCOMMAND resume" "resume" "${SUBCOMMAND:-}"
  assert_contains "GOAL_CMD resume" "goal-manage.sh resume" "$PARSE_OUTPUT"

  run_parse "clear"
  assert_eq "SUBCOMMAND clear" "clear" "${SUBCOMMAND:-}"
  assert_contains "GOAL_CMD clear" "goal-manage.sh clear" "$PARSE_OUTPUT"

  run_parse "stop"
  assert_eq "SUBCOMMAND stop" "stop" "${SUBCOMMAND:-}"
  assert_contains "GOAL_CMD stop maps to clear" "goal-manage.sh clear" "$PARSE_OUTPUT"
}

test_parse_empty_input() {
  echo "goal-parse: empty input"
  cleanup_goal_state
  assert_exit "empty input errors" 1 "$SCRIPT_DIR/goal-parse.sh" ""
}

# ---------------------------------------------------------------------------
# goal-eval.sh
# ---------------------------------------------------------------------------

create_test_goal() {
  cleanup_goal_state
  "$SCRIPT_DIR/goal-manage.sh" create "$1" >/dev/null
}

test_eval_prompt_active_goal() {
  echo "goal-eval: prompt with active goal"
  create_test_goal "all tests pass"
  assert_exit "prompt exits 0" 0 "$SCRIPT_DIR/goal-eval.sh" prompt
  assert_contains "prompt contains condition" "Goal condition: all tests pass" "$REPLY"
}

test_eval_prompt_work_summary() {
  echo "goal-eval: prompt with work summary"
  create_test_goal "fix the login bug"
  assert_exit "prompt with work summary exits 0" 0 \
    "$SCRIPT_DIR/goal-eval.sh" prompt --work-summary "did X"
  assert_contains "prompt contains work summary" "did X" "$REPLY"
}

test_eval_signal() {
  echo "goal-eval: signal"
  create_test_goal "test condition"
  assert_exit "signal exits 0" 0 "$SCRIPT_DIR/goal-eval.sh" signal
  assert_file_exists "signal creates goal-eval-done" "${DATA_DIR}/goal-eval-done"
}

test_eval_check_after_signal() {
  echo "goal-eval: check after signal"
  create_test_goal "test condition"
  "$SCRIPT_DIR/goal-eval.sh" signal >/dev/null
  assert_exit "check after signal exits 0" 0 "$SCRIPT_DIR/goal-eval.sh" check
}

test_eval_check_without_signal() {
  echo "goal-eval: check without signal"
  create_test_goal "test condition"
  assert_exit "check without signal exits 1" 1 "$SCRIPT_DIR/goal-eval.sh" check
}

test_eval_parse_result_yes() {
  echo "goal-eval: parse-result YES"
  create_test_goal "test condition"
  assert_exit "parse-result YES exits 0" 0 \
    "$SCRIPT_DIR/goal-eval.sh" parse-result "YES: all done"
  assert_contains "VERDICT YES" "VERDICT=YES" "$REPLY"
}

test_eval_parse_result_no() {
  echo "goal-eval: parse-result NO"
  create_test_goal "test condition"
  assert_exit "parse-result NO exits 1" 1 \
    "$SCRIPT_DIR/goal-eval.sh" parse-result "NO: 2 tests failing"
  assert_contains "VERDICT NO" "VERDICT=NO" "$REPLY"
}

test_eval_parse_result_empty() {
  echo "goal-eval: parse-result empty input"
  create_test_goal "test condition"
  assert_exit "parse-result empty errors" 1 \
    "$SCRIPT_DIR/goal-eval.sh" parse-result ""
}

test_eval_prompt_no_goal() {
  echo "goal-eval: prompt without active goal"
  cleanup_goal_state
  assert_exit "prompt without goal errors" 1 "$SCRIPT_DIR/goal-eval.sh" prompt
}

# ---------------------------------------------------------------------------
# goal-manage.sh
# ---------------------------------------------------------------------------

test_manage_create() {
  echo "goal-manage: create"
  cleanup_goal_state
  assert_exit "create exits 0" 0 "$SCRIPT_DIR/goal-manage.sh" create "test condition"
  assert_file_exists "goal.json created" "${DATA_DIR}/goal.json"
  assert_eq "condition field" "test condition" "$(jq -r '.condition' "${DATA_DIR}/goal.json")"
  assert_eq "status field" "pursuing" "$(jq -r '.status' "${DATA_DIR}/goal.json")"
  assert_eq "turn_budget default" "20" "$(jq -r '.turn_budget' "${DATA_DIR}/goal.json")"
  assert_eq "active field" "true" "$(jq -r '.active' "${DATA_DIR}/goal.json")"
}

test_manage_create_empty() {
  echo "goal-manage: create empty condition"
  cleanup_goal_state
  assert_exit "create empty condition errors" 1 "$SCRIPT_DIR/goal-manage.sh" create ""
}

test_manage_status() {
  echo "goal-manage: status with active goal"
  create_test_goal "test condition"
  assert_exit "status exits 0" 0 "$SCRIPT_DIR/goal-manage.sh" status
  assert_contains "status shows condition" "Condition: test condition" "$REPLY"
  assert_contains "status shows pursuing" "Status: pursuing" "$REPLY"
}

test_manage_done_without_signal() {
  echo "goal-manage: done without evaluator signal"
  create_test_goal "test condition"
  assert_exit "done without signal exits 1" 1 "$SCRIPT_DIR/goal-manage.sh" done
  assert_contains "done rejected message" "REJECTED" "$REPLY"
}

test_manage_done_with_signal() {
  echo "goal-manage: done with evaluator signal"
  create_test_goal "test condition"
  "$SCRIPT_DIR/goal-manage.sh" pause >/dev/null
  "$SCRIPT_DIR/goal-manage.sh" resume >/dev/null
  "$SCRIPT_DIR/goal-eval.sh" signal >/dev/null
  assert_exit "done with signal exits 0" 0 "$SCRIPT_DIR/goal-manage.sh" done
  assert_eq "status achieved" "achieved" "$(jq -r '.status' "${DATA_DIR}/goal.json")"
  assert_eq "active false" "false" "$(jq -r '.active' "${DATA_DIR}/goal.json")"
}

test_manage_done_force() {
  echo "goal-manage: done --force without signal"
  create_test_goal "test condition"
  assert_exit "done --force exits 0" 0 "$SCRIPT_DIR/goal-manage.sh" done --force
  assert_eq "force status achieved" "achieved" "$(jq -r '.status' "${DATA_DIR}/goal.json")"
}

test_manage_pause() {
  echo "goal-manage: pause"
  create_test_goal "test condition"
  assert_exit "pause exits 0" 0 "$SCRIPT_DIR/goal-manage.sh" pause
  assert_eq "status paused" "paused" "$(jq -r '.status' "${DATA_DIR}/goal.json")"
}

test_manage_resume() {
  echo "goal-manage: resume"
  create_test_goal "test condition"
  "$SCRIPT_DIR/goal-manage.sh" pause >/dev/null
  assert_exit "resume exits 0" 0 "$SCRIPT_DIR/goal-manage.sh" resume
  assert_eq "status pursuing after resume" "pursuing" "$(jq -r '.status' "${DATA_DIR}/goal.json")"
}

test_manage_clear() {
  echo "goal-manage: clear"
  create_test_goal "test condition"
  assert_exit "clear exits 0" 0 "$SCRIPT_DIR/goal-manage.sh" clear
  assert_file_missing "goal.json removed" "${DATA_DIR}/goal.json"
}

# ---------------------------------------------------------------------------
# Run all tests
# ---------------------------------------------------------------------------

echo "=== /goal harness unit tests ==="
echo "HOME=$HOME"
echo ""

test_parse_simple_condition
test_parse_validation_hint
test_parse_budget_hint
test_parse_full_combination
test_parse_explicit_flags
test_parse_subcommands
test_parse_empty_input

test_eval_prompt_active_goal
test_eval_prompt_work_summary
test_eval_signal
test_eval_check_after_signal
test_eval_check_without_signal
test_eval_parse_result_yes
test_eval_parse_result_no
test_eval_parse_result_empty
test_eval_prompt_no_goal

test_manage_create
test_manage_create_empty
test_manage_status
test_manage_done_without_signal
test_manage_done_with_signal
test_manage_done_force
test_manage_pause
test_manage_resume
test_manage_clear

echo ""
echo "Results: $PASS passed, $FAIL failed, $TOTAL total"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
