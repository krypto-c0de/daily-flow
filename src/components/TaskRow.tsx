import { useState, useRef } from 'react'
import { DailyTask, Goal, PRIORITY_META } from '../models/types'
import { useStore } from '../store/useStore'

interface Props { task: DailyTask; goal?: Goal; isLast?: boolean }

export default function TaskRow({ task, goal, isLast }: Props) {
  const { toggleTask, deleteTask, editTask } = useStore()
  const [popping,  setPopping]  = useState(false)
  const [swipeX,   setSwipeX]   = useState(0)
  const [swiping,  setSwiping]  = useState(false)
  const [editing,  setEditing]  = useState(false)
  const [showNote, setShowNote] = useState(false)
  const [editVal,  setEditVal]  = useState(task.title)
  const [noteVal,  setNoteVal]  = useState(task.notes ?? '')

  const startX     = useRef(0)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  const handleCheck = () => {
    if (swipeX !== 0) return
    setPopping(true); setTimeout(() => setPopping(false), 250)
    toggleTask(task.id)
    if ('vibrate' in navigator) navigator.vibrate(8) // #24 haptic
  }

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX; setSwiping(true)
    pressTimer.current = setTimeout(() => {
      setEditing(true); setSwipeX(0)
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
    if (swipeX < -60) deleteTask(task.id)
    else setSwipeX(0)
  }

  const commitEdit = () => {
    if (editVal.trim()) editTask(task.id, { title: editVal.trim() })
    else setEditVal(task.title)
    setEditing(false)
  }

  const commitNote = () => {
    editTask(task.id, { notes: noteVal.trim() || undefined })
    setShowNote(false)
  }

  const pMeta = PRIORITY_META[task.priority]

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--soft)' }}>
      {/* Main row */}
      <div className="relative">
        {/* Delete bg */}
        <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-5 w-20"
          style={{ background: '#EF4444' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </div>

        {/* Row content */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{
            background: 'var(--white)',
            transform: `translateX(${swipeX}px)`,
            transition: swiping ? 'none' : 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          }}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          {/* Priority dot */}
          <span className="text-[10px] flex-shrink-0" title={pMeta.label}>{pMeta.dot}</span>

          {/* Checkbox */}
          <button onClick={handleCheck}
            className={`flex-shrink-0 w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center transition-colors duration-150 ${popping ? 'check-pop' : ''}`}
            style={{ background: task.isCompleted ? 'var(--ink)' : 'transparent', borderColor: task.isCompleted ? 'var(--ink)' : 'var(--line)' }}>
            {task.isCompleted && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Title / edit */}
          {editing ? (
            <input ref={inputRef} value={editVal} onChange={e => setEditVal(e.target.value)}
              onBlur={commitEdit} onKeyDown={e => e.key === 'Enter' && commitEdit()}
              className="inline-edit flex-1 text-[15px]" style={{ color: 'var(--ink)' }} />
          ) : (
            <span className="flex-1 text-[15px] select-none"
              style={{ color: task.isCompleted ? 'var(--muted)' : 'var(--ink)', textDecoration: task.isCompleted ? 'line-through' : 'none' }}>
              {task.title}
            </span>
          )}

          {/* Recurrent badge */}
          {task.recurrent && !editing && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--soft)', color: 'var(--muted)' }}>↻</span>
          )}

          {/* Note toggle */}
          {!editing && (
            <button onClick={() => setShowNote(v => !v)}
              className="flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity"
              style={{ color: task.notes ? 'var(--ink)' : 'var(--muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={task.notes ? 'var(--ink)' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Notes panel */}
      {showNote && (
        <div className="px-4 pb-3 pt-1" style={{ background: 'var(--white)' }}>
          <textarea
            autoFocus
            value={noteVal}
            onChange={e => setNoteVal(e.target.value)}
            onBlur={commitNote}
            placeholder="Adicionar nota..."
            rows={2}
            className="w-full text-[13px] outline-none resize-none rounded-lg px-3 py-2"
            style={{ background: 'var(--soft)', color: 'var(--ink)' }}
          />
        </div>
      )}
    </div>
  )
}
