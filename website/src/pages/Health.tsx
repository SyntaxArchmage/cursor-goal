import { motion } from 'framer-motion'
import PageLayout from '../components/PageLayout'
import { fadeUp, pageEnter } from '../lib/animations'
import {
  workloads,
  features,
  systemComponents,
  stats,
  statusColor,
  statusLabel,
  componentStatusColor,
  componentStatusLabel,
} from '../data/health'

function StatusDot({ status }: { status: 'pass' | 'fail' | 'partial' | 'untested' }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${statusColor(status)}`}
      title={statusLabel(status)}
    />
  )
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5">
      <div className={`text-3xl font-bold mb-1 ${accent ?? 'text-white'}`}>{value}</div>
      <div className="text-sm text-[var(--color-muted)]">{label}</div>
    </div>
  )
}

function CoverageBar({ count, total }: { count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  const barColor =
    pct >= 75 ? 'bg-[var(--color-emerald)]' : pct >= 40 ? 'bg-yellow-500' : pct > 0 ? 'bg-orange-500' : 'bg-gray-600'

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[var(--color-muted)] w-16 text-right font-[var(--font-mono)]">
        {count}/{total}
      </span>
    </div>
  )
}

export default function Health() {
  const passCount = workloads.filter((w) => w.status === 'pass').length
  const failCount = workloads.filter((w) => w.status === 'fail').length
  const untestedCount = workloads.filter((w) => w.status === 'untested').length

  return (
    <PageLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageEnter}
        className="max-w-6xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
              <span className="text-gradient">Health Status</span>
            </h1>
            <p className="text-[var(--color-muted)]">
              Test matrix, feature coverage, and system component status for cursor-goal.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <StatusDot status="pass" /> Pass ({passCount})
            </span>
            <span className="flex items-center gap-2">
              <StatusDot status="fail" /> Fail ({failCount})
            </span>
            <span className="flex items-center gap-2">
              <StatusDot status="untested" /> Untested ({untestedCount})
            </span>
          </div>
        </div>

        {/* Statistics */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          <StatCard label="Total workloads" value={stats.totalWorkloads} accent="text-[var(--color-accent-light)]" />
          <StatCard label="Features tracked" value={stats.totalFeatures} accent="text-[var(--color-emerald)]" />
          <StatCard label="Test scripts" value={stats.testScripts} />
          <StatCard
            label="Avg features / workload"
            value={stats.avgFeaturesPerWorkload.toFixed(1)}
          />
        </motion.div>

        {/* Test Matrix */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-gradient">Test Matrix</span>
          </h2>
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full text-sm bg-[var(--color-card)]">
              <thead className="bg-[var(--color-surface)]">
                <tr>
                  <th className="text-left p-3 text-[var(--color-muted)] font-medium w-8" />
                  <th className="text-left p-3 text-[var(--color-muted)] font-medium">Workload</th>
                  <th className="text-left p-3 text-[var(--color-muted)] font-medium">Status</th>
                  <th className="text-left p-3 text-[var(--color-muted)] font-medium hidden md:table-cell">
                    Features
                  </th>
                  <th className="text-left p-3 text-[var(--color-muted)] font-medium hidden sm:table-cell">
                    Last Run
                  </th>
                </tr>
              </thead>
              <tbody>
                {workloads.map((w) => (
                  <tr
                    key={w.id}
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface)]/50 transition-colors"
                  >
                    <td className="p-3">
                      <StatusDot status={w.status} />
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-200">
                        <span className="text-[var(--color-muted)] font-[var(--font-mono)] text-xs mr-2">
                          {w.id}
                        </span>
                        {w.name}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5 md:hidden">
                        {w.features.map((f) => (
                          <span
                            key={f}
                            className="text-[10px] font-[var(--font-mono)] bg-[var(--color-surface)] rounded px-1.5 py-0.5 text-[var(--color-accent-light)]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                          w.status === 'pass'
                            ? 'bg-emerald-500/10 text-[var(--color-emerald)]'
                            : w.status === 'fail'
                              ? 'bg-red-500/10 text-red-400'
                              : w.status === 'partial'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-gray-500/10 text-[var(--color-muted)]'
                        }`}
                      >
                        <StatusDot status={w.status} />
                        {statusLabel(w.status)}
                      </span>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {w.features.map((f) => (
                          <span
                            key={f}
                            className="text-xs font-[var(--font-mono)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-1.5 py-0.5 text-[var(--color-accent-light)]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-[var(--color-muted)] font-[var(--font-mono)] text-xs hidden sm:table-cell">
                      {w.lastRun}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          {/* Feature Coverage */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-2xl font-bold mb-4">
              <span className="text-gradient">Feature Coverage</span>
            </h2>
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl divide-y divide-[var(--color-border)]">
              {features.map((f) => (
                <div key={f.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-[var(--font-mono)] text-[var(--color-accent-light)] text-sm mr-2">
                        {f.id}
                      </span>
                      <span className="text-sm text-gray-300">{f.name}</span>
                    </div>
                  </div>
                  <CoverageBar count={f.workloadCount} total={f.totalWorkloads} />
                </div>
              ))}
            </div>
          </motion.section>

          {/* System Health */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            <h2 className="text-2xl font-bold mb-4">
              <span className="text-gradient">System Health</span>
            </h2>
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl divide-y divide-[var(--color-border)]">
              {systemComponents.map((c) => (
                <div key={c.name} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-gray-200">{c.name}</div>
                    <div className="text-xs text-[var(--color-muted)] font-[var(--font-mono)] mt-0.5">
                      {c.path}
                    </div>
                  </div>
                  <div className={`text-sm font-medium flex items-center gap-2 ${componentStatusColor(c.status)}`}>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        c.status === 'installed'
                          ? 'bg-[var(--color-emerald)]'
                          : c.status === 'not_installed'
                            ? 'bg-red-500'
                            : 'bg-gray-500'
                      }`}
                    />
                    {componentStatusLabel(c.status)}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-3">
              Component status is checked locally at install time. Run{' '}
              <code className="text-[var(--color-accent-light)]">install-goal.sh</code> to configure.
            </p>
          </motion.section>
        </div>

        {/* Legend */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-sm text-[var(--color-muted)]"
        >
          <span className="text-gray-300 font-medium mr-4">Status legend:</span>
          <span className="inline-flex items-center gap-1.5 mr-4">
            <StatusDot status="pass" /> Pass — all expected features detected
          </span>
          <span className="inline-flex items-center gap-1.5 mr-4">
            <StatusDot status="fail" /> Fail — feature check failed
          </span>
          <span className="inline-flex items-center gap-1.5 mr-4">
            <StatusDot status="partial" /> Partial — some features passed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <StatusDot status="untested" /> Untested — no transcript analyzed yet
          </span>
        </motion.div>
      </motion.div>
    </PageLayout>
  )
}
