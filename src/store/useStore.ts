import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Goal, DailyTask, DailySummary, GoalCategory, toDateKey } from '../models/types'

function uuid() {
  return crypto.randomUUID()
}

interface Store {
  goals: Goal[]
  tasks: DailyTask[]

  // Goals
  addGoal: (title: string, emoji: string, category: GoalCategory, targetDate?: string) => void
  deleteGoal: (id: string) => void

  // Tasks
  addTask: (goalId: string, title: string, date?: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  tasksForDate: (dateKey: string) => DailyTask[]
  summaryForDate: (dateKey: string) => DailySummary

  // Helpers
  goalById: (id: string) => Goal | undefined
}

const SAMPLE_GOALS: Goal[] = [
  { id: 'g1', title: 'Exercitar todos os dias', emoji: '🏃', category: 'Saúde', createdAt: new Date().toISOString(), isArchived: false, targetDate: new Date(Date.now() + 90 * 86400000).toISOString() },
  { id: 'g2', title: 'Ler 1 livro por mês', emoji: '📚', category: 'Aprendizado', createdAt: new Date().toISOString(), isArchived: false },
  { id: 'g3', title: 'Economizar R$500/mês', emoji: '💰', category: 'Finanças', createdAt: new Date().toISOString(), isArchived: false },
]

const today = toDateKey(new Date())
const SAMPLE_TASKS: DailyTask[] = [
  { id: 't1', goalId: 'g1', title: '30 min de corrida', isCompleted: false, date: today },
  { id: 't2', goalId: 'g1', title: 'Alongamento', isCompleted: false, date: today },
  { id: 't3', goalId: 'g2', title: 'Ler 20 páginas', isCompleted: false, date: today },
]

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      goals: SAMPLE_GOALS,
      tasks: SAMPLE_TASKS,

      addGoal: (title, emoji, category, targetDate) => {
        const goal: Goal = {
          id: uuid(), title, emoji, category,
          targetDate, createdAt: new Date().toISOString(), isArchived: false,
        }
        set(s => ({ goals: [...s.goals, goal] }))
      },

      deleteGoal: (id) => {
        set(s => ({
          goals: s.goals.filter(g => g.id !== id),
          tasks: s.tasks.filter(t => t.goalId !== id),
        }))
      },

      addTask: (goalId, title, date) => {
        const task: DailyTask = {
          id: uuid(), goalId, title,
          isCompleted: false,
          date: date ?? toDateKey(new Date()),
        }
        set(s => ({ tasks: [...s.tasks, task] }))
      },

      toggleTask: (id) => {
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === id
              ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? new Date().toISOString() : undefined }
              : t
          )
        }))
      },

      deleteTask: (id) => {
        set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
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

      goalById: (id) => get().goals.find(g => g.id === id),
    }),
    { name: 'dailyflow-storage' }
  )
)
