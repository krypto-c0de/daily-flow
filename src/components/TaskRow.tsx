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

  const startX = useRef(0)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  const handleCheck = () => {
    if (swipeX !== 0) return
    setPopping(true)
    setTimeout(() => setPopping(false), 300)
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
    <div
      ref={rowRef}
      className="relative overflow-hidden"
      style={{}}
    >
      {/* Delete bg */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center"
        style={{
          background: '#EF4444',
          width: 80,
          opacity: swipeX < -2 ? 1 : 0,
          transform: swipeX < -2 ? 'translateX(0)' : 'translateX(80px)',
          transition: 'opacity 0.12s ease, transform 0.12s ease',
          pointerEvents: 'none',
        }}
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
          width: '100%',
          background: 'var(--white)',
          borderBottom: isLast ? 'none' : '1px solid var(--soft)',
          transform: `translateX(${swipeX}px)`,
          transition: swiping ? 'none' : 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Main row */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Checkbox */}
          <button
            onClick={handleCheck}
            className={`flex-shrink-0 w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 ${popping ? 'check-pop' : ''}`}
            style={{
              background: task.isCompleted ? 'var(--white)' : 'transparent',
              borderColor: task.isCompleted ? '#34C759' : 'var(--line)',
              color: task.isCompleted ? '#34C759' : 'var(--muted)',
            }}
          >
            {task.isCompleted && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
                textDecoration: task.isCompleted ? 'line-through' : 'none',
                textDecorationColor: 'var(--muted)',
                transition: 'color 0.2s',
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

          {/* Right actions */}
          {!editing && (
            <div className="flex items-center gap-1 flex-shrink-0">
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
              )}

              {priorityMeta && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: priorityMeta.bg, color: priorityMeta.text }}
                >
                  {priorityMeta.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Note */}
        {showNote && task.note && (
          <div className="px-4 pb-3 pt-0 ml-[46px]">
            <p className="text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>{task.note}</p>
          </div>
        )}

        {/* Subtasks */}
        {expanded && (
          <div className="px-4 pb-3 ml-[46px] space-y-2">
            {(task.subtasks ?? []).map(sub => (
              <div key={sub.id} className="flex items-center gap-2 group">
                <button
                  onClick={() => toggleSubtask(task.id, sub.id)}
                  className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all"
                  style={{
                    background: sub.isCompleted ? 'var(--white)' : 'transparent',
                    borderColor: sub.isCompleted ? '#34C759' : 'var(--line)',
                    color: sub.isCompleted ? '#34C759' : 'var(--muted)',
                  }}
                >
                  {sub.isCompleted && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
