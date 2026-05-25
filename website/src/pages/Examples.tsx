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
      'Runs auth tests and linter, fixes failures, and loops until both pass.',
  },
  {
    prompt: 'migrate every API call to v2 until the build succeeds, stop after 20 turns',
    description:
      'Finds legacy calls, migrates to v2 in batches, rebuilds after each. Stops on success or at budget.',
  },
  {
    prompt: 'every exported function has JSDoc documentation',
    description:
      'Scans exports, adds JSDoc. Continues until every function is documented.',
  },
  {
    prompt: 'split monolith.py into focused modules until each is under 100 lines',
    description:
      'Splits by responsibility. Keeps going until each file is under 100 lines.',
  },
  {
    prompt: 'fix the failing CI, verified by npm test',
    description:
      'Runs tests, diagnoses failures, fixes. Loops until green.',
  },
  {
    prompt: 'drain the P1 issue backlog until the queue is empty',
    description:
      'Works through P1s in order, fixing each. Stops when queue is empty.',
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
