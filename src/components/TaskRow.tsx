import { useState, useRef } from 'react'
import { DailyTask, Goal, CATEGORY_META } from '../models/types'
import { useStore } from '../store/useStore'

interface Props {
  task: DailyTask
  goal?: Goal
  showGoalBadge?: boolean
}

export default function TaskRow({ task, goal, showGoalBadge = false }: Props) {
  const { toggleTask, deleteTask } = useStore()
  const [popping, setPopping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef(0)

  const handleCheck = () => {
    setPopping(true)
    setTimeout(() => setPopping(false), 250)
    toggleTask(task.id)
  }

  // Swipe to delete
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setSwiping(true)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current
    if (dx < 0) setSwipeX(Math.max(dx, -80))
  }
  const onTouchEnd = () => {
    setSwiping(false)
    if (swipeX < -60) {
      deleteTask(task.id)
    } else {
      setSwipeX(0)
    }
  }

  const meta = goal ? CATEGORY_META[goal.category] : null

  return (
    <div className="relative overflow-hidden">
      {/* Delete bg */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end px-5 bg-red-500 w-20">
        <span className="text-white text-sm font-medium">Excluir</span>
      </div>

      {/* Row */}
      <div
        className="relative bg-white flex items-center gap-3.5 px-4 py-3.5"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swiping ? 'none' : 'transform 0.25s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Checkbox */}
        <button
          onClick={handleCheck}
          className={`flex-shrink-0 w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center transition-colors duration-150 ${popping ? 'check-pop' : ''} ${
            task.isCompleted
              ? 'bg-ink border-ink'
              : 'bg-transparent border-line'
          }`}
        >
          {task.isCompleted && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Text */}
        <span className={`flex-1 text-[15px] transition-all duration-200 ${task.isCompleted ? 'text-muted line-through' : 'text-ink'}`}>
          {task.title}
        </span>

        {/* Goal badge */}
        {showGoalBadge && goal && meta && (
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ color: meta.color, backgroundColor: meta.bg }}
          >
            {goal.emoji}
          </span>
        )}
      </div>
    </div>
  )
}
