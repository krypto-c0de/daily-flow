import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { toDateKey, getMotivationalPhrase } from '../models/types'
import ProgressHeader from '../components/ProgressHeader'
import TaskRow        from '../components/TaskRow'
import AddTaskSheet   from '../components/AddTaskSheet'
import Confetti       from '../components/Confetti'

export default function TodayView() {
  const { goals, tasksForDate, summaryForDate, reorderTasks } = useStore()
  const [showAdd,      setShowAdd]      = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const prevPct = useRef(0)

  const today   = toDateKey(new Date())
  const tasks   = tasksForDate(today)
  const summary = summaryForDate(today)

  useEffect(() => {
    if (summary.completionPercentage === 100 && prevPct.current < 100 && summary.totalTasks > 0) {
      setShowConfetti(true)
      if ('vibrate' in navigator) navigator.vibrate([30, 20, 30])
    }
    prevPct.current = summary.completionPercentage
  }, [summary.completionPercentage, summary.totalTasks])

  const dragFrom = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const grouped = goals
    .map(goal => ({ goal, tasks: tasks.filter(t => t.goalId === goal.id) }))
    .filter(g => g.tasks.length > 0)

  const dateLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const motivational = getMotivationalPhrase(summary.completionPercentage, summary.totalTasks - summary.completedTasks)

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-5 pb-2"
        style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)', background: 'var(--paper)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium capitalize tracking-wide" style={{ color: 'var(--muted)' }}>{dateLabel}</p>
            <h1 className="font-display text-3xl mt-0.5" style={{ color: 'var(--ink)' }}>Meu Dia</h1>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-xl leading-none mt-1 active:scale-90 transition-transform"
            style={{ background: 'var(--ink)', color: 'var(--paper)' }}>+</button>
        </div>

        {/* #23 Motivational phrase */}
        {summary.totalTasks > 0 && (
          <p className="text-[12px] mt-2 px-1 fade-up" style={{ color: 'var(--muted)' }}>{motivational}</p>
        )}
      </div>

      <div className="flex-1 scroll-area px-5 space-y-5 pt-2"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 1rem)' }}>
        <ProgressHeader summary={summary} />

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-3 fade-up">
            <span className="text-5xl">✨</span>
            <p className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>Nenhuma tarefa para hoje</p>
            <p className="text-[14px] text-center" style={{ color: 'var(--muted)' }}>Adicione tarefas vinculadas<br/>às suas metas</p>
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
                    <div key={task.id} draggable
                      onDragStart={() => { dragFrom.current = allIdx }}
                      onDragEnter={() => setDragOver(allIdx)}
                      onDragEnd={() => {
                        if (dragFrom.current !== null && dragOver !== null && dragFrom.current !== dragOver) {
                          reorderTasks(today, dragFrom.current, dragOver)
                        }
                        dragFrom.current = null; setDragOver(null)
                      }}
                      style={{ opacity: dragOver === allIdx ? 0.5 : 1, transition: 'opacity 0.15s' }}>
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

      {showAdd      && <AddTaskSheet onClose={() => setShowAdd(false)} />}
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
    </div>
  )
}
