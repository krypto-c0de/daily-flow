import { useState, useRef } from 'react'
import { DailyTask, Goal } from '../models/types'
import { useStore } from '../store/useStore'

interface Props {
  task: DailyTask
  goal?: Goal
  isLast?: boolean
}

export default function TaskRow({ task, goal, isLast }: Props) {
  const { toggleTask, deleteTask, editTask } = useStore()
  const [popping, setPopping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(task.title)

  const startX = useRef(0)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCheck = () => {
    if (swipeX !== 0) return
    setPopping(true)
    setTimeout(() => setPopping(false), 250)
    toggleTask(task.id)
  }

  // Fix #1 — swipe using transform only, no overflow clip needed
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setSwiping(true)
    // Long press → edit (#7)
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
    if (swipeX < -60) deleteTask(task.id)
    else setSwipeX(0)
  }

  const commitEdit = () => {
    if (editVal.trim()) editTask(task.id, editVal.trim())
    else setEditVal(task.title)
    setEditing(false)
  }

  return (
    <div
      className="relative"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--soft)' }}
    >
      {/* Delete bg — sits behind, no overflow clip needed */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-5"
        style={{ background: '#EF4444', borderRadius: 0, width: 80 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </div>

      {/* Row */}
      <div
        style={{
          background: 'var(--white)',
          transform: `translateX(${swipeX}px)`,
          transition: swiping ? 'none' : 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
        className="flex items-center gap-3.5 px-4 py-3.5"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Checkbox */}
        <button
          onClick={handleCheck}
          className={`flex-shrink-0 w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center transition-colors duration-150 ${popping ? 'check-pop' : ''}`}
          style={{
            background: task.isCompleted ? 'var(--ink)' : 'transparent',
            borderColor: task.isCompleted ? 'var(--ink)' : 'var(--line)',
          }}
        >
          {task.isCompleted && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Title or inline edit */}
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
            className="flex-1 text-[15px] transition-all duration-200 select-none"
            style={{
              color: task.isCompleted ? 'var(--muted)' : 'var(--ink)',
              textDecoration: task.isCompleted ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </span>
        )}

        {/* Goal emoji badge */}
        {goal && !editing && (
          <span className="text-base flex-shrink-0 opacity-60">{goal.emoji}</span>
        )}
      </div>
    </div>
  )
}
