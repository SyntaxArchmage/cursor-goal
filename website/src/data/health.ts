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

export const workloads: Workload[] = [
  {
    id: '12',
    name: 'Goal with Validation Command',
    status: 'untested',
    features: ['F11', 'F12', 'F13', 'F13a', 'F13b'],
    lastRun: '—',
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
    status: 'untested',
    features: ['F11', 'F12', 'F13b'],
    lastRun: '—',
  },
  {
    id: '15',
    name: 'Pause/Resume Lifecycle',
    status: 'untested',
    features: ['F11', 'F14', 'F15', 'F17'],
    lastRun: '—',
  },
  {
    id: '16',
    name: 'Natural Language Migration',
    status: 'untested',
    features: ['F11', 'F12', 'F13b', 'F15'],
    lastRun: '—',
  },
  {
    id: '17',
    name: 'Lint Cleanup',
    status: 'untested',
    features: ['F11', 'F12', 'F13b', 'F15'],
    lastRun: '—',
  },
  {
    id: '18',
    name: 'Add Test Coverage',
    status: 'untested',
    features: ['F11', 'F12', 'F13a', 'F13b', 'F15'],
    lastRun: '—',
  },
  {
    id: '19',
    name: 'File Splitting Refactor',
    status: 'untested',
    features: ['F11', 'F12', 'F13b', 'F15'],
    lastRun: '—',
  },
  {
    id: '20',
    name: 'Documentation Generation',
    status: 'untested',
    features: ['F11', 'F12', 'F13b', 'F15'],
    lastRun: '—',
  },
  {
    id: '21',
    name: 'Fix CI (Multi-Step)',
    status: 'untested',
    features: ['F11', 'F12', 'F13', 'F13a', 'F13b'],
    lastRun: '—',
  },
  {
    id: '22',
    name: 'Issue Backlog Drain',
    status: 'untested',
    features: ['F11', 'F12', 'F13b', 'F15'],
    lastRun: '—',
  },
  {
    id: '23',
    name: 'Multiple Evaluation Cycles',
    status: 'untested',
    features: ['F11', 'F12', 'F13', 'F16', 'F17'],
    lastRun: '—',
  },
  {
    id: '24',
    name: 'Vague Goal Interpretation',
    status: 'untested',
    features: ['F11', 'F12', 'F15'],
    lastRun: '—',
  },
]

export const features: Feature[] = [
  { id: 'F11', name: 'Goal state initialization', workloadCount: 13, totalWorkloads: 13 },
  { id: 'F12', name: 'In-turn subagent evaluation', workloadCount: 12, totalWorkloads: 13 },
  { id: 'F13', name: 'Stop hook auto-continuation', workloadCount: 4, totalWorkloads: 13 },
  { id: 'F13a', name: 'Validation command execution', workloadCount: 3, totalWorkloads: 13 },
  { id: 'F13b', name: 'Goal completion marking', workloadCount: 9, totalWorkloads: 13 },
  { id: 'F14', name: 'Pause/resume lifecycle', workloadCount: 1, totalWorkloads: 13 },
  { id: 'F15', name: 'Natural language parsing', workloadCount: 8, totalWorkloads: 13 },
  { id: 'F16', name: 'Multi-cycle evaluation', workloadCount: 1, totalWorkloads: 13 },
  { id: 'F17', name: 'Budget inline parsing', workloadCount: 2, totalWorkloads: 13 },
  { id: 'F18', name: 'Goal clear/cancel', workloadCount: 0, totalWorkloads: 13 },
  { id: 'F-NOT', name: 'No checkpoint during goal (inverse)', workloadCount: 13, totalWorkloads: 13 },
]

export const systemComponents: SystemComponent[] = [
  { name: 'goal-manage.sh', path: '~/.cursor/skills/goal/goal-manage.sh', status: 'unknown' },
  { name: 'goal-stop.sh', path: '~/.cursor/skills/goal/goal-stop.sh', status: 'unknown' },
  { name: 'hooks.json', path: '~/.cursor/hooks.json', status: 'unknown' },
  { name: 'goal.md (agent)', path: '~/.cursor/agents/goal.md', status: 'unknown' },
  { name: 'jq dependency', path: 'system PATH', status: 'unknown' },
]

export const stats = {
  totalWorkloads: 13,
  totalFeatures: 11,
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
