import { Goal, CATEGORY_META } from '../models/types'
import { useStore } from '../store/useStore'

interface Props {
  goal: Goal
  onDelete: (id: string) => void
}

export default function GoalCard({ goal, onDelete }: Props) {
  const { tasksForDate } = useStore()
  const today = new Date().toISOString().slice(0, 10)
  const todayTasks = tasksForDate(today).filter(t => t.goalId === goal.id)
  const meta = CATEGORY_META[goal.category]

  const targetLabel = goal.targetDate
    ? new Date(goal.targetDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Meta contínua'

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm fade-up">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: meta.bg }}
        >
          {goal.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-semibold text-ink leading-snug">{goal.title}</h3>
          <span
            className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ color: meta.color, backgroundColor: meta.bg }}
          >
            {goal.category}
          </span>
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="text-muted text-lg leading-none p-1 -mr-1 active:scale-90 transition-transform"
          aria-label="Excluir meta"
        >
          ×
        </button>
      </div>

      <div className="h-px bg-soft my-3" />

      <div className="flex items-center justify-between text-[12px] text-muted">
        <span>{goal.targetDate ? `⏰ ${targetLabel}` : `∞ ${targetLabel}`}</span>
        <span
          className="font-medium px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: meta.bg, color: meta.color }}
        >
          {todayTasks.length} tarefa{todayTasks.length !== 1 ? 's' : ''} hoje
        </span>
      </div>
    </div>
  )
}
