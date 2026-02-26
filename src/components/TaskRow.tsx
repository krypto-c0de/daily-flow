import { useState, useRef } from 'react'
import { DailyTask, Goal } from '../models/types'
import { useStore } from '../store/useStore'

interface Props {
  task: DailyTask
  goal?: Goal
  isLast?: boolean
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  Alta:  { bg: '#FEE2E2', text: '#DC2626', label: 'Alta'  },
  Média: { bg: '#FEF9C3', text: '#CA8A04', label: 'Média' },
  Baixa: { bg: '#DCFCE7', text: '#16A34A', label: 'Baixa' },
}

export default function TaskRow({ task, goal, isLast }: Props) {
  const { toggleTask, deleteTask, editTask, addSubtask, toggleSubtask, deleteSubtask } = useStore()
  const [popping, setPopping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(task.title)
  const [expanded, setExpanded] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [completing, setCompleting] = useState(false)

  const startX = useRef(0)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  const handleCheck = () => {
    if (swipeX !== 0) return
    setPopping(true)
    if (!task.isCompleted) setCompleting(true)
    setTimeout(() => { setPopping(false); setCompleting(false) }, 500)
    toggleTask(task.id)
    if (navigator.vibrate) navigator.vibrate(task.isCompleted ? 10 : [20, 10, 20])
  }

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setSwiping(true)
    pressTimer.current = setTimeout(() => {
      setEditing(true)
      setSwipeX(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }, 500)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null }
    const dx = e.touches[0].clientX - startX.current
    if (dx < 0) setSwipeX(Math.max(dx, -80))
    else if (dx > 5) setSwipeX(0)
  }

  const onTouchEnd = () => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null }
    setSwiping(false)
    if (swipeX < -60) {
      if (navigator.vibrate) navigator.vibrate(40)
      deleteTask(task.id)
    } else setSwipeX(0)
  }

  const commitEdit = () => {
    if (editVal.trim()) editTask(task.id, { title: editVal.trim() })
    else setEditVal(task.title)
    setEditing(false)
  }

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(task.id, newSubtask.trim())
      setNewSubtask('')
    }
  }

  const completedSubs = (task.subtasks ?? []).filter(s => s.isCompleted).length
  const totalSubs = (task.subtasks ?? []).length
  const hasExtras = !!task.note || totalSubs > 0
  const priorityMeta = task.priority ? PRIORITY_COLORS[task.priority] : null

  return (
    // FIX: container com overflow hidden correto para swipe não vazar
    <div
      ref={rowRef}
      className="relative overflow-hidden"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--soft)' }}
    >
      {/* Delete bg — agora corretamente contido */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center"
        style={{ background: '#EF4444', width: 80 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </div>

      {/* Sliding content */}
      <div
        style={{
          background: 'var(--white)',
          transform: `translateX(${swipeX}px)`,
          transition: swiping ? 'none' : 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          opacity: task.isCompleted ? 0.6 : 1,
        }}
      >
        {/* Main row */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >


          {/* Checkbox com animação de completing */}
          <button
            onClick={handleCheck}
            className={`flex-shrink-0 w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 ${popping ? 'check-pop' : ''}`}
            style={{
              background: task.isCompleted ? 'var(--ink)' : 'transparent',
              borderColor: task.isCompleted ? 'var(--ink)' : 'var(--line)',
              transform: completing ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            {task.isCompleted && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Title */}
          {editing ? (
            <input
              ref={inputRef}
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => { if (e.key === 'Enter') commitEdit() }}
              className="inline-edit flex-1 text-[15px]"
              style={{ color: 'var(--ink)' }}
            />
          ) : (
            <span
              className="flex-1 text-[15px] select-none"
              style={{
                color: task.isCompleted ? 'var(--muted)' : 'var(--ink)',
                // FIX: strikethrough animado
                textDecoration: task.isCompleted ? 'line-through' : 'none',
                textDecorationColor: 'var(--muted)',
                transition: 'color 0.2s, text-decoration 0.3s',
              }}
            >
              {task.title}
              {task.recurrence && task.recurrence !== 'none' && (
                <span className="ml-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
                  {task.recurrence === 'daily' ? '🔁' : '📅'}
                </span>
              )}
            </span>
          )}

          {/* Right actions — FIX: só mostra se há algo a mostrar */}
          {!editing && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Nota — só aparece se a tarefa TEM nota */}
              {!!task.note && (
                <button
                  onClick={() => setShowNote(v => !v)}
                  className="p-1.5 rounded-lg active:scale-90 transition-transform"
                  style={{ color: showNote ? 'var(--ink)' : 'var(--muted)', background: showNote ? 'var(--soft)' : 'transparent' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </button>
              )}

              {/* Subtarefas — só mostra chevron se há subtarefas OU se está expandido */}
              {(totalSubs > 0 || expanded) && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  className="p-1.5 rounded-lg active:scale-90 transition-transform flex items-center gap-1"
                  style={{ color: 'var(--muted)' }}
                >
                  {totalSubs > 0 && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: completedSubs === totalSubs ? '#DCFCE7' : 'var(--soft)',
                        color: completedSubs === totalSubs ? '#16A34A' : 'var(--muted)',
                      }}
                    >
                      {completedSubs}/{totalSubs}
                    </span>
                  )}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
              )}

              {/* Botão para adicionar subtarefa (sempre acessível via "+" pequeno) */}
              {!expanded && (
                <button
                  onClick={() => setExpanded(true)}
                  className="p-1.5 rounded-lg active:scale-90 transition-transform"
                  style={{ color: 'var(--muted)' }}
                  title="Adicionar subtarefa"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Nota expandida */}
        {showNote && task.note && (
          <div className="px-4 pb-3 -mt-1">
            <p className="text-[12px] px-3 py-2 rounded-xl" style={{ color: 'var(--muted)', background: 'var(--soft)' }}>
              📝 {task.note}
            </p>
          </div>
        )}

        {/* Subtarefas */}
        {expanded && (
          <div className="px-4 pb-3 space-y-1.5">
            <div className="h-px mb-2" style={{ background: 'var(--soft)' }} />

            {(task.subtasks ?? []).map(sub => (
              <div key={sub.id} className="flex items-center gap-2.5 group">
                <button
                  onClick={() => toggleSubtask(task.id, sub.id)}
                  className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: sub.isCompleted ? 'var(--ink)' : 'var(--line)',
                    background: sub.isCompleted ? 'var(--ink)' : 'transparent',
                  }}
                >
                  {sub.isCompleted && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <span
                  className="flex-1 text-[13px]"
                  style={{
                    color: sub.isCompleted ? 'var(--muted)' : 'var(--ink)',
                    textDecoration: sub.isCompleted ? 'line-through' : 'none',
                  }}
                >
                  {sub.title}
                </span>
                <button
                  onClick={() => deleteSubtask(task.id, sub.id)}
                  className="p-1 active:scale-90 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--muted)' }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}

            {/* Add subtask input */}
            <div className="flex items-center gap-2 pt-1">
              <div className="w-4 h-4 rounded border flex-shrink-0" style={{ borderColor: 'var(--line)' }} />
              <input
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Nova subtarefa..."
                className="flex-1 text-[13px] outline-none bg-transparent"
                style={{ color: 'var(--ink)' }}
              />
              {newSubtask.trim() && (
                <button
                  onClick={handleAddSubtask}
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full active:scale-90"
                  style={{ background: 'var(--ink)', color: 'var(--paper)' }}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
