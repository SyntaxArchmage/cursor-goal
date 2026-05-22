import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
}

function CodeBlock({ title, children }: { title: string; children: string }) {
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-dot code-dot-red" />
        <span className="code-dot code-dot-yellow" />
        <span className="code-dot code-dot-green" />
        <span className="ml-2 text-xs text-[var(--color-muted)]">{title}</span>
      </div>
      <pre className="p-4 text-sm leading-relaxed overflow-x-auto font-[var(--font-mono)] text-gray-300">
        {children}
      </pre>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <motion.div
      initial="hidden" whileInView="visible" viewport={{ once: true }}
      variants={fadeUp} custom={0}
      className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 hover:border-[var(--color-accent)] transition-colors"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-[var(--color-muted)] text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-grid">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="#" className="font-bold text-lg">🎯 cursor-goal</a>
          <div className="flex gap-4 text-sm text-[var(--color-muted)]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
            <a href="#install" className="hover:text-white transition-colors">Install</a>
            <a href="https://github.com/SyntaxArchmage/cursor-goal" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="text-7xl mb-6">🎯</div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="text-gradient">cursor-goal</span>
            </h1>
            <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
              Autonomous goal loop for Cursor IDE.
              Set a condition. Walk away. Come back to finished work.
            </p>
            <p className="text-[var(--color-muted)] mb-8 max-w-lg mx-auto">
              Equivalent to Claude Code's <code className="text-[var(--color-accent-light)]">/goal</code> — but for Cursor.
              First open-source implementation with subagent evaluation.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-2xl mx-auto">
            <CodeBlock title="Cursor Agent Chat">{`/goal "all tests pass" --test "npm test" --budget 20

[goal] Goal created:
  Condition: all tests pass
  Validation: npm test
  Budget: 20 turns
  Status: pursuing

# Agent works autonomously...
# Subagent evaluates after each phase...
# Stop hook auto-continues between turns...

[goal] ✓ Goal achieved in 7 turns: all tests pass`}</CodeBlock>
          </motion.div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-16 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-2xl font-bold mb-6 text-red-400">Without cursor-goal</h2>
            <ul className="space-y-3 text-[var(--color-muted)]">
              <li className="flex gap-3"><span className="text-red-400">✗</span> Agent stops after one turn — you re-prompt manually</li>
              <li className="flex gap-3"><span className="text-red-400">✗</span> No persistent objective — agent forgets the goal</li>
              <li className="flex gap-3"><span className="text-red-400">✗</span> No budget tracking — can't limit or monitor turns</li>
              <li className="flex gap-3"><span className="text-red-400">✗</span> Work halts mid-task without wrap-up</li>
            </ul>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-emerald)]">With cursor-goal</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex gap-3"><span className="text-[var(--color-emerald)]">✓</span> Persistent objective across turns</li>
              <li className="flex gap-3"><span className="text-[var(--color-emerald)]">✓</span> Auto-continuation via stop hook</li>
              <li className="flex gap-3"><span className="text-[var(--color-emerald)]">✓</span> Subagent evaluator — separate model judges completion</li>
              <li className="flex gap-3"><span className="text-[var(--color-emerald)]">✓</span> Turn budgets with automatic wrap-up</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient">Core Features</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon="🔄" title="Auto-Continuation" desc="Stop hook sends followup_message when the agent ends a turn with the goal still active. No manual re-prompting needed." />
            <FeatureCard icon="🧠" title="Subagent Evaluator" desc="A readonly subagent evaluates the goal condition — like Claude Code's Haiku evaluator, but using Cursor's Task tool." />
            <FeatureCard icon="⚡" title="Validation Commands" desc="Use --test to run shell commands for deterministic pass/fail. Test suites, builds, linters — exit code 0 means done." />
            <FeatureCard icon="📊" title="Turn Budgets" desc="Set --budget to cap turns. Agent gets budget-limited warnings and wraps up cleanly when exhausted." />
            <FeatureCard icon="⏸️" title="Pause & Resume" desc="Pause auto-continuation, do something else, resume when ready. Full lifecycle control." />
            <FeatureCard icon="🔗" title="durable-request Compatible" desc="When combined with durable-request, goal completion triggers /deep-sleep — keeping your session alive." />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient">Two-Layer Architecture</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-[var(--color-accent-light)]">Layer 1: In-Turn Evaluation</h3>
                <p className="text-[var(--color-muted)] text-sm mb-4">Agent spawns a readonly subagent to evaluate the goal condition within the same turn.</p>
                <CodeBlock title="Subagent evaluation">{`Agent works → thinks it might be done
  ↓
Task(readonly: true)
  "Is the goal achieved?"
  ↓
  YES: all tests passing → mark done
  NO: 3 tests failing   → continue working`}</CodeBlock>
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
              <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-[var(--color-emerald)]">Layer 2: Between-Turn Safety Net</h3>
                <p className="text-[var(--color-muted)] text-sm mb-4">Stop hook fires when the turn ends. If goal is still active, it auto-continues.</p>
                <CodeBlock title="goal-stop.sh">{`Turn ends → stop hook reads goal.json
  ↓
Goal still active?
  YES → { followup_message: "[GOAL] Turn 3/20.
          Continue toward: all tests pass" }
  NO  → {} (allow stop)`}</CodeBlock>
              </div>
            </motion.div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="mt-12">
            <h3 className="text-xl font-semibold text-center mb-6">vs Claude Code</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <thead className="bg-[var(--color-surface)]">
                  <tr>
                    <th className="text-left p-3 text-[var(--color-muted)]">Aspect</th>
                    <th className="text-left p-3 text-[var(--color-muted)]">Claude Code /goal</th>
                    <th className="text-left p-3 text-[var(--color-accent-light)]">cursor-goal</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-t border-[var(--color-border)]"><td className="p-3">Evaluator</td><td className="p-3">Haiku (prompt hook)</td><td className="p-3 text-[var(--color-emerald)]">Subagent (Task tool)</td></tr>
                  <tr className="border-t border-[var(--color-border)]"><td className="p-3">Eval timing</td><td className="p-3">Between turns only</td><td className="p-3 text-[var(--color-emerald)]">Within turn + between</td></tr>
                  <tr className="border-t border-[var(--color-border)]"><td className="p-3">Validation</td><td className="p-3">Transcript text</td><td className="p-3 text-[var(--color-emerald)]">Transcript + cmd output</td></tr>
                  <tr className="border-t border-[var(--color-border)]"><td className="p-3">Loop guard</td><td className="p-3">stop_hook_active</td><td className="p-3">loop_count + turn_budget</td></tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Install */}
      <section id="install" className="py-20 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            <span className="text-gradient">Get Started</span>
          </h2>
          <CodeBlock title="Terminal">{`git clone https://github.com/SyntaxArchmage/cursor-goal.git
cd cursor-goal && ./install-goal.sh`}</CodeBlock>
          <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
              <div className="text-[var(--color-accent-light)] font-semibold mb-1">Requirements</div>
              <div className="text-[var(--color-muted)]">Cursor IDE 1.7+, jq, bash 4+</div>
            </div>
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
              <div className="text-[var(--color-emerald)] font-semibold mb-1">Standalone</div>
              <div className="text-[var(--color-muted)]">Works with any Cursor project</div>
            </div>
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
              <div className="text-[var(--color-accent-light)] font-semibold mb-1">Composable</div>
              <div className="text-[var(--color-muted)]">Pairs with durable-request</div>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-4">Quick Usage</h3>
            <CodeBlock title="Cursor Agent Chat">{`# Set a goal with validation
/goal "all tests pass" --test "npm test"

# Set a goal with budget
/goal "refactor auth module" --budget 15

# Check status
/goal status

# Pause / Resume / Clear
/goal pause
/goal resume
/goal clear`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-[var(--color-muted)]">
          <div>🎯 cursor-goal — MIT License</div>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="https://github.com/SyntaxArchmage/cursor-goal" className="hover:text-white transition-colors">GitHub</a>
            <span>First open-source /goal for Cursor</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
