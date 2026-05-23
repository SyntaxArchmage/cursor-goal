# Sample Transcripts

Place agent session transcripts here for automated pattern verification.

## Naming Convention

Files should be named `<workload-id>.txt`, e.g.:
- `12-goal-with-test.txt`
- `16-goal-natural-migration.txt`

## Generating Samples

1. Run a workload prompt in Cursor agent
2. Export/copy the session transcript
3. Save here with the matching workload ID filename

## Running Checks

```bash
cd testing && ./run-tests.sh
```
