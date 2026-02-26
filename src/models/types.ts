export type GoalCategory = 'Saúde' | 'Trabalho' | 'Pessoal' | 'Finanças' | 'Aprendizado'

export interface Goal {
  id: string
  title: string
  emoji: string
  category: GoalCategory
  targetDate?: string   // ISO string
  createdAt: string
  isArchived: boolean
}

export interface DailyTask {
  id: string
  goalId: string
  title: string
  isCompleted: boolean
  date: string         // YYYY-MM-DD
  completedAt?: string
}

export interface DailySummary {
  date: string
  totalTasks: number
  completedTasks: number
  completionPercentage: number
}

export const CATEGORY_META: Record<GoalCategory, { color: string; bg: string; icon: string }> = {
  'Saúde':      { color: '#4CAF50', bg: '#4CAF5020', icon: '🏃' },
  'Trabalho':   { color: '#2196F3', bg: '#2196F320', icon: '💼' },
  'Pessoal':    { color: '#FF9800', bg: '#FF980020', icon: '👤' },
  'Finanças':   { color: '#9C27B0', bg: '#9C27B020', icon: '💰' },
  'Aprendizado':{ color: '#F44336', bg: '#F4433620', icon: '📚' },
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function formatDateLabel(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}
