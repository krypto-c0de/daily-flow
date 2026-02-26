import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Goal, DailyTask, DailySummary, GoalCategory, toDateKey } from '../models/types'

function uuid() { return crypto.randomUUID() }

interface Store {
  goals: Goal[]
  tasks: DailyTask[]
  initialized: boolean
  darkMode: boolean
  notificationsEnabled: boolean

  addGoal: (title: string, emoji: string, category: GoalCategory, targetDate?: string) => void
  editGoal: (id: string, patch: Partial<Pick<Goal, 'title' | 'emoji' | 'category' | 'targetDate'>>) => void
  deleteGoal: (id: string) => void

  addTask: (goalId: string, title: string, date?: string) => void
  editTask: (id: string, title: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  reorderTasks: (dateKey: string, fromIndex: number, toIndex: number) => void
  tasksForDate: (dateKey: string) => DailyTask[]
  summaryForDate: (dateKey: string) => DailySummary

  toggleDarkMode: () => void
  toggleNotifications: () => void
  goalById: (id: string) => Goal | undefined
}

const SAMPLE_GOALS: Goal[] = [
  { id: 'g1', title: 'Exercitar todos os dias', emoji: '🏃', category: 'Saúde', createdAt: new Date().toISOString(), isArchived: false, targetDate: new Date(Date.now() + 90 * 86400000).toISOString() },
  { id: 'g2', title: 'Ler 1 livro por mês', emoji: '📚', category: 'Aprendizado', createdAt: new Date().toISOString(), isArchived: false },
  { id: 'g3', title: 'Economizar R$500/mês', emoji: '💰', category: 'Finanças', createdAt: new Date().toISOString(), isArchived: false },
]

function makeSampleTasks(): DailyTask[] {
  const today = toDateKey(new Date())
  return [
    { id: 't1', goalId: 'g1', title: '30 min de corrida', isCompleted: false, date: today },
    { id: 't2', goalId: 'g1', title: 'Alongamento', isCompleted: false, date: today },
    { id: 't3', goalId: 'g2', title: 'Ler 20 páginas', isCompleted: false, date: today },
  ]
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      goals: SAMPLE_GOALS,
      tasks: makeSampleTasks(),
      initialized: true,
      darkMode: false,
      notificationsEnabled: false,

      addGoal: (title, emoji, category, targetDate) => {
        const goal: Goal = { id: uuid(), title, emoji, category, targetDate, createdAt: new Date().toISOString(), isArchived: false }
        set(s => ({ goals: [...s.goals, goal] }))
      },

      editGoal: (id, patch) => set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, ...patch } : g) })),

      deleteGoal: (id) => set(s => ({
        goals: s.goals.filter(g => g.id !== id),
        tasks: s.tasks.filter(t => t.goalId !== id),
      })),

      addTask: (goalId, title, date) => {
        const task: DailyTask = { id: uuid(), goalId, title, isCompleted: false, date: date ?? toDateKey(new Date()) }
        set(s => ({ tasks: [...s.tasks, task] }))
      },

      editTask: (id, title) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, title } : t) })),

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

      tasksForDate: (dateKey) => get().tasks.filter(t => t.date === dateKey),

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

      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
      toggleNotifications: () => set(s => ({ notificationsEnabled: !s.notificationsEnabled })),
      goalById: (id) => get().goals.find(g => g.id === id),
    }),
    {
      name: 'dailyflow-storage',
      // Fix #5: merge persisted state correctly — never re-seed if user cleared data
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<Store>
        return {
          ...current,
          goals: p.goals ?? (p.initialized ? [] : current.goals),
          tasks: p.tasks ?? (p.initialized ? [] : current.tasks),
          darkMode: p.darkMode ?? false,
          notificationsEnabled: p.notificationsEnabled ?? false,
          initialized: true,
        }
      },
    }
  )
)
