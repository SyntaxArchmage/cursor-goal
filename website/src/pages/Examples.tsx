import { motion } from 'framer-motion'
import PageLayout from '../components/PageLayout'
import { CodeBlock } from '../components/CodeBlock'
import { fadeUp, pageEnter } from '../lib/animations'

type Example = {
  prompt: string
  description: string
}

const examples: Example[] = [
  {
    prompt: 'all tests in test/auth pass and the lint step is clean',
    description:
      'The agent turns your goal into a checklist, runs the auth test suite and linter, and fixes whatever fails. It keeps going until both checks pass — no need to babysit each fix.',
  },
  {
    prompt: 'migrate every API call to v2 until the build succeeds, stop after 20 turns',
    description:
      'The agent finds every legacy API call, migrates them to v2 in batches, and rebuilds after each batch. It stops when the build succeeds or hits your 20-turn budget.',
  },
  {
    prompt: 'every exported function has JSDoc documentation',
    description:
      'The agent scans for exported functions missing docs and adds JSDoc to each one. It continues until every export is documented.',
  },
  {
    prompt: 'split monolith.py into focused modules until each is under 100 lines',
    description:
      'The agent breaks monolith.py into focused modules by responsibility, moving code until each file stays under 100 lines. It keeps splitting until the size constraint is met.',
  },
  {
    prompt: 'fix the failing CI, verified by npm test',
    description:
      'The agent runs npm test, diagnoses failures, and applies fixes. It re-runs the suite until everything passes.',
  },
  {
    prompt: 'drain the P1 issue backlog until the queue is empty',
    description:
      'The agent works through P1 issues in priority order, fixing and verifying each one. It stops when the backlog is empty.',
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
        <p className="text-sm text-gray-300 leading-relaxed">{example.description}</p>
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
          Describe what &ldquo;done&rdquo; looks like. cursor-goal handles the rest.
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
