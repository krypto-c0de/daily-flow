import { useState } from 'react'
import { useStore } from '../store/useStore'
import { toDateKey } from '../models/types'
import ProgressHeader from '../components/ProgressHeader'
import TaskRow from '../components/TaskRow'
import AddTaskSheet from '../components/AddTaskSheet'

export default function TodayView() {
  const { goals, tasksForDate, summaryForDate } = useStore()
  const [showAdd, setShowAdd] = useState(false)

  const today = toDateKey(new Date())
  const tasks = tasksForDate(today)
  const summary = summaryForDate(today)

  // Group tasks by goal
  const grouped = goals
    .map(goal => ({ goal, tasks: tasks.filter(t => t.goalId === goal.id) }))
    .filter(g => g.tasks.length > 0)

  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-safe pt-4 pb-2 bg-paper flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-muted capitalize tracking-wide">{dateLabel}</p>
          <h1 className="font-display text-3xl text-ink mt-0.5">Meu Dia</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 bg-ink rounded-full flex items-center justify-center text-white text-xl leading-none mt-1 active:scale-90 transition-transform"
        >
          +
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scroll-area px-5 pb-safe space-y-5 pt-2">
        <ProgressHeader summary={summary} />

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-3 fade-up">
            <span className="text-5xl">✨</span>
            <p className="text-[17px] font-semibold text-ink">Nenhuma tarefa para hoje</p>
            <p className="text-[14px] text-muted text-center">Adicione tarefas vinculadas<br />às suas metas</p>
          </div>
        ) : (
          grouped.map(({ goal, tasks: gtasks }, i) => (
            <div key={goal.id} className={`fade-up fade-up-${Math.min(i + 2, 5)}`}>
              {/* Section header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{goal.emoji}</span>
                  <span className="text-[13px] font-semibold text-ink">{goal.title}</span>
                </div>
                <span className="text-[12px] text-muted">
                  {gtasks.filter(t => t.isCompleted).length}/{gtasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-soft">
                {gtasks.map(task => (
                  <TaskRow key={task.id} task={task} goal={goal} />
                ))}
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
