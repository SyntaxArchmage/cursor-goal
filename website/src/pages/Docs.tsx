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
          How to install and use <code className="text-[var(--color-accent-light)]">/goal</code>.
        </p>

        <Section title="Quick Start">
          <CodeBlock title="Install">{`# Tell your agent:
Install the /goal skill from https://github.com/SyntaxArchmage/cursor-goal`}</CodeBlock>
          <div className="mt-6">
            <CodeBlock title="Use it">{`/goal all tests pass and lint is clean`}</CodeBlock>
          </div>
        </Section>

        <Section title="Commands">
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

        <Section title="Writing Conditions">
          <p className="text-gray-300 mb-6">
            Describe a verifiable end state — something you can check, not a vague intent.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
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
        </Section>

        <Section title="Configuration">
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
                  <td className="p-3">Maximum turns before the agent wraps up</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Platform Support">
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <thead className="bg-[var(--color-surface)]">
                <tr>
                  <th className="text-left p-3 text-[var(--color-muted)]">Platform</th>
                  <th className="text-left p-3 text-[var(--color-muted)]">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3">Cursor IDE</td>
                  <td className="p-3 text-[var(--color-emerald)]">Tested</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3">Cursor CLI</td>
                  <td className="p-3 text-[var(--color-muted)]">Untested</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3">Claude Code</td>
                  <td className="p-3 text-[var(--color-muted)]">Untested</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3">Copilot IDE</td>
                  <td className="p-3 text-[var(--color-muted)]">Untested</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="p-3">OpenCode</td>
                  <td className="p-3 text-[var(--color-muted)]">Untested</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

      </motion.div>
    </PageLayout>
  )
}
