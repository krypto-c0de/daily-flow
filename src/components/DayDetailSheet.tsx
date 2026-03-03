import { useStore } from '../store/useStore'
import { toDateKey } from '../models/types'

interface Note {
  id: string
  text: string
  createdAt: string
}

function loadNotes(): Note[] {
  try { return JSON.parse(localStorage.getItem('dailyflow-notes-v1') || '[]') } catch { return [] }
}

interface Props {
  date: Date
  onClose: () => void
}

export default function DayDetailSheet({ date, onClose }: Props) {
  const { tasksForDate, summaryForDate, goals } = useStore()
  const dateKey = toDateKey(date)
  const summary = summaryForDate(dateKey)
  const tasks = tasksForDate(dateKey)

  // Filter notes for this day
  const allNotes = loadNotes()
  const dayNotes = allNotes.filter(n => {
    const noteDate = toDateKey(new Date(n.createdAt))
    return noteDate === dateKey
  })

  const isToday = toDateKey(new Date()) === dateKey

  const dayLabels = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  const circumference = 2 * Math.PI * 24
  const dashOffset = circumference - (summary.completionPercentage / 100) * circumference
  const isComplete = summary.completionPercentage === 100

  // Group tasks by goal
  const grouped = goals
    .filter(g => !g.isArchived)
    .map(g => ({ goal: g, tasks: tasks.filter(t => t.goalId === g.id) }))
    .filter(g => g.tasks.length > 0)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />
      <div
        className="relative rounded-t-3xl sheet-enter flex flex-col"
        style={{ background: 'var(--paper)', maxHeight: '85dvh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--line)' }} />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-2 pb-4 flex items-center justify-between">
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', fontFamily: 'var(--font-system)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {dayLabels[date.getDay()]}
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-system)', letterSpacing: '-.02em', lineHeight: 1.1, marginTop: 2 }}>
              {date.getDate()} de {monthLabels[date.getMonth()]}
              {isToday && <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginLeft: 8 }}>hoje</span>}
            </h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto scroll-area flex-1 px-5 pb-8 space-y-4">

          {/* Progress card */}
          <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'var(--white)' }}>
            {/* Circular progress */}
            <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
              <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="32" cy="32" r="24" fill="none" stroke="var(--soft)" strokeWidth="5"/>
                <circle cx="32" cy="32" r="24" fill="none"
                  stroke={isComplete ? '#34C759' : 'var(--ink)'}
                  strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-system)', fontVariantNumeric: 'tabular-nums' }}>
                  {summary.completionPercentage}%
                </span>
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'var(--font-system)', marginBottom: 4 }}>
                Aproveitamento
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-system)', letterSpacing: '-.02em', lineHeight: 1 }}>
                {summary.completedTasks}/{summary.totalTasks}
                <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)', marginLeft: 6 }}>tarefas</span>
              </p>
              {summary.totalTasks === 0 && (
                <p style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-system)', marginTop: 2 }}>Nenhuma tarefa</p>
              )}
            </div>
          </div>

          {/* Tasks */}
          {grouped.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'var(--font-system)', marginBottom: 10 }}>
                Tarefas
              </p>
              <div className="space-y-3">
                {grouped.map(({ goal, tasks: gtasks }) => (
                  <div key={goal.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ fontSize: 14 }}>{goal.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-system)' }}>{goal.title}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-system)', marginLeft: 'auto' }}>
                        {gtasks.filter(t => t.isCompleted).length}/{gtasks.length}
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--white)' }}>
                      {gtasks.map((task, i) => (
                        <div key={task.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < gtasks.length - 1 ? '1px solid var(--soft)' : 'none' }}>
                          <div style={{
                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                            background: task.isCompleted ? 'var(--ink)' : 'transparent',
                            border: `2px solid ${task.isCompleted ? 'var(--ink)' : 'var(--line)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {task.isCompleted && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--paper)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                          </div>
                          <span style={{
                            fontSize: 14, fontFamily: 'var(--font-system)', color: task.isCompleted ? 'var(--muted)' : 'var(--ink)',
                            textDecoration: task.isCompleted ? 'line-through' : 'none',
                            flex: 1,
                          }}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {dayNotes.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'var(--font-system)', marginBottom: 10 }}>
                Notas do dia
              </p>
              <div className="space-y-2">
                {dayNotes.map(note => (
                  <div key={note.id} className="rounded-xl p-4" style={{ background: 'var(--white)' }}>
                    <p style={{ fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-system)', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {note.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {summary.totalTasks === 0 && dayNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div style={{ fontSize: 36 }}>📅</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-system)' }}>Nenhum dado para este dia</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-system)', textAlign: 'center' }}>Sem tarefas ou notas registradas</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
