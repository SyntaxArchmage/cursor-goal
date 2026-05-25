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


export default function Health() {
  const testedWorkloads = workloads.filter((w) => w.status !== 'untested').length
  const totalWorkloads = workloads.length
  const passCount = workloads.filter((w) => w.status === 'pass').length
  const partialCount = workloads.filter((w) => w.status === 'partial').length
  const failCount = workloads.filter((w) => w.status === 'fail').length
  const verifiedPlatforms = platformHealth.filter((p) => p.tested).length
  const totalPlatforms = platformHealth.length
  const coveredFeatures = features.filter((f) => f.workloadCount > 0)

  const overallColor = failCount > 0 ? '#ef4444' : partialCount > 0 ? '#eab308' : passCount > 0 ? '#10b981' : '#6b7280'
  const overallLabel = failCount > 0 ? 'Issues Found' : partialCount > 0 ? 'Early Stage' : passCount > 0 ? 'Passing' : 'No Data'
  const overallTextColor = failCount > 0 ? 'text-red-400' : partialCount > 0 ? 'text-yellow-400' : passCount > 0 ? 'text-[var(--color-emerald)]' : 'text-[var(--color-muted)]'

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
            Platform, workload, and feature coverage at a glance.
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
            <StatusRing color={overallColor} size={64} strokeWidth={5}>
              <span className="text-lg">{failCount > 0 ? '✕' : passCount > 0 && partialCount === 0 && failCount === 0 ? '✓' : '⚠'}</span>
            </StatusRing>
            <div>
              <div className={`text-xl font-bold ${overallTextColor}`}>{overallLabel}</div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5">
                {passCount} pass · {partialCount} partial{failCount > 0 ? ` · ${failCount} fail` : ''}
              </div>
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

        {/* Workload × Platform Matrix */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-gradient">Support Matrix</span>
          </h2>
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full text-sm bg-[var(--color-card)]">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="sticky left-0 z-10 bg-[var(--color-surface)] text-left text-xs font-medium text-[var(--color-muted)] px-4 py-3 min-w-[14rem]">
                    Workload
                  </th>
                  <th className="text-left text-xs font-medium text-[var(--color-muted)] px-3 py-3">
                    Features
                  </th>
                  {platformHealth.map((p) => (
                    <th
                      key={p.name}
                      className="px-3 py-3 text-center text-xs font-medium text-[var(--color-muted)] whitespace-nowrap"
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workloads.map((w) => {
                  const featureNames = w.features.map((fid) => {
                    const f = features.find((feat) => feat.id === fid)
                    return f ? f.name : fid
                  })
                  return (
                    <tr
                      key={w.id}
                      className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface)]/30 transition-colors"
                    >
                      <td className="sticky left-0 z-10 bg-[var(--color-card)] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-[var(--font-mono)] bg-[var(--color-surface)] text-[var(--color-accent-light)] px-1.5 py-0.5 rounded shrink-0">
                            #{w.id}
                          </span>
                          <span className="text-sm text-gray-200">{w.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {featureNames.map((name, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-[var(--color-surface)] text-[var(--color-muted)] px-1.5 py-0.5 rounded leading-tight"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </td>
                      {platformHealth.map((p) => {
                        const status = matrixLookup.get(`${p.name}:${w.id}`) ?? 'untested'
                        return (
                          <td key={p.name} className="px-3 py-3 text-center">
                            <StatusDot status={status} />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
            <StatusDot status="pass" /> Pass — all features detected
          </span>
          <span className="inline-flex items-center gap-1.5 mr-4">
            <StatusDot status="fail" /> Fail — check failed
          </span>
          <span className="inline-flex items-center gap-1.5 mr-4">
            <StatusDot status="partial" /> Partial — some passed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <StatusDot status="untested" /> Untested — no data yet
          </span>
        </motion.div>
      </motion.div>
    </PageLayout>
  )
}
