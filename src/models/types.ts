export type GoalCategory = 'Saúde' | 'Trabalho' | 'Pessoal' | 'Finanças' | 'Aprendizado'
export type TaskPriority = 'Alta' | 'Média' | 'Baixa'
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'weekdays' | 'custom_days' | 'monthly_day'
export type AccentColor = 'default' | 'blue' | 'green' | 'purple' | 'orange'

export interface Goal {
  id: string; title: string; emoji: string; category: GoalCategory
  targetDate?: string; createdAt: string; isArchived: boolean
}
export interface SubTask { id: string; title: string; isCompleted: boolean }
export interface DailyTask {
  id: string; goalId: string; title: string; isCompleted: boolean; date: string
  completedAt?: string; priority?: TaskPriority; recurrence?: TaskRecurrence
  recurrenceDays?: number[]; note?: string; subtasks?: SubTask[]
}
export interface DailySummary {
  date: string; totalTasks: number; completedTasks: number; completionPercentage: number
}
export interface DailyReflection { date: string; stars: number; note?: string }
export interface Badge { id: string; title: string; description: string; emoji: string }

export interface UserSettings {
  name: string; accentColor: AccentColor; onboardingDone: boolean
  notificationHour?: number; notificationMinute?: number
  quoteCategory?: 'motivacional' | 'stoic' | 'productivity' | 'all'
}

export const ACCENT_COLORS: Record<AccentColor, { ink: string; label: string }> = {
  default: { ink: '#1A1A1A', label: 'Preto' },
  blue:    { ink: '#2563EB', label: 'Azul' },
  green:   { ink: '#16A34A', label: 'Verde' },
  purple:  { ink: '#7C3AED', label: 'Roxo' },
  orange:  { ink: '#EA580C', label: 'Laranja' },
}
export const CATEGORY_META: Record<GoalCategory, { color: string; bg: string; icon: string }> = {
  'Saúde':      { color: '#4CAF50', bg: '#4CAF5020', icon: '🏃' },
  'Trabalho':   { color: '#2196F3', bg: '#2196F320', icon: '💼' },
  'Pessoal':    { color: '#FF9800', bg: '#FF980020', icon: '👤' },
  'Finanças':   { color: '#9C27B0', bg: '#9C27B020', icon: '💰' },
  'Aprendizado':{ color: '#F44336', bg: '#F4433620', icon: '📚' },
}

export const ALL_BADGES: Badge[] = [
  { id: 'first_task',    emoji: '⭐', title: 'Primeiro passo',    description: 'Complete sua primeira tarefa' },
  { id: 'streak_3',     emoji: '🔥', title: '3 dias seguidos',   description: 'Sequência de 3 dias consecutivos' },
  { id: 'streak_7',     emoji: '🚀', title: 'Uma semana!',       description: 'Sequência de 7 dias consecutivos' },
  { id: 'streak_30',    emoji: '💎', title: 'Mês completo',      description: 'Incrível sequência de 30 dias' },
  { id: 'perfect_day',  emoji: '🎯', title: 'Dia perfeito',      description: '100% das tarefas concluídas' },
  { id: 'goal_5',       emoji: '🏆', title: 'Multi-meta',        description: 'Crie 5 metas diferentes' },
  { id: 'early_bird',   emoji: '🌅', title: 'Madrugador',        description: 'Complete uma tarefa antes das 8h' },
  { id: 'night_owl',    emoji: '🦉', title: 'Coruja',            description: 'Complete uma tarefa após as 22h' },
  { id: 'notes_10',     emoji: '📝', title: 'Escritor',          description: 'Escreva 10 notas' },
  { id: 'reflection_7', emoji: '🧘', title: 'Reflexivo',         description: 'Reflita por 7 dias seguidos' },
]

export const DAILY_QUOTES: Record<string, { text: string; author: string }[]> = {
  motivacional: [
    { text: 'Pequenas ações repetidas mudam tudo.', author: 'DailyFlow' },
    { text: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.', author: 'Robert Collier' },
    { text: 'Disciplina é a ponte entre metas e conquistas.', author: 'Jim Rohn' },
    { text: 'Não espere pela motivação. Comece e ela vem no caminho.', author: 'Unknown' },
    { text: 'Um dia de cada vez. Um passo de cada vez.', author: 'DailyFlow' },
  ],
  stoic: [
    { text: 'Você tem poder sobre sua mente, não sobre os eventos externos.', author: 'Marco Aurélio' },
    { text: 'Não é o que acontece com você, mas como você reage que importa.', author: 'Epicteto' },
    { text: 'O obstáculo no caminho se torna o caminho.', author: 'Marco Aurélio' },
    { text: 'Não desperdice tua vida em pensamentos sobre os outros.', author: 'Marco Aurélio' },
    { text: 'Faça bem o que está em tuas mãos. O resto não te pertence.', author: 'Epicteto' },
  ],
  productivity: [
    { text: 'Foco não é dizer sim ao que importa, mas não a tudo mais.', author: 'Steve Jobs' },
    { text: 'Se tudo é prioridade, nada é prioridade.', author: 'Unknown' },
    { text: 'Uma hora de planejamento economiza 10 horas de execução.', author: 'Dale Carnegie' },
    { text: 'Feito é melhor que perfeito.', author: 'Sheryl Sandberg' },
    { text: 'Boas manhãs criam bons dias. Bons dias criam boa vida.', author: 'DailyFlow' },
  ],
}

export function toDateKey(date: Date): string { return date.toISOString().slice(0, 10) }
export function formatDateLabel(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}
