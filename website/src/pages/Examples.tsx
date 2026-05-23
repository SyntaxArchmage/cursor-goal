import { motion } from 'framer-motion'
import PageLayout from '../components/PageLayout'
import { CodeBlock } from '../components/CodeBlock'
import { fadeUp, pageEnter } from '../lib/animations'

type Example = {
  prompt: string
  agentDoes: string[]
  timeline: string
  turns: string
  features: string[]
}

const examples: Example[] = [
  {
    prompt: 'all tests in test/auth pass and the lint step is clean',
    agentDoes: [
      'Creates goal with natural language condition',
      'Runs auth test suite and lint command',
      'Fixes failing tests and lint violations iteratively',
      'Subagent evaluates after each phase — NO until both pass',
      'Marks goal achieved when subagent returns YES',
    ],
    timeline: '5–12 turns',
    turns: '7 avg',
    features: ['F11', 'F12', 'F13a', 'F13b'],
  },
  {
    prompt: 'migrate every API call to v2 until the build succeeds, stop after 20 turns',
    agentDoes: [
      'Parses inline budget ("stop after 20 turns") from natural language',
      'Identifies all legacy API call sites across the codebase',
      'Migrates each call site to v2 API incrementally',
      'Runs build after each batch to verify progress',
      'Subagent confirms migration completeness before marking done',
    ],
    timeline: '10–20 turns',
    turns: '15 avg',
    features: ['F11', 'F12', 'F15', 'F17'],
  },
  {
    prompt: 'every exported function has JSDoc documentation',
    agentDoes: [
      'Scans source files for exported functions without JSDoc',
      'Adds documentation to each function systematically',
      'Subagent evaluates documentation coverage from context',
      'Continues until all exports are documented',
    ],
    timeline: '3–8 turns',
    turns: '5 avg',
    features: ['F11', 'F12', 'F13b', 'F15'],
  },
  {
    prompt: 'split monolith.py into focused modules until each is under 100 lines',
    agentDoes: [
      'Reads monolith and identifies distinct responsibilities',
      'Creates separate module files by concern',
      'Moves classes and utilities to appropriate modules',
      'Verifies each resulting file is under the line limit',
      'Subagent evaluates split completeness',
    ],
    timeline: '4–10 turns',
    turns: '6 avg',
    features: ['F11', 'F12', 'F13b', 'F15'],
  },
  {
    prompt: 'resolve all TODO comments in the codebase',
    agentDoes: [
      'Catalogs all TODO comments across files',
      'Implements each TODO one by one (validation, error handling, etc.)',
      'Removes or resolves TODO markers as work completes',
      'Subagent confirms backlog is fully drained',
    ],
    timeline: '6–15 turns',
    turns: '10 avg',
    features: ['F11', 'F12', 'F13b', 'F15'],
  },
  {
    prompt: 'fix the failing CI, verified by npm test',
    agentDoes: [
      'Runs npm test to see current failures',
      'Diagnoses root causes across multiple test files',
      'Fixes broken assertions and missing implementations',
      'Re-runs full suite until all tests pass',
      'Subagent confirms CI health before marking done',
    ],
    timeline: '5–12 turns',
    turns: '8 avg',
    features: ['F11', 'F12', 'F13', 'F13a', 'F13b'],
  },
  {
    prompt: 'drain the P1 issue backlog until the queue is empty',
    agentDoes: [
      'Identifies all P1 issues from backlog or TODO markers',
      'Works through issues in priority order',
      'Implements fixes and verifies each resolution',
      'Subagent evaluates queue emptiness after each batch',
      'Marks goal achieved when backlog is clear',
    ],
    timeline: '8–20 turns',
    turns: '12 avg',
    features: ['F11', 'F12', 'F13b', 'F15'],
  },
]

function ExampleCard({ example, index }: { example: Example; index: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={index % 3}
      className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[var(--color-accent)] transition-colors"
    >
      <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="text-xs text-[var(--color-muted)] mb-2 uppercase tracking-wide">Prompt</div>
        <CodeBlock title="Cursor Agent Chat">{`/goal ${example.prompt}`}</CodeBlock>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <div className="text-xs text-[var(--color-muted)] mb-2 uppercase tracking-wide">
            What the agent does
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-300">
            {example.agentDoes.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm">
            <span className="text-[var(--color-muted)]">Timeline: </span>
            <span className="text-white">{example.timeline}</span>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm">
            <span className="text-[var(--color-muted)]">Expected turns: </span>
            <span className="text-[var(--color-emerald)]">{example.turns}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {example.features.map((f) => (
            <span
              key={f}
              className="text-xs font-[var(--font-mono)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-2 py-0.5 text-[var(--color-accent-light)]"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Examples() {
  return (
    <PageLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageEnter}
        className="max-w-5xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="text-gradient">Examples</span>
        </h1>
        <p className="text-[var(--color-muted)] mb-12 text-lg max-w-2xl">
          Real-world natural language goals. Just describe what &ldquo;done&rdquo; looks like —
          cursor-goal handles the rest.
        </p>

        <div className="grid gap-8">
          {examples.map((example, i) => (
            <ExampleCard key={i} example={example} index={i} />
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mt-16 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Lifecycle Commands</h2>
          <CodeBlock title="Cursor Agent Chat">{`/goal status    # Check current goal state
/goal pause     # Pause auto-continuation
/goal resume    # Resume from where you left off
/goal clear     # Remove goal entirely`}</CodeBlock>
        </motion.div>
      </motion.div>
    </PageLayout>
  )
}
