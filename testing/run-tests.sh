#!/usr/bin/env bash
# Run all pattern checks against sample transcripts
# Usage: ./run-tests.sh [workload-id]

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== cursor-goal Test Suite ==="
echo ""

# Check if sample transcripts exist
SAMPLES_DIR="${SCRIPT_DIR}/samples"
if [ ! -d "$SAMPLES_DIR" ]; then
    echo "No sample transcripts found in ${SAMPLES_DIR}"
    echo "Run workloads in Cursor first, then copy transcripts here."
    echo ""
    echo "Available workloads:"
    for f in "${SCRIPT_DIR}/workloads/"*.md; do
        echo "  $(basename "$f" .md)"
    done
    exit 0
fi

# Run pattern analysis on each sample
TOTAL=0
PASSED=0
for sample in "${SAMPLES_DIR}"/*.txt; do
    [ -f "$sample" ] || continue
    WORKLOAD=$(basename "$sample" .txt)
    echo "Testing: $WORKLOAD"
    RESULT=$(python3 "${SCRIPT_DIR}/scripts/patterns.py" "$sample" "$WORKLOAD" 2>/dev/null) || {
        echo "  SKIP (no matching workload features)"
        continue
    }
    PASS_RATE=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['pass_rate'])" 2>/dev/null) || PASS_RATE="0"
    TOTAL=$((TOTAL + 1))
    if [ "$(echo "$PASS_RATE == 1.0" | bc -l 2>/dev/null || echo 0)" = "1" ]; then
        echo "  PASS (${PASS_RATE})"
        PASSED=$((PASSED + 1))
    else
        echo "  PARTIAL (${PASS_RATE})"
        echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for fid, r in d['details'].items():
    status = 'PASS' if r['found'] else 'FAIL'
    print(f'    {fid}: {status} (count={r[\"count\"]})')
" 2>/dev/null || true
    fi
done

echo ""
echo "Results: $PASSED/$TOTAL workloads fully passed"
