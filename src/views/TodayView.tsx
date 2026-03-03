import { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { toDateKey } from '../models/types'
import ProgressHeader from '../components/ProgressHeader'
import TaskRow from '../components/TaskRow'
import AddTaskSheet from '../components/AddTaskSheet'

function getGreeting(name?: string) {
  const h = new Date().getHours()
  const who = name?.trim() ? `, ${name}` : ''
  if (h < 12) return `Bom dia${who} ☀️`
  if (h < 18) return `Boa tarde${who} 👋`
  return `Boa noite${who} 🌙`
}

export default function TodayView() {
  const { goals, tasksForDate, summaryForDate, reorderTasks, focusMode, toggleFocusMode, seedRecurringTasks, settings } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [pulling, setPulling] = useState(false)
  const [pullY, setPullY] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const prevPct = useRef(0)
  const pullStartY = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const today = toDateKey(new Date())

  useEffect(() => {
    seedRecurringTasks(today)
  }, [today, seedRecurringTasks])

  const tasks = tasksForDate(today)
  const summary = summaryForDate(today)

  useEffect(() => {
    if (summary.completionPercentage === 100 && prevPct.current < 100 && summary.totalTasks > 0) {
      if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100])
    }
    prevPct.current = summary.completionPercentage
  }, [summary.completionPercentage, summary.totalTasks])

  // Pull-to-refresh
  const onTouchStartPull = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY
    }
  }

  const onTouchMovePull = (e: React.TouchEvent) => {
    if (!pullStartY.current) return
    const dy = e.touches[0].clientY - pullStartY.current
    if (dy > 0 && scrollRef.current?.scrollTop === 0) {
      setPulling(true)
      setPullY(Math.min(dy * 0.4, 60))
    }
  }

  const onTouchEndPull = useCallback(() => {
    if (pullY > 40) {
      seedRecurringTasks(today)
      setRefreshKey(k => k + 1)
      if (navigator.vibrate) navigator.vibrate(20)
    }
    setPulling(false)
    setPullY(0)
    pullStartY.current = 0
  }, [pullY, seedRecurringTasks, today])

  const dragFrom = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const visibleTasks = focusMode ? tasks.filter(t => !t.isCompleted) : tasks

  const grouped = goals
    .filter(g => !g.isArchived)
    .map(goal => ({ goal, tasks: visibleTasks.filter(t => t.goalId === goal.id) }))
    .filter(g => g.tasks.length > 0)

  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div>
      <div
        className="flex-shrink-0 px-5 pb-2 pt-2"
        style={{ background: 'var(--paper)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, textTransform: 'capitalize', letterSpacing: '.02em', color: 'var(--muted)', fontFamily: 'var(--font-system)', marginBottom: 2 }}>{dateLabel}</p>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ink)', fontFamily: 'var(--font-system)', lineHeight: 1.1 }}>
              {settings.name ? getGreeting(settings.name) : 'Meu Dia'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Focus mode button */}
            <button
              onClick={() => { toggleFocusMode(); if (navigator.vibrate) navigator.vibrate(15) }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: focusMode ? 'var(--ink)' : 'var(--soft)',
                color: focusMode ? 'var(--paper)' : 'var(--muted)',
              }}
              title={focusMode ? 'Sair do foco' : 'Modo Foco'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
            </button>

            {/* Add button */}
            <button
              onClick={() => setShowAdd(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xl leading-none active:scale-90 transition-transform"
              style={{ background: 'var(--ink)' }}
            >+</button>
          </div>
        </div>

        {/* Focus mode banner */}
        {focusMode && (
          <div
            className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'var(--ink)', color: 'var(--paper)' }}
          >
            <span className="text-[12px]">🎯</span>
            <span className="text-[12px] font-medium">Modo Foco ativo — exibindo apenas pendentes</span>
          </div>
        )}
      </div>

      {/* Pull-to-refresh indicator */}
      {pulling && (
        <div
          className="flex items-center justify-center text-[12px] gap-2"
          style={{
            height: pullY,
            overflow: 'hidden',
            color: 'var(--muted)',
            transition: pulling ? 'none' : 'height 0.3s',
          }}
        >
          {pullY > 40 ? '↑ Solte para atualizar' : '↓ Puxe para atualizar'}
        </div>
      )}

      <div
        ref={scrollRef}
        key={refreshKey}
        className="px-5 space-y-5 pt-2 pb-8"
        
        onTouchStart={onTouchStartPull}
        onTouchMove={onTouchMovePull}
        onTouchEnd={onTouchEndPull}
      >
        <ProgressHeader summary={summary} />

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 gap-4 fade-up">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ background: 'var(--soft)' }}>
              ✨
            </div>
            <div className="text-center">
              <p className="text-[17px] font-semibold mb-1" style={{ color: 'var(--ink)' }}>Nenhuma tarefa para hoje</p>
              <p className="text-[14px]" style={{ color: 'var(--muted)' }}>Adicione tarefas vinculadas<br />às suas metas</p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-1 px-6 py-3 rounded-2xl text-[15px] font-semibold active:scale-95 transition-transform"
              style={{ background: 'var(--ink)', color: 'var(--paper)' }}
            >
              + Adicionar tarefa
            </button>
          </div>
        ) : (
          grouped.map(({ goal, tasks: gtasks }, i) => (
            <div key={goal.id} className={`fade-up fade-up-${Math.min(i + 2, 5)}`}>
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{goal.emoji}</span>
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>{goal.title}</span>
                </div>
                <span className="text-[12px]" style={{ color: 'var(--muted)' }}>
                  {gtasks.filter(t => t.isCompleted).length}/{gtasks.length}
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: 'var(--white)' }}>
                {gtasks.map((task, ti) => {
                  const allIdx = tasks.indexOf(task)
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => { dragFrom.current = allIdx }}
                      onDragEnter={() => setDragOver(allIdx)}
                      onDragEnd={() => {
                        if (dragFrom.current !== null && dragOver !== null && dragFrom.current !== dragOver) {
                          reorderTasks(today, dragFrom.current, dragOver)
                        }
                        dragFrom.current = null
                        setDragOver(null)
                      }}
                      style={{
                        opacity: dragOver === allIdx ? 0.5 : 1,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      <TaskRow task={task} goal={goal} isLast={ti === gtasks.length - 1} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}

        <div className="h-4" />
      </div>

      {showAdd && <AddTaskSheet onClose={() => setShowAdd(false)} />}
    </div>
  )
}
