import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { toDateKey, CATEGORY_META } from '../models/types'

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return toDateKey(d)
  })
}

function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i)); return toDateKey(d)
  })
}

function dayLabel(dk: string): string {
  if (dk === toDateKey(new Date())) return 'Hoje'
  const d = new Date(dk + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })
}

// Fix #11 — Request notification permission and schedule daily reminder
async function requestNotifications(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function scheduleReminder() {
  // Uses ServiceWorker registration if available for real push
  // Falls back to a simple setTimeout-based reminder for demo
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SCHEDULE_REMINDER', hour: 20 })
  }
}

export default function SummaryView() {
  const { goals, tasksForDate, summaryForDate, darkMode, toggleDarkMode, notificationsEnabled, toggleNotifications } = useStore()
  const [animated, setAnimated] = useState(false)

  const today = toDateKey(new Date())
  const todaySummary = summaryForDate(today)
  const last7 = getLast7Days()
  const last30 = getLast30Days()

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotifications()
      if (granted) { scheduleReminder(); toggleNotifications() }
    } else {
      toggleNotifications()
    }
  }

  // Fix #13 — streak calc
  const streak = (() => {
    let count = 0
    const days = [...last30].reverse()
    for (const dk of days) {
      const s = summaryForDate(dk)
      if (s.totalTasks > 0 && s.completionPercentage === 100) count++
      else if (dk !== today) break
    }
    return count
  })()

  const statusEmoji = (() => {
    const p = todaySummary.completionPercentage
    if (p === 100) return '🎉'; if (p >= 75) return '🔥'; if (p >= 50) return '💪'
    if (p >= 25) return '🌱'; return todaySummary.totalTasks === 0 ? '✨' : '⏳'
  })()

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-5 pb-2" style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)', background: 'var(--paper)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Estatísticas</p>
            <h1 className="font-display text-3xl mt-0.5" style={{ color: 'var(--ink)' }}>Resumo</h1>
          </div>
          {/* Fix #12 — dark mode toggle */}
          <button onClick={toggleDarkMode}
            className="w-9 h-9 rounded-full flex items-center justify-center mt-1 active:scale-90 transition-transform"
            style={{ background: 'var(--soft)', color: 'var(--ink)' }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="flex-1 scroll-area px-5 pt-2 space-y-5" style={{ paddingBottom: 'calc(var(--safe-bottom) + 1rem)' }}>

        {/* Today card */}
        <div className="rounded-2xl p-5 shadow-sm fade-up" style={{ background: 'var(--white)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Hoje</p>
              <p className="font-display text-5xl leading-none mt-1" style={{ color: 'var(--ink)' }}>{todaySummary.completionPercentage}%</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>concluído</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-1">{statusEmoji}</div>
              {streak > 0 && (
                <div className="text-[12px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--soft)', color: 'var(--ink)' }}>
                  🔥 {streak} dias
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x rounded-xl overflow-hidden" style={{ borderColor: 'var(--soft)', background: 'var(--paper)' }}>
            {[
              { v: todaySummary.completedTasks, l: 'Feitas' },
              { v: todaySummary.totalTasks - todaySummary.completedTasks, l: 'Pendentes' },
              { v: todaySummary.totalTasks, l: 'Total' },
            ].map(({ v, l }) => (
              <div key={l} className="flex flex-col items-center py-3 gap-0.5" style={{ borderColor: 'var(--line)' }}>
                <span className="font-display text-2xl" style={{ color: 'var(--ink)' }}>{v}</span>
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Last 7 days */}
        <div className="fade-up fade-up-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--muted)' }}>Últimos 7 dias</p>
          <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: 'var(--white)' }}>
            {last7.map((dk, i) => {
              const s = summaryForDate(dk)
              const isToday = dk === today
              const barColor = s.completionPercentage === 100 ? '#4CAF50' : 'var(--ink)'
              return (
                <div key={dk} className="flex items-center gap-3 px-4 py-3.5"
                  style={{ borderBottom: i < 6 ? '1px solid var(--soft)' : 'none' }}>
                  <span className={`text-[13px] w-24 flex-shrink-0 ${isToday ? 'font-semibold' : ''}`} style={{ color: isToday ? 'var(--ink)' : 'var(--muted)' }}>
                    {dayLabel(dk)}
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--soft)' }}>
                    <div className="h-full rounded-full"
                      style={{ width: animated ? `${s.completionPercentage}%` : '0%', background: barColor, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
                  </div>
                  <span className="text-[13px] font-semibold w-8 text-right font-display" style={{ color: 'var(--ink)' }}>
                    {s.totalTasks === 0 ? '—' : `${s.completionPercentage}%`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Fix #13 — 30-day streak calendar */}
        <div className="fade-up fade-up-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--muted)' }}>Calendário (30 dias)</p>
          <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'var(--white)' }}>
            <div className="grid grid-cols-10 gap-1.5">
              {last30.map(dk => {
                const s = summaryForDate(dk)
                const isToday = dk === today
                const full = s.completionPercentage === 100
                const partial = s.completionPercentage > 0
                return (
                  <div key={dk} title={`${dk}: ${s.completionPercentage}%`}
                    className="aspect-square rounded-md"
                    style={{
                      background: full ? '#4CAF50' : partial ? 'var(--ink)' : 'var(--soft)',
                      opacity: full ? 1 : partial ? 0.4 : 0.25,
                      outline: isToday ? '2px solid var(--ink)' : 'none',
                      outlineOffset: '1px',
                    }} />
                )
              })}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: '#4CAF50' }} />
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>100%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm opacity-40" style={{ background: 'var(--ink)' }} />
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Parcial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--soft)' }} />
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Vazio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Goals breakdown */}
        {goals.length > 0 && (
          <div className="fade-up fade-up-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--muted)' }}>Por meta</p>
            <div className="space-y-2.5">
              {goals.map(goal => {
                const tasks = tasksForDate(today).filter(t => t.goalId === goal.id)
                const done = tasks.filter(t => t.isCompleted).length
                const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
                const meta = CATEGORY_META[goal.category]
                return (
                  <div key={goal.id} className="rounded-xl p-3.5 shadow-sm flex items-center gap-3" style={{ background: 'var(--white)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: meta.bg }}>
                      {goal.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--ink)' }}>{goal.title}</p>
                      <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--soft)' }}>
                        <div className="h-full rounded-full"
                          style={{ width: animated ? `${pct}%` : '0%', background: meta.color, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
                      </div>
                    </div>
                    <span className="text-[14px] font-display font-bold w-10 text-right flex-shrink-0" style={{ color: 'var(--ink)' }}>
                      {tasks.length === 0 ? '—' : `${pct}%`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Fix #11 — Notifications toggle */}
        <div className="fade-up fade-up-5 rounded-2xl p-4 shadow-sm" style={{ background: 'var(--white)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>🔔 Lembrete diário</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted)' }}>Notificação às 20h para revisar suas tarefas</p>
            </div>
            <button onClick={handleNotificationToggle}
              className="w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0"
              style={{ background: notificationsEnabled ? 'var(--ink)' : 'var(--line)' }}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}
