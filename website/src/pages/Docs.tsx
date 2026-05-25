import { motion } from 'framer-motion'
import PageLayout from '../components/PageLayout'
import { CodeBlock } from '../components/CodeBlock'
import { fadeUp, pageEnter } from '../lib/animations'

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={0}
      className="mb-16"
    >
      <h2 className="text-2xl font-bold mb-6">
        <span className="text-gradient">{title}</span>
      </h2>
      {children}
    </motion.section>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
      {children}
    </div>
  )
}

export default function Docs() {
  return (
    <PageLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageEnter}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="text-gradient">Documentation</span>
        </h1>
        <p className="text-[var(--color-muted)] mb-12 text-lg">
          Reference for the <code className="text-[var(--color-accent-light)]">/goal</code> command.
        </p>

        <Section title="Harness Scripts">
          <p className="text-gray-300 mb-6 leading-relaxed">
            Rules are programs, not prose. The agent calls these via Shell.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <thead className="bg-[var(--color-surface)]">
                <tr>
                  <th className="text-left p-3 text-[var(--color-muted)]">Script</th>
                  <th className="text-left p-3 text-[var(--color-muted)]">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3 font-[var(--font-mono)] text-[var(--color-accent-light)]">goal-parse.sh</td>
                  <td className="p-3">Extracts condition, validation command, and turn budget from natural language input</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3 font-[var(--font-mono)] text-[var(--color-accent-light)]">goal-manage.sh</td>
                  <td className="p-3">State lifecycle (create, status, pause, resume, clear, done). <code>done</code> rejects (exit 1) if no evaluator signal exists</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3 font-[var(--font-mono)] text-[var(--color-accent-light)]">goal-eval.sh</td>
                  <td className="p-3">Evaluator harness — generates evaluator prompt, parses YES/NO results, manages goal-eval-done signal</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3 font-[var(--font-mono)] text-[var(--color-accent-light)]">goal-stop.sh</td>
                  <td className="p-3">Stop hook — auto-continues between turns when goal is still active, enforces turn budget</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="How It Works">
          <p className="text-gray-300 mb-6 leading-relaxed">
            In-turn subagent evaluation + between-turn stop hook safety net.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold mb-3 text-[var(--color-accent-light)]">
                Layer 1: In-Turn Evaluation
              </h3>
              <p className="text-[var(--color-muted)] text-sm mb-4">
                After each work phase, the agent spawns a readonly subagent to judge whether the
                completion condition is met. YES → mark done. NO → continue in the same turn.
              </p>
              <CodeBlock title="Evaluation cycle">{`Work → run validation (if --test)
  ↓
goal-eval.sh prompt → generates evaluator prompt
Agent spawns readonly evaluator subagent
  ↓
goal-eval.sh parse-result
  YES: goal-eval.sh signal → goal-manage.sh done
  NO:  <reason> → keep working`}</CodeBlock>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold mb-3 text-[var(--color-emerald)]">
                Layer 2: Stop Hook Safety Net
              </h3>
              <p className="text-[var(--color-muted)] text-sm mb-4">
                When a turn ends with the goal still pursuing, <code>goal-stop.sh</code> returns a
                followup_message that auto-continues the agent. Also increments turn counter and
                enforces budget limits.
              </p>
              <CodeBlock title="goal-stop.sh">{`Turn ends → read goal.json
  ↓
Still pursuing?
  YES → followup_message: "[GOAL] Turn 3/20..."
  NO  → {} (allow stop)`}</CodeBlock>
            </Card>
          </div>
        </Section>

        <Section title="Command Reference">
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <thead className="bg-[var(--color-surface)]">
                <tr>
                  <th className="text-left p-3 text-[var(--color-muted)]">Command</th>
                  <th className="text-left p-3 text-[var(--color-muted)]">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3 font-[var(--font-mono)] text-[var(--color-accent-light)]">
                    /goal &lt;condition&gt;
                  </td>
                  <td className="p-3">Set goal and immediately start working toward it</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3 font-[var(--font-mono)] text-[var(--color-accent-light)]">
                    /goal status
                  </td>
                  <td className="p-3">Show current goal state (condition, turns, status)</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3 font-[var(--font-mono)] text-[var(--color-accent-light)]">
                    /goal pause
                  </td>
                  <td className="p-3">Pause auto-continuation; state is preserved</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3 font-[var(--font-mono)] text-[var(--color-accent-light)]">
                    /goal resume
                  </td>
                  <td className="p-3">Resume a paused goal from where it left off</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3 font-[var(--font-mono)] text-[var(--color-accent-light)]">
                    /goal clear
                  </td>
                  <td className="p-3">Remove goal entirely (aliases: stop, off, reset, cancel)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <CodeBlock title="Explicit flags">{`/goal "all tests pass" --test "npm test" --budget 20
/goal migrate API to v2 --budget 15`}</CodeBlock>
          </div>
        </Section>

        <Section title="Writing Good Conditions">
          <p className="text-gray-300 mb-4 leading-relaxed">
            Describe a verifiable end state.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <h3 className="text-[var(--color-emerald)] font-semibold mb-3">Good examples</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex gap-2">
                  <span className="text-[var(--color-emerald)]">✓</span>
                  all tests in test/auth pass and the lint step is clean
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-emerald)]">✓</span>
                  every call site of the old API has been migrated and the build succeeds
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-emerald)]">✓</span>
                  no ESLint errors in src/, stop after 15 turns
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-emerald)]">✓</span>
                  split utils.ts into focused modules until each is under 200 lines
                </li>
              </ul>
            </Card>
            <Card>
              <h3 className="text-red-400 font-semibold mb-3">Avoid</h3>
              <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                <li className="flex gap-2">
                  <span className="text-red-400">✗</span>
                  the code is clean
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">✗</span>
                  implement the feature
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">✗</span>
                  fix the bug
                </li>
              </ul>
            </Card>
          </div>
          <p className="text-[var(--color-muted)] text-sm mb-4">
            Embed commands and budgets inline:
          </p>
          <CodeBlock title="Inline parsing">{`/goal all tests pass, verified by npm test, stop after 20 turns
/goal drain the P1 issue backlog until the queue is empty`}</CodeBlock>
        </Section>

        <Section title="Configuration Options">
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <thead className="bg-[var(--color-surface)]">
                <tr>
                  <th className="text-left p-3 text-[var(--color-muted)]">Option</th>
                  <th className="text-left p-3 text-[var(--color-muted)]">Default</th>
                  <th className="text-left p-3 text-[var(--color-muted)]">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3 font-[var(--font-mono)]">--test</td>
                  <td className="p-3 text-[var(--color-muted)]">none</td>
                  <td className="p-3">Shell command for deterministic pass/fail (exit 0 = pass)</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3 font-[var(--font-mono)]">--budget</td>
                  <td className="p-3 text-[var(--color-muted)]">20</td>
                  <td className="p-3">Maximum turns before budget-limited wrap-up</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[var(--color-muted)] text-sm mt-4">
            <code className="text-[var(--color-accent-light)]">goal-parse.sh</code> extracts{' '}
            <code>--test</code> and <code>--budget</code> from natural language when flags are omitted
            (e.g. &ldquo;verified by npm test&rdquo;, &ldquo;stop after 10 turns&rdquo;).
          </p>
          <p className="text-[var(--color-muted)] text-sm mt-4">
            State is stored at <code className="text-[var(--color-accent-light)]">~/.durable-request/data/goal.json</code>.
            Install scripts copy hooks to <code className="text-[var(--color-accent-light)]">~/.cursor/skills/goal/</code>.
          </p>
        </Section>

        <Section title="State File Format">
          <p className="text-[var(--color-muted)] mb-4 text-sm">
            The goal state file (<code>goal.json</code>) schema:
          </p>
          <CodeBlock title="goal.json">{`{
  "active": true,
  "condition": "all tests pass",
  "validation_command": "npm test",
  "created_at": "2026-05-22T19:00:00Z",
  "turn_budget": 20,
  "turns_used": 3,
  "status": "pursuing",
  "last_reason": "2 tests still failing in auth module",
  "last_validation_output": "Tests: 2 failed, 48 passed, 50 total"
}`}</CodeBlock>
          <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              { status: 'pursuing', desc: 'Actively working toward condition' },
              { status: 'paused', desc: 'Auto-continuation disabled' },
              { status: 'achieved', desc: 'Condition met, goal complete' },
              { status: 'budget-limited', desc: 'Turn budget exhausted' },
            ].map(({ status, desc }) => (
              <div
                key={status}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3"
              >
                <div className="font-[var(--font-mono)] text-[var(--color-accent-light)] mb-1">
                  {status}
                </div>
                <div className="text-[var(--color-muted)] text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Stop Hook Behavior">
          <p className="text-gray-300 mb-4 leading-relaxed">
            Fires when a turn ends. Reads <code>goal.json</code> and decides:
          </p>
          <ul className="space-y-3 text-gray-300 mb-6">
            <li className="flex gap-3">
              <span className="text-[var(--color-accent-light)]">→</span>
              Increments <code>turns_used</code> and checks against <code>turn_budget</code>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--color-accent-light)]">→</span>
              Runs validation command (if configured) for quick pass/fail feedback
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--color-accent-light)]">→</span>
              Returns <code>followup_message</code> with <code>[GOAL]</code> prefix when still pursuing
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--color-accent-light)]">→</span>
              Sets <code>status: "budget-limited"</code> and sends wrap-up message when budget is hit
            </li>
          </ul>
          <CodeBlock title="Followup message formats">{`[GOAL] Turn 3/20 (17 remaining). Continue working toward: all tests pass

[GOAL] Turn 5/20. Validation FAILED (exit 1): Tests: 2 failed.
       Continue working toward: all tests pass

[GOAL BUDGET] Turn limit (20) reached. Wrap up current work and
              summarize progress toward: all tests pass`}</CodeBlock>
        </Section>

        <Section title="Turn Budget Mechanics">
          <p className="text-gray-300 mb-4 leading-relaxed">
            When the budget is exhausted:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-6">
            <li>Stop hook sets <code>status: "budget-limited"</code> and <code>active: false</code></li>
            <li>Agent receives a final <code>[GOAL BUDGET]</code> followup message</li>
            <li>Agent summarizes progress, lists remaining work, and stops cleanly</li>
          </ol>
          <p className="text-[var(--color-muted)] text-sm">
            Budget can be set via <code>--budget N</code> flag or inline: &ldquo;stop after 10 turns&rdquo;.
            Default is 20 turns.
          </p>
        </Section>

        <Section title="Platform Support">
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <thead className="bg-[var(--color-surface)]">
                <tr>
                  <th className="text-left p-3 text-[var(--color-muted)]">Platform</th>
                  <th className="text-left p-3 text-[var(--color-muted)]">Status</th>
                  <th className="text-left p-3 text-[var(--color-muted)]">Agent Definition</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3">Cursor IDE</td>
                  <td className="p-3 text-[var(--color-emerald)]">Tested</td>
                  <td className="p-3 font-[var(--font-mono)] text-xs">.cursor/agents/goalKeeper.md</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3">Cursor CLI</td>
                  <td className="p-3 text-[var(--color-muted)]">Untested</td>
                  <td className="p-3 font-[var(--font-mono)] text-xs">.cursor/agents/goalKeeper.md</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3">Claude Code</td>
                  <td className="p-3 text-[var(--color-muted)]">Untested</td>
                  <td className="p-3 font-[var(--font-mono)] text-xs">.claude/agents/goalKeeper.md</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3">Copilot IDE</td>
                  <td className="p-3 text-[var(--color-muted)]">Untested</td>
                  <td className="p-3 font-[var(--font-mono)] text-xs">.github/agents/goal-evaluator.md</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3">OpenCode</td>
                  <td className="p-3 text-[var(--color-muted)]">Untested</td>
                  <td className="p-3 font-[var(--font-mono)] text-xs">opencode.json (inline)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[var(--color-muted)] text-sm">
            Only Cursor IDE is end-to-end tested. Other platforms have agent definitions but are untested.
          </p>
        </Section>

        <Section title="Integration with durable-request">
          <Card>
            <p className="text-gray-300 leading-relaxed mb-4">
              cursor-goal is designed to compose with{' '}
              <a
                href="https://github.com/SyntaxArchmage/durable-request"
                className="text-[var(--color-accent-light)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                durable-request
              </a>
              . When both are installed:
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-2">
                <span className="text-[var(--color-emerald)]">✓</span>
                Goal state lives in the shared <code>~/.durable-request/data/</code> directory
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--color-emerald)]">✓</span>
                No checkpoints during active goal pursuit
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--color-emerald)]">✓</span>
                Goal completion can trigger <code>/deep-sleep</code> to keep the session alive
              </li>
            </ul>
            <p className="text-[var(--color-muted)] text-sm mt-4">
              cursor-goal also works standalone — no durable-request required.
            </p>
          </Card>
        </Section>
      </motion.div>
    </PageLayout>
  )
}
