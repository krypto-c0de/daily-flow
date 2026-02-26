export type GoalCategory = 'Saúde' | 'Trabalho' | 'Pessoal' | 'Finanças' | 'Aprendizado'
export type TaskPriority  = 'alta' | 'media' | 'baixa'

export interface Goal {
  id: string
  title: string
  emoji: string
  category: GoalCategory
  targetDate?: string
  createdAt: string
  isArchived: boolean
}

export interface DailyTask {
  id: string
  goalId: string
  title: string
  isCompleted: boolean
  date: string           // YYYY-MM-DD
  completedAt?: string
  priority: TaskPriority
  notes?: string
  recurrent: boolean     // auto-spawns every day
}

export interface DailySummary {
  date: string
  totalTasks: number
  completedTasks: number
  completionPercentage: number
}

export const CATEGORY_META: Record<GoalCategory, { color: string; bg: string; icon: string }> = {
  'Saúde':       { color: '#4CAF50', bg: '#4CAF5020', icon: '🏃' },
  'Trabalho':    { color: '#2196F3', bg: '#2196F320', icon: '💼' },
  'Pessoal':     { color: '#FF9800', bg: '#FF980020', icon: '👤' },
  'Finanças':    { color: '#9C27B0', bg: '#9C27B020', icon: '💰' },
  'Aprendizado': { color: '#F44336', bg: '#F4433620', icon: '📚' },
}

export const PRIORITY_META: Record<TaskPriority, { label: string; color: string; dot: string }> = {
  alta:  { label: 'Alta',  color: '#EF4444', dot: '🔴' },
  media: { label: 'Média', color: '#F59E0B', dot: '🟡' },
  baixa: { label: 'Baixa', color: '#22C55E', dot: '🟢' },
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function formatDateLabel(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export const MOTIVATIONAL: Record<string, string> = {}
export function getMotivationalPhrase(pct: number, remaining: number): string {
  if (pct === 100) return '🎉 Dia perfeito! Você arrasou!'
  if (pct === 0 && remaining > 0) return `✨ Você tem ${remaining} tarefa${remaining > 1 ? 's' : ''} te esperando. Bora!`
  if (pct >= 75) return `🔥 Falta${remaining > 1 ? 'm' : ''} só ${remaining}! Não para agora.`
  if (pct >= 50) return `💪 Metade feita! Continue assim.`
  if (pct >= 25) return `🌱 Bom começo! Mais ${remaining} pela frente.`
  return `⏳ ${remaining} tarefa${remaining > 1 ? 's' : ''} pendente${remaining > 1 ? 's' : ''}. Você consegue!`
}
