import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Goal, DailyTask, DailySummary, GoalCategory, SubTask, TaskPriority, TaskRecurrence, UserSettings, AccentColor, toDateKey } from '../models/types'

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

interface Store {
  goals: Goal[]
  tasks: DailyTask[]
  initialized: boolean
  darkMode: boolean
  notificationsEnabled: boolean
  settings: UserSettings
  focusMode: boolean

  addGoal: (title: string, emoji: string, category: GoalCategory, targetDate?: string) => void
  editGoal: (id: string, patch: Partial<Pick<Goal, 'title' | 'emoji' | 'category' | 'targetDate'>>) => void
  deleteGoal: (id: string) => void
  archiveGoal: (id: string) => void
  unarchiveGoal: (id: string) => void

  addTask: (goalId: string, title: string, date?: string, priority?: TaskPriority, recurrence?: TaskRecurrence, note?: string) => void
  editTask: (id: string, patch: Partial<Pick<DailyTask, 'title' | 'priority' | 'note' | 'recurrence'>>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  reorderTasks: (dateKey: string, fromIndex: number, toIndex: number) => void
  tasksForDate: (dateKey: string) => DailyTask[]
  summaryForDate: (dateKey: string) => DailySummary

  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void

  seedRecurringTasks: (dateKey: string) => void

  toggleDarkMode: () => void
  toggleNotifications: () => void
  toggleFocusMode: () => void
  goalById: (id: string) => Goal | undefined
  updateSettings: (patch: Partial<UserSettings>) => void
}

const SAMPLE_GOALS: Goal[] = [
  { id: 'g1', title: 'Exercitar todos os dias', emoji: '🏃', category: 'Saúde', createdAt: new Date().toISOString(), isArchived: false, targetDate: new Date(Date.now() + 90 * 86400000).toISOString() },
  { id: 'g2', title: 'Ler 1 livro por mês', emoji: '📚', category: 'Aprendizado', createdAt: new Date().toISOString(), isArchived: false },
  { id: 'g3', title: 'Economizar R$500/mês', emoji: '💰', category: 'Finanças', createdAt: new Date().toISOString(), isArchived: false },
]

function makeSampleTasks(): DailyTask[] {
  const today = toDateKey(new Date())
  return [
    { id: 't1', goalId: 'g1', title: '30 min de corrida', isCompleted: false, date: today, priority: 'Alta', recurrence: 'daily' },
    { id: 't2', goalId: 'g1', title: 'Alongamento', isCompleted: false, date: today, priority: 'Média' },
    { id: 't3', goalId: 'g2', title: 'Ler 20 páginas', isCompleted: false, date: today, priority: 'Baixa', note: 'Capítulo 3 do livro atual' },
  ]
}

const DEFAULT_SETTINGS: UserSettings = {
  name: '',
  accentColor: 'default',
  onboardingDone: false,
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      goals: SAMPLE_GOALS,
      tasks: makeSampleTasks(),
      initialized: true,
      darkMode: false,
      notificationsEnabled: false,
      settings: DEFAULT_SETTINGS,
      focusMode: false,

      addGoal: (title, emoji, category, targetDate) => {
        const goal: Goal = { id: uuid(), title, emoji, category, targetDate, createdAt: new Date().toISOString(), isArchived: false }
        set(s => ({ goals: [...s.goals, goal] }))
      },

      editGoal: (id, patch) => set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, ...patch } : g) })),

      deleteGoal: (id) => set(s => ({
        goals: s.goals.filter(g => g.id !== id),
        tasks: s.tasks.filter(t => t.goalId !== id),
      })),

      archiveGoal: (id) => set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, isArchived: true } : g) })),
      unarchiveGoal: (id) => set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, isArchived: false } : g) })),

      addTask: (goalId, title, date, priority, recurrence, note) => {
        const task: DailyTask = {
          id: uuid(), goalId, title, isCompleted: false,
          date: date ?? toDateKey(new Date()),
          priority: priority ?? 'Média',
          recurrence: recurrence ?? 'none',
          note,
          subtasks: [],
        }
        set(s => ({ tasks: [...s.tasks, task] }))
      },

      editTask: (id, patch) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...patch } : t) })),

      toggleTask: (id) => set(s => ({
        tasks: s.tasks.map(t => t.id === id
          ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? new Date().toISOString() : undefined }
          : t)
      })),

      deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),

      reorderTasks: (dateKey, fromIndex, toIndex) => {
        const all = get().tasks
        const dated = all.filter(t => t.date === dateKey)
        const others = all.filter(t => t.date !== dateKey)
        const reordered = [...dated]
        const [moved] = reordered.splice(fromIndex, 1)
        reordered.splice(toIndex, 0, moved)
        set({ tasks: [...others, ...reordered] })
      },

      tasksForDate: (dateKey) => {
        const tasks = get().tasks.filter(t => t.date === dateKey)
        const priorityOrder: Record<string, number> = { Alta: 0, Média: 1, Baixa: 2 }
        return tasks.sort((a, b) => (priorityOrder[a.priority ?? 'Média'] ?? 1) - (priorityOrder[b.priority ?? 'Média'] ?? 1))
      },

      summaryForDate: (dateKey) => {
        const tasks = get().tasksForDate(dateKey)
        const completed = tasks.filter(t => t.isCompleted).length
        return {
          date: dateKey,
          totalTasks: tasks.length,
          completedTasks: completed,
          completionPercentage: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
        }
      },

      addSubtask: (taskId, title) => {
        const sub: SubTask = { id: uuid(), title, isCompleted: false }
        set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: [...(t.subtasks ?? []), sub] } : t) }))
      },

      toggleSubtask: (taskId, subtaskId) => {
        set(s => ({
          tasks: s.tasks.map(t => t.id === taskId
            ? { ...t, subtasks: (t.subtasks ?? []).map(st => st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st) }
            : t)
        }))
      },

      deleteSubtask: (taskId, subtaskId) => {
        set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: (t.subtasks ?? []).filter(st => st.id !== subtaskId) } : t) }))
      },

      seedRecurringTasks: (dateKey) => {
        const { tasks } = get()
        const alreadyHas = tasks.some(t => t.date === dateKey)
        if (alreadyHas) return
        const yesterday = new Date(dateKey + 'T00:00:00')
        yesterday.setDate(yesterday.getDate() - 1)
        const yKey = toDateKey(yesterday)
        const recurring = tasks.filter(t => t.date === yKey && t.recurrence === 'daily')
        if (recurring.length === 0) return
        const newTasks = recurring.map(t => ({
          ...t, id: uuid(), date: dateKey, isCompleted: false, completedAt: undefined,
        }))
        set(s => ({ tasks: [...s.tasks, ...newTasks] }))
      },

      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
      toggleNotifications: () => set(s => ({ notificationsEnabled: !s.notificationsEnabled })),
      toggleFocusMode: () => set(s => ({ focusMode: !s.focusMode })),
      goalById: (id) => get().goals.find(g => g.id === id),
      updateSettings: (patch) => set(s => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: 'dailyflow-storage-v3',
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<Store>
        return {
          ...current,
          goals: p.goals ?? (p.initialized ? [] : current.goals),
          tasks: p.tasks ?? (p.initialized ? [] : current.tasks),
          darkMode: p.darkMode ?? false,
          notificationsEnabled: p.notificationsEnabled ?? false,
          settings: p.settings ?? DEFAULT_SETTINGS,
          focusMode: false,
          initialized: true,
        }
      },
    }
  )
)
