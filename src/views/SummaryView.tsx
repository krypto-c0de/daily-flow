import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { toDateKey, CATEGORY_META } from '../models/types'

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return toDateKey(d)
  })
}

function dayLabel(dateKey: string): string {
  const today = toDateKey(new Date())
  if (dateKey === today) return 'Hoje'
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })
}

export default function SummaryView() {
  const { goals, tasksForDate, summaryForDate } = useStore()
  const [animated, setAnimated] = useState(false)
  const today = toDateKey(new Date())
  const todaySummary = summaryForDate(today)
  const last7 = getLast7Days()

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  const statusEmoji = (() => {
    const p = todaySummary.completionPercentage
    if (p === 100) return '🎉'
    if (p >= 75)  return '🔥'
    if (p >= 50)  return '💪'
    if (p >= 25)  return '🌱'
    return todaySummary.totalTasks === 0 ? '✨' : '⏳'
  })()

  const statusMsg = (() => {
    const p = todaySummary.completionPercentage
    if (p === 100) return 'Dia perfeito!'
    if (p >= 75)  return 'Quase lá!'
    if (p >= 50)  return 'Na metade!'
    if (p >= 25)  return 'Bom começo!'
    return todaySummary.totalTasks === 0 ? 'Sem tarefas hoje' : 'Vamos começar!'
  })()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-safe pt-4 pb-2 bg-paper">
        <p className="text-[11px] font-medium text-muted uppercase tracking-widest">Estatísticas</p>
        <h1 className="font-display text-3xl text-ink mt-0.5">Resumo</h1>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-5 pb-safe pt-2 space-y-5">

        {/* Today big card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm fade-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-medium text-muted uppercase tracking-widest">Hoje</p>
              <p className="font-display text-5xl text-ink leading-none mt-1">
                {todaySummary.completionPercentage}%
              </p>
              <p className="text-[13px] text-muted mt-1">concluído</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-1">{statusEmoji}</div>
              <p className="text-[11px] text-muted font-medium">{statusMsg}</p>
            </div>
          </div>

          {/* 3 stats */}
          <div className="grid grid-cols-3 divide-x divide-soft bg-paper rounded-xl">
            {[
              { v: todaySummary.completedTasks, l: 'Feitas' },
              { v: todaySummary.totalTasks - todaySummary.completedTasks, l: 'Pendentes' },
              { v: todaySummary.totalTasks, l: 'Total' },
            ].map(({ v, l }) => (
              <div key={l} className="flex flex-col items-center py-3 gap-0.5">
                <span className="font-display text-2xl text-ink">{v}</span>
                <span className="text-[10px] text-muted">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Last 7 days */}
        <div className="fade-up fade-up-2">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2 px-1">Últimos 7 dias</p>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-soft">
            {last7.map(dk => {
              const s = summaryForDate(dk)
              const isToday = dk === today
              const barColor = s.completionPercentage === 100 ? '#4CAF50' : '#1A1A1A'
              return (
                <div key={dk} className="flex items-center gap-3 px-4 py-3.5">
                  <span className={`text-[13px] w-24 flex-shrink-0 ${isToday ? 'font-semibold text-ink' : 'text-muted'}`}>
                    {dayLabel(dk)}
                  </span>
                  <div className="flex-1 h-2 bg-soft rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: animated ? `${s.completionPercentage}%` : '0%',
                        backgroundColor: barColor,
                        transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
                      }}
                    />
                  </div>
                  <span className="text-[13px] font-semibold text-ink w-8 text-right font-display">
                    {s.totalTasks === 0 ? '—' : `${s.completionPercentage}%`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Goals breakdown */}
        {goals.length > 0 && (
          <div className="fade-up fade-up-3">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2 px-1">Por meta</p>
            <div className="space-y-2.5">
              {goals.map(goal => {
                const tasks = tasksForDate(today).filter(t => t.goalId === goal.id)
                const done = tasks.filter(t => t.isCompleted).length
                const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
                const meta = CATEGORY_META[goal.category]
                return (
                  <div key={goal.id} className="bg-white rounded-xl p-3.5 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: meta.bg }}>
                      {goal.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-ink truncate">{goal.title}</p>
                      <div className="mt-1.5 h-1.5 bg-soft rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: animated ? `${pct}%` : '0%',
                            backgroundColor: meta.color,
                            transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-[14px] font-display font-bold text-ink w-10 text-right flex-shrink-0">
                      {tasks.length === 0 ? '—' : `${pct}%`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
