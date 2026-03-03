import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Goal, DailyTask, DailySummary, GoalCategory, SubTask, TaskPriority, TaskRecurrence, UserSettings, toDateKey, DailyReflection, ALL_BADGES, Badge } from '../models/types'

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r=(Math.random()*16)|0; return (c==='x'?r:(r&0x3)|0x8).toString(16) })
}

interface Store {
  goals: Goal[]; tasks: DailyTask[]; reflections: DailyReflection[]
  unlockedBadges: string[]; initialized: boolean; darkMode: boolean
  notificationsEnabled: boolean; settings: UserSettings; focusMode: boolean

  addGoal: (title: string, emoji: string, category: GoalCategory, targetDate?: string) => void
  editGoal: (id: string, patch: Partial<Pick<Goal,'title'|'emoji'|'category'|'targetDate'>>) => void
  deleteGoal: (id: string) => void
  archiveGoal: (id: string) => void
  unarchiveGoal: (id: string) => void

  addTask: (goalId: string, title: string, date?: string, priority?: TaskPriority, recurrence?: TaskRecurrence, note?: string, recurrenceDays?: number[]) => void
  editTask: (id: string, patch: Partial<Pick<DailyTask,'title'|'priority'|'note'|'recurrence'|'recurrenceDays'>>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  moveTaskToDate: (taskId: string, newDate: string) => void
  reorderTasks: (dateKey: string, fromIndex: number, toIndex: number) => void
  tasksForDate: (dateKey: string) => DailyTask[]
  summaryForDate: (dateKey: string) => DailySummary
  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  seedRecurringTasks: (dateKey: string) => void

  getCurrentStreak: () => number
  getLongestStreak: () => number
  setReflection: (date: string, stars: number, note?: string) => void
  getReflection: (date: string) => DailyReflection | undefined
  checkAndUnlockBadges: () => string[]
  getBadges: () => (Badge & { unlocked: boolean })[]

  toggleDarkMode: () => void
  toggleNotifications: () => void
  toggleFocusMode: () => void
  goalById: (id: string) => Goal | undefined
  updateSettings: (patch: Partial<UserSettings>) => void
}

const SAMPLE_GOALS: Goal[] = [
  { id: 'g1', title: 'Exercitar todos os dias', emoji: '🏃', category: 'Saúde', createdAt: new Date().toISOString(), isArchived: false, targetDate: new Date(Date.now()+90*86400000).toISOString() },
  { id: 'g2', title: 'Ler 1 livro por mês', emoji: '📚', category: 'Aprendizado', createdAt: new Date().toISOString(), isArchived: false },
  { id: 'g3', title: 'Economizar R$500/mês', emoji: '💰', category: 'Finanças', createdAt: new Date().toISOString(), isArchived: false },
]
function makeSampleTasks(): DailyTask[] {
  const today = toDateKey(new Date())
  return [
    { id: 't1', goalId: 'g1', title: '30 min de corrida', isCompleted: false, date: today, priority: 'Alta', recurrence: 'daily' },
    { id: 't2', goalId: 'g1', title: 'Alongamento', isCompleted: false, date: today, priority: 'Média' },
    { id: 't3', goalId: 'g2', title: 'Ler 20 páginas', isCompleted: false, date: today, priority: 'Baixa', note: 'Capítulo 3' },
  ]
}
const DEFAULT_SETTINGS: UserSettings = { name: '', accentColor: 'default', onboardingDone: false, notificationHour: 20, notificationMinute: 0, quoteCategory: 'all' }

export const useStore = create<Store>()(persist(
  (set, get) => ({
    goals: SAMPLE_GOALS, tasks: makeSampleTasks(), reflections: [], unlockedBadges: [],
    initialized: true, darkMode: false, notificationsEnabled: false, settings: DEFAULT_SETTINGS, focusMode: false,

    addGoal: (title, emoji, category, targetDate) => {
      set(s => ({ goals: [...s.goals, { id: uuid(), title, emoji, category, targetDate, createdAt: new Date().toISOString(), isArchived: false }] }))
    },
    editGoal: (id, patch) => set(s => ({ goals: s.goals.map(g => g.id===id ? {...g,...patch} : g) })),
    deleteGoal: (id) => set(s => ({ goals: s.goals.filter(g=>g.id!==id), tasks: s.tasks.filter(t=>t.goalId!==id) })),
    archiveGoal: (id) => set(s => ({ goals: s.goals.map(g => g.id===id ? {...g,isArchived:true} : g) })),
    unarchiveGoal: (id) => set(s => ({ goals: s.goals.map(g => g.id===id ? {...g,isArchived:false} : g) })),

    addTask: (goalId, title, date, priority, recurrence, note, recurrenceDays) => {
      set(s => ({ tasks: [...s.tasks, { id:uuid(), goalId, title, isCompleted:false, date:date??toDateKey(new Date()), priority:priority??'Média', recurrence:recurrence??'none', recurrenceDays, note, subtasks:[] }] }))
    },
    editTask: (id, patch) => set(s => ({ tasks: s.tasks.map(t => t.id===id ? {...t,...patch} : t) })),
    toggleTask: (id) => set(s => ({ tasks: s.tasks.map(t => t.id===id ? {...t, isCompleted:!t.isCompleted, completedAt:!t.isCompleted?new Date().toISOString():undefined} : t) })),
    deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t=>t.id!==id) })),
    moveTaskToDate: (taskId, newDate) => set(s => ({ tasks: s.tasks.map(t => t.id===taskId ? {...t,date:newDate} : t) })),
    reorderTasks: (dateKey, from, to) => {
      const all=get().tasks, dated=all.filter(t=>t.date===dateKey), others=all.filter(t=>t.date!==dateKey)
      const r=[...dated]; const [m]=r.splice(from,1); r.splice(to,0,m)
      set({ tasks: [...others,...r] })
    },
    tasksForDate: (dateKey) => {
      const p: Record<string,number>={Alta:0,Média:1,Baixa:2}
      return get().tasks.filter(t=>t.date===dateKey).sort((a,b)=>(p[a.priority??'Média']??1)-(p[b.priority??'Média']??1))
    },
    summaryForDate: (dateKey) => {
      const tasks=get().tasksForDate(dateKey), completed=tasks.filter(t=>t.isCompleted).length
      return { date:dateKey, totalTasks:tasks.length, completedTasks:completed, completionPercentage:tasks.length>0?Math.round((completed/tasks.length)*100):0 }
    },
    addSubtask: (taskId, title) => set(s => ({ tasks: s.tasks.map(t => t.id===taskId ? {...t,subtasks:[...(t.subtasks??[]),{id:uuid(),title,isCompleted:false}]} : t) })),
    toggleSubtask: (taskId, subtaskId) => set(s => ({ tasks: s.tasks.map(t => t.id===taskId ? {...t,subtasks:(t.subtasks??[]).map(st=>st.id===subtaskId?{...st,isCompleted:!st.isCompleted}:st)} : t) })),
    deleteSubtask: (taskId, subtaskId) => set(s => ({ tasks: s.tasks.map(t => t.id===taskId ? {...t,subtasks:(t.subtasks??[]).filter(st=>st.id!==subtaskId)} : t) })),

    seedRecurringTasks: (dateKey) => {
      const { tasks } = get()
      const dateObj=new Date(dateKey+'T00:00:00'), dow=dateObj.getDay(), dom=dateObj.getDate()
      const seen=new Set<string>(); const sources: DailyTask[]=[]
      for (const t of [...tasks.filter(x=>x.recurrence&&x.recurrence!=='none'&&x.date!==dateKey)].reverse()) {
        const k=`${t.goalId}-${t.title}`; if(!seen.has(k)){seen.add(k);sources.push(t)}
      }
      const exists=(t:DailyTask)=>tasks.some(x=>x.date===dateKey&&x.goalId===t.goalId&&x.title===t.title)
      const newTasks=sources.filter(t=>{
        if(exists(t))return false
        if(t.recurrence==='daily')return true
        if(t.recurrence==='weekdays')return dow>=1&&dow<=5
        if(t.recurrence==='weekly'){const s=new Date(t.date+'T00:00:00');return s.getDay()===dow}
        if(t.recurrence==='custom_days'&&t.recurrenceDays)return t.recurrenceDays.includes(dow)
        if(t.recurrence==='monthly_day'&&t.recurrenceDays)return t.recurrenceDays.includes(dom)
        return false
      }).map(t=>({...t,id:uuid(),date:dateKey,isCompleted:false,completedAt:undefined}))
      if(newTasks.length>0)set(s=>({tasks:[...s.tasks,...newTasks]}))
    },

    getCurrentStreak: () => {
      const { summaryForDate:sfn } = get(); let streak=0; const today=new Date()
      for(let i=0;i<365;i++){
        const d=new Date(today); d.setDate(today.getDate()-i); const s=sfn(toDateKey(d))
        if(s.totalTasks>0&&s.completionPercentage===100)streak++; else if(i>0)break
      }
      return streak
    },
    getLongestStreak: () => {
      const { summaryForDate:sfn } = get(); let best=0,cur=0; const today=new Date()
      for(let i=364;i>=0;i--){
        const d=new Date(today); d.setDate(today.getDate()-i); const s=sfn(toDateKey(d))
        if(s.totalTasks>0&&s.completionPercentage===100){cur++;best=Math.max(best,cur)}else cur=0
      }
      return best
    },

    setReflection: (date,stars,note) => set(s=>({reflections:[...s.reflections.filter(r=>r.date!==date),{date,stars,note}]})),
    getReflection: (date) => get().reflections.find(r=>r.date===date),

    checkAndUnlockBadges: () => {
      const { tasks,goals,unlockedBadges,getCurrentStreak,reflections } = get()
      const newB: string[]=[]
      const unlock=(id:string)=>{if(!unlockedBadges.includes(id))newB.push(id)}
      if(tasks.filter(t=>t.isCompleted).length>=1)unlock('first_task')
      const streak=getCurrentStreak()
      if(streak>=3)unlock('streak_3'); if(streak>=7)unlock('streak_7'); if(streak>=30)unlock('streak_30')
      const today=toDateKey(new Date()), tt=tasks.filter(t=>t.date===today)
      if(tt.length>0&&tt.every(t=>t.isCompleted))unlock('perfect_day')
      if(goals.filter(g=>!g.isArchived).length>=5)unlock('goal_5')
      if(tasks.some(t=>t.isCompleted&&t.completedAt&&new Date(t.completedAt).getHours()<8))unlock('early_bird')
      if(tasks.some(t=>t.isCompleted&&t.completedAt&&new Date(t.completedAt).getHours()>=22))unlock('night_owl')
      try{const n=JSON.parse(localStorage.getItem('dailyflow-notes-v1')||'[]');if(n.length>=10)unlock('notes_10')}catch{}
      if(reflections.length>=7)unlock('reflection_7')
      if(newB.length>0)set(s=>({unlockedBadges:[...s.unlockedBadges,...newB]}))
      return newB
    },
    getBadges: () => { const { unlockedBadges:ub } = get(); return ALL_BADGES.map(b=>({...b,unlocked:ub.includes(b.id)})) },

    toggleDarkMode: () => set(s=>({darkMode:!s.darkMode})),
    toggleNotifications: () => set(s=>({notificationsEnabled:!s.notificationsEnabled})),
    toggleFocusMode: () => set(s=>({focusMode:!s.focusMode})),
    goalById: (id) => get().goals.find(g=>g.id===id),
    updateSettings: (patch) => set(s=>({settings:{...s.settings,...patch}})),
  }),
  {
    name: 'dailyflow-storage-v4',
    merge: (persisted: unknown, current) => {
      const p=persisted as Partial<Store>
      return { ...current, goals:p.goals??(p.initialized?[]:current.goals), tasks:p.tasks??(p.initialized?[]:current.tasks), reflections:p.reflections??[], unlockedBadges:p.unlockedBadges??[], darkMode:p.darkMode??false, notificationsEnabled:p.notificationsEnabled??false, settings:{...DEFAULT_SETTINGS,...(p.settings??{})}, focusMode:false, initialized:true }
    },
  }
))
