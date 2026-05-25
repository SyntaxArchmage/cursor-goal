export type WorkloadStatus = 'pass' | 'fail' | 'partial' | 'untested'

export type Workload = {
  id: string
  name: string
  status: WorkloadStatus
  features: string[]
  lastRun: string
}

export type Feature = {
  id: string
  name: string
  workloadCount: number
  totalWorkloads: number
}

export type SystemComponent = {
  name: string
  path: string
  status: 'installed' | 'not_installed' | 'unknown'
}

export type PlatformHealth = {
  name: string
  agentDef: string
  tested: boolean
  lastTested: string
}

export type PlatformWorkloadEntry = {
  platform: string
  workloadId: string
  status: WorkloadStatus
  sample: string
  featuresDetected: string[]
}

export const workloads: Workload[] = [
  {
    id: '12',
    name: 'Goal with Validation Command',
    status: 'partial',
    features: ['F11', 'F12', 'F13', 'F13a', 'F13b', 'F19', 'F20', 'F21', 'F22', 'F23'],
    lastRun: '2026-05-25',
  },
  {
    id: '13',
    name: 'Goal Budget Exhaustion',
    status: 'untested',
    features: ['F11', 'F13'],
    lastRun: '—',
  },
  {
    id: '14',
    name: 'Goal Without Validation',
    status: 'partial',
    features: ['F11', 'F12', 'F13b', 'F19', 'F20', 'F21', 'F22', 'F23'],
    lastRun: '2026-05-25',
  },
  {
    id: '15',
    name: 'Pause/Resume Lifecycle',
    status: 'untested',
    features: ['F11', 'F14', 'F15', 'F17', 'F23'],
    lastRun: '—',
  },
  {
    id: '16',
    name: 'Natural Language Migration',
    status: 'untested',
    features: ['F11', 'F12', 'F13b', 'F15', 'F19', 'F20', 'F22', 'F23'],
    lastRun: '—',
  },
  {
    id: '17',
    name: 'Lint Cleanup',
    status: 'untested',
    features: ['F11', 'F12', 'F13b', 'F15', 'F19', 'F20', 'F22', 'F23'],
    lastRun: '—',
  },
  {
    id: '18',
    name: 'Add Test Coverage',
    status: 'untested',
    features: ['F11', 'F12', 'F13a', 'F13b', 'F15', 'F19', 'F20', 'F22', 'F23'],
    lastRun: '—',
  },
  {
    id: '19',
    name: 'File Splitting Refactor',
    status: 'untested',
    features: ['F11', 'F12', 'F13b', 'F15', 'F19', 'F20', 'F22', 'F23'],
    lastRun: '—',
  },
  {
    id: '20',
    name: 'Documentation Generation',
    status: 'partial',
    features: ['F11', 'F12', 'F13b', 'F15', 'F19', 'F20', 'F22', 'F23'],
    lastRun: '2026-05-25',
  },
  {
    id: '21',
    name: 'Fix CI (Multi-Step)',
    status: 'untested',
    features: ['F11', 'F12', 'F13', 'F13a', 'F13b', 'F19', 'F20', 'F21', 'F22', 'F23'],
    lastRun: '—',
  },
  {
    id: '22',
    name: 'Issue Backlog Drain',
    status: 'untested',
    features: ['F11', 'F12', 'F13b', 'F15', 'F19', 'F20', 'F22', 'F23'],
    lastRun: '—',
  },
  {
    id: '23',
    name: 'Multiple Evaluation Cycles',
    status: 'untested',
    features: ['F11', 'F12', 'F13', 'F16', 'F17', 'F19', 'F20'],
    lastRun: '—',
  },
  {
    id: '24',
    name: 'Vague Goal Interpretation',
    status: 'partial',
    features: ['F11', 'F12', 'F15', 'F19', 'F20'],
    lastRun: '2026-05-25',
  },
]

export const features: Feature[] = [
  { id: 'F11', name: 'Goal state initialization', workloadCount: 4, totalWorkloads: 13 },
  { id: 'F12', name: 'In-turn subagent evaluation', workloadCount: 4, totalWorkloads: 13 },
  { id: 'F13', name: 'Stop hook auto-continuation', workloadCount: 1, totalWorkloads: 13 },
  { id: 'F13a', name: 'Validation command execution', workloadCount: 1, totalWorkloads: 13 },
  { id: 'F13b', name: 'Goal completion marking', workloadCount: 4, totalWorkloads: 13 },
  { id: 'F14', name: 'Pause/resume lifecycle', workloadCount: 0, totalWorkloads: 13 },
  { id: 'F15', name: 'Natural language parsing', workloadCount: 0, totalWorkloads: 13 },
  { id: 'F16', name: 'Multi-cycle evaluation', workloadCount: 0, totalWorkloads: 13 },
  { id: 'F17', name: 'Budget inline parsing', workloadCount: 0, totalWorkloads: 13 },
  { id: 'F18', name: 'Goal clear/cancel', workloadCount: 0, totalWorkloads: 13 },
  { id: 'F19', name: 'Correct evaluator subagent_type', workloadCount: 0, totalWorkloads: 13 },
  { id: 'F20', name: 'Evaluator runs readonly', workloadCount: 3, totalWorkloads: 13 },
  { id: 'F21', name: 'Evaluator prompt contains condition', workloadCount: 3, totalWorkloads: 13 },
  { id: 'F22', name: 'No self-assessment', workloadCount: 2, totalWorkloads: 13 },
  { id: 'F23', name: 'Goal has non-empty condition', workloadCount: 3, totalWorkloads: 13 },
  { id: 'F24', name: 'Done follows evaluator', workloadCount: 0, totalWorkloads: 13 },
]

export const systemComponents: SystemComponent[] = [
  { name: 'goalKeeper.md', path: '~/.cursor/agents/goalKeeper.md', status: 'unknown' },
  { name: 'goal-manage.sh', path: '~/.cursor/skills/goal/goal-manage.sh', status: 'unknown' },
  { name: 'goal-eval.sh', path: '~/.cursor/skills/goal/goal-eval.sh', status: 'unknown' },
  { name: 'goal-parse.sh', path: '~/.cursor/skills/goal/goal-parse.sh', status: 'unknown' },
  { name: 'goal-stop.sh', path: '~/.cursor/skills/goal/goal-stop.sh', status: 'unknown' },
  { name: 'SKILL.md', path: '~/.cursor/skills/goal/SKILL.md', status: 'unknown' },
  { name: 'hooks.json', path: '~/.cursor/hooks.json', status: 'unknown' },
  { name: 'jq', path: 'system PATH', status: 'unknown' },
]

export const platformHealth: PlatformHealth[] = [
  { name: 'Cursor IDE', agentDef: '.cursor/agents/goalKeeper.md', tested: true, lastTested: '2026-05-25' },
  { name: 'Cursor CLI', agentDef: '.cursor/agents/goalKeeper.md', tested: false, lastTested: '—' },
  { name: 'Claude Code', agentDef: '.claude/agents/goalKeeper.md', tested: false, lastTested: '—' },
  { name: 'Copilot IDE', agentDef: '.github/agents/goal-evaluator.md', tested: false, lastTested: '—' },
  { name: 'OpenCode', agentDef: 'opencode.json', tested: false, lastTested: '—' },
]

export const platformWorkloadMatrix: PlatformWorkloadEntry[] = [
  // Cursor IDE — 6 samples analyzed across 4 workloads
  {
    platform: 'Cursor IDE',
    workloadId: '12',
    status: 'partial',
    sample: 'goal-video-production-full.jsonl',
    featuresDetected: ['F11', 'F12', 'F13', 'F13a', 'F13b', 'F20', 'F21', 'F23'],
  },
  {
    platform: 'Cursor IDE',
    workloadId: '14',
    status: 'partial',
    sample: 'goal-en-subtitle-fix.jsonl',
    featuresDetected: ['F11', 'F12', 'F13b', 'F20', 'F21', 'F22', 'F23'],
  },
  {
    platform: 'Cursor IDE',
    workloadId: '14',
    status: 'partial',
    sample: 'goal-website-cards.jsonl',
    featuresDetected: ['F11', 'F12', 'F13b', 'F20', 'F21', 'F22', 'F23'],
  },
  {
    platform: 'Cursor IDE',
    workloadId: '14',
    status: 'partial',
    sample: 'goal-en-subtitle-fix.txt',
    featuresDetected: ['F11', 'F12', 'F13b'],
  },
  {
    platform: 'Cursor IDE',
    workloadId: '20',
    status: 'partial',
    sample: 'goal-video-production.txt',
    featuresDetected: ['F11', 'F12', 'F13b'],
  },
  {
    platform: 'Cursor IDE',
    workloadId: '24',
    status: 'partial',
    sample: 'goal-website-figures.txt',
    featuresDetected: ['F11', 'F12', 'F13b'],
  },
]

export const stats = {
  totalWorkloads: 13,
  totalFeatures: 16,
  testScripts: 8,
  avgFeaturesPerWorkload: 4.0,
}

export function statusColor(status: WorkloadStatus): string {
  switch (status) {
    case 'pass':
      return 'bg-[var(--color-emerald)]'
    case 'fail':
      return 'bg-red-500'
    case 'partial':
      return 'bg-yellow-500'
    case 'untested':
      return 'bg-gray-500'
  }
}

export function statusLabel(status: WorkloadStatus): string {
  switch (status) {
    case 'pass':
      return 'Pass'
    case 'fail':
      return 'Fail'
    case 'partial':
      return 'Partial'
    case 'untested':
      return 'Untested'
  }
}

export function componentStatusColor(status: SystemComponent['status']): string {
  switch (status) {
    case 'installed':
      return 'text-[var(--color-emerald)]'
    case 'not_installed':
      return 'text-red-400'
    case 'unknown':
      return 'text-[var(--color-muted)]'
  }
}

export function componentStatusLabel(status: SystemComponent['status']): string {
  switch (status) {
    case 'installed':
      return 'Installed'
    case 'not_installed':
      return 'Not installed'
    case 'unknown':
      return 'Check locally'
  }
}
