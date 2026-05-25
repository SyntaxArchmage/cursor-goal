import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import PageLayout from '../components/PageLayout'
import { fadeUp, pageEnter } from '../lib/animations'
import {
  workloads,
  features,
  platformHealth,
  platformWorkloadMatrix,
  statusColor,
  statusLabel,
  type WorkloadStatus,
} from '../data/health'

function StatusDot({ status }: { status: WorkloadStatus }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${statusColor(status)}`}
      title={statusLabel(status)}
    />
  )
}

function ProgressRing({
  value,
  total,
  size = 72,
  strokeWidth = 6,
  color = 'var(--color-emerald)',
  trackColor = 'var(--color-surface)',
}: {
  value: number
  total: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
}) {
  const pct = total > 0 ? value / total : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  )
}

function StatusRing({
  color,
  size = 72,
  strokeWidth = 6,
  children,
}: {
  color: string
  size?: number
  strokeWidth?: number
  children: ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          opacity={0.9}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

function HeroStatCard({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5">
      <div className="text-sm text-[var(--color-muted)] mb-3">{label}</div>
      <div className="flex items-center gap-4">{children}</div>
    </div>
  )
}

function WorkloadCard({ id, name, status }: { id: string; name: string; status: WorkloadStatus }) {
  const badgeStyles: Record<WorkloadStatus, string> = {
    pass: 'bg-emerald-500/10 text-[var(--color-emerald)]',
    fail: 'bg-red-500/10 text-red-400',
    partial: 'bg-yellow-500/10 text-yellow-400',
    untested: 'bg-gray-500/10 text-[var(--color-muted)]',
  }

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3 hover:border-[var(--color-accent)]/40 transition-colors">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-[var(--font-mono)] bg-[var(--color-surface)] text-[var(--color-accent-light)] px-1.5 py-0.5 rounded">
          #{id}
        </span>
        <StatusDot status={status} />
      </div>
      <div className="text-sm text-gray-200 leading-snug mb-2 line-clamp-2">{name}</div>
      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeStyles[status]}`}>
        {statusLabel(status)}
      </span>
    </div>
  )
}

function CoverageBar({ count, total, variant = 'default' }: { count: number; total: number; variant?: 'default' | 'covered' }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  const barColor =
    variant === 'covered'
      ? 'bg-[var(--color-emerald)]'
      : pct >= 75
        ? 'bg-[var(--color-emerald)]'
        : pct >= 40
          ? 'bg-yellow-500'
          : pct > 0
            ? 'bg-orange-500'
            : 'bg-gray-600'

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

const STATUS_GROUP_ORDER: WorkloadStatus[] = ['partial', 'fail', 'pass', 'untested']

export default function Health() {
  const testedWorkloads = workloads.filter((w) => w.status !== 'untested').length
  const totalWorkloads = workloads.length
  const verifiedPlatforms = platformHealth.filter((p) => p.tested).length
  const totalPlatforms = platformHealth.length
  const coveredFeatures = features.filter((f) => f.workloadCount > 0)
  const uncoveredFeatures = features.filter((f) => f.workloadCount === 0)

  const workloadsByStatus = STATUS_GROUP_ORDER.reduce(
    (acc, status) => {
      const group = workloads.filter((w) => w.status === status)
      if (group.length > 0) acc.push({ status, items: group })
      return acc
    },
    [] as { status: WorkloadStatus; items: typeof workloads }[],
  )

  const matrixLookup = new Map(
    platformWorkloadMatrix.map((entry) => [`${entry.platform}:${entry.workloadId}`, entry.status]),
  )

  return (
    <PageLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageEnter}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
            <span className="text-gradient">Health Dashboard</span>
          </h1>
          <p className="text-[var(--color-muted)]">
            Platform support, workload testing, and feature coverage at a glance.
          </p>
        </div>

        {/* Hero Summary Row */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          <HeroStatCard label="Overall Status">
            <StatusRing color="#eab308" size={64} strokeWidth={5}>
              <span className="text-lg">⚠</span>
            </StatusRing>
            <div>
              <div className="text-xl font-bold text-yellow-400">Early Stage</div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5">0 pass · 3 partial</div>
            </div>
          </HeroStatCard>

          <HeroStatCard label="Workload Coverage">
            <div className="relative">
              <ProgressRing
                value={testedWorkloads}
                total={totalWorkloads}
                size={64}
                strokeWidth={5}
                color="var(--color-accent-light)"
              />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                {testedWorkloads}
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {testedWorkloads}/{totalWorkloads}
              </div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5">workloads tested</div>
            </div>
          </HeroStatCard>

          <HeroStatCard label="Platform Support">
            <div className="relative">
              <ProgressRing
                value={verifiedPlatforms}
                total={totalPlatforms}
                size={64}
                strokeWidth={5}
                color="var(--color-emerald)"
              />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                {verifiedPlatforms}
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {verifiedPlatforms}/{totalPlatforms}
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {platformHealth.map((p) => (
                  <span
                    key={p.name}
                    className={`w-2 h-2 rounded-full ${p.tested ? 'bg-[var(--color-emerald)]' : 'bg-gray-600'}`}
                    title={p.name}
                  />
                ))}
              </div>
            </div>
          </HeroStatCard>

          <HeroStatCard label="Feature Coverage">
            <div className="relative">
              <ProgressRing
                value={coveredFeatures.length}
                total={features.length}
                size={64}
                strokeWidth={5}
                color="var(--color-emerald)"
              />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                {coveredFeatures.length}
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {coveredFeatures.length}/{features.length}
              </div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5">features covered</div>
            </div>
          </HeroStatCard>
        </motion.div>

        {/* Platform Status */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-gradient">Platform Support</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {platformHealth.map((platform) => (
              <div
                key={platform.name}
                className={`bg-[var(--color-card)] border rounded-xl p-5 flex flex-col items-center text-center transition-colors ${
                  platform.tested
                    ? 'border-[var(--color-emerald)]/40'
                    : 'border-[var(--color-border)]'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    platform.tested
                      ? 'bg-emerald-500/15 text-[var(--color-emerald)]'
                      : 'bg-gray-500/10 text-[var(--color-muted)]'
                  }`}
                >
                  {platform.tested ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-gray-500" />
                  )}
                </div>
                <div className="font-semibold text-gray-200 mb-1">{platform.name}</div>
                <div className="text-[10px] text-[var(--color-muted)] font-[var(--font-mono)] mb-3 break-all leading-relaxed">
                  {platform.agentDef}
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    platform.tested
                      ? 'bg-emerald-500/10 text-[var(--color-emerald)]'
                      : 'bg-gray-500/10 text-[var(--color-muted)]'
                  }`}
                >
                  {platform.tested ? 'Verified' : 'Untested'}
                </span>
                {platform.tested && platform.lastTested !== '—' && (
                  <div className="text-[10px] text-[var(--color-muted)] mt-2 font-[var(--font-mono)]">
                    {platform.lastTested}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Platform × Workload Matrix */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-1">
            <span className="text-gradient">Platform × Workload Matrix</span>
          </h2>
          <p className="text-sm text-[var(--color-muted)] mb-4">
            Which workloads have been tested on each platform.
          </p>
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full min-w-max text-sm bg-[var(--color-card)]">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="sticky left-0 z-10 bg-[var(--color-card)] text-left text-xs font-medium text-[var(--color-muted)] px-3 py-2 min-w-[7rem]">
                    Platform
                  </th>
                  {workloads.map((w) => (
                    <th
                      key={w.id}
                      className="px-1 py-2 text-center text-[10px] font-[var(--font-mono)] text-[var(--color-muted)] font-normal whitespace-nowrap"
                      title={w.name}
                    >
                      <span className="inline-block -rotate-45 origin-center translate-y-1">
                        #{w.id}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {platformHealth.map((platform) => (
                  <tr
                    key={platform.name}
                    className="border-b border-[var(--color-border)] last:border-b-0"
                  >
                    <td className="sticky left-0 z-10 bg-[var(--color-card)] px-3 py-1.5 text-xs text-gray-300 whitespace-nowrap font-medium">
                      {platform.name}
                    </td>
                    {workloads.map((w) => {
                      const status = matrixLookup.get(`${platform.name}:${w.id}`) ?? 'untested'
                      return (
                        <td key={w.id} className="px-1 py-1.5 text-center">
                          <StatusDot status={status} />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Workload Status Grid */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-gradient">Workload Status</span>
          </h2>
          <div className="space-y-8">
            {workloadsByStatus.map(({ status, items }) => (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <StatusDot status={status} />
                  <span className="text-sm font-medium text-gray-300">
                    {statusLabel(status)}
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">({items.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {items.map((w) => (
                    <WorkloadCard key={w.id} id={w.id} name={w.name} status={w.status} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Feature Coverage */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-gradient">Feature Coverage</span>
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[var(--color-emerald)]" />
                <h3 className="text-sm font-semibold text-gray-300">
                  Covered ({coveredFeatures.length})
                </h3>
              </div>
              <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl divide-y divide-[var(--color-border)]">
                {coveredFeatures.map((f) => (
                  <div key={f.id} className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="font-[var(--font-mono)] text-[var(--color-accent-light)] text-sm shrink-0">
                        {f.id}
                      </span>
                      <span className="text-sm text-gray-300">{f.name}</span>
                    </div>
                    <CoverageBar count={f.workloadCount} total={f.totalWorkloads} variant="covered" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <h3 className="text-sm font-semibold text-gray-300">
                  Needs Coverage ({uncoveredFeatures.length})
                </h3>
              </div>
              <div className="bg-[var(--color-card)] border border-red-500/20 rounded-xl divide-y divide-[var(--color-border)]">
                {uncoveredFeatures.map((f) => (
                  <div key={f.id} className="p-4 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                      ✕
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-[var(--font-mono)] text-[var(--color-accent-light)] text-sm">
                          {f.id}
                        </span>
                        <span className="text-sm text-gray-300">{f.name}</span>
                      </div>
                      <div className="text-xs text-[var(--color-muted)] mt-1">No workloads exercise this feature</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

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
