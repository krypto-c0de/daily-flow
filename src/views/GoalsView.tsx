import { useState } from 'react'
import { useStore } from '../store/useStore'
import GoalCard from '../components/GoalCard'
import AddGoalSheet from '../components/AddGoalSheet'

export default function GoalsView() {
  const { goals, deleteGoal } = useStore()
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-safe pt-4 pb-2 bg-paper flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-muted uppercase tracking-widest">Planejamento</p>
          <h1 className="font-display text-3xl text-ink mt-0.5">Metas Futuras</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 bg-ink rounded-full flex items-center justify-center text-white text-xl leading-none mt-1 active:scale-90 transition-transform"
        >
          +
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scroll-area px-5 pb-safe pt-2 space-y-3">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 gap-3 fade-up">
            <span className="text-5xl">🎯</span>
            <p className="text-[17px] font-semibold text-ink">Nenhuma meta ainda</p>
            <p className="text-[14px] text-muted text-center">Crie metas para organizar<br />suas tarefas diárias</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-2 px-6 py-3 bg-ink text-white rounded-2xl text-[15px] font-semibold active:scale-95 transition-transform"
            >
              Criar primeira meta
            </button>
          </div>
        ) : (
          goals.map((goal, i) => (
            <div key={goal.id} className={`fade-up fade-up-${Math.min(i + 1, 5)}`}>
              <GoalCard goal={goal} onDelete={deleteGoal} />
            </div>
          ))
        )}
        <div className="h-4" />
      </div>

      {showAdd && <AddGoalSheet onClose={() => setShowAdd(false)} />}
    </div>
  )
}
