import { useState } from 'react'
import { useStore } from '../store/useStore'

interface Props { onClose: () => void }

export default function AddTaskSheet({ onClose }: Props) {
  const { goals, addTask } = useStore()
  const [title, setTitle] = useState('')
  const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id ?? '')

  const handleSave = () => {
    if (!title.trim() || !selectedGoalId) return
    addTask(selectedGoalId, title.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl p-6 sheet-enter safe-bottom">
        {/* Handle */}
        <div className="w-10 h-1 bg-line rounded-full mx-auto mb-6" />

        <h2 className="font-display text-2xl text-ink mb-5">Nova Tarefa</h2>

        {/* Goal selector */}
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">Vincular à meta</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
          {goals.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGoalId(g.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-[13px] font-medium border transition-all duration-150 ${
                selectedGoalId === g.id
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white text-ink border-line'
              }`}
            >
              <span>{g.emoji}</span>
              <span className="max-w-[120px] truncate">{g.title}</span>
            </button>
          ))}
        </div>

        {/* Title input */}
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">Descrição</p>
        <input
          autoFocus
          type="text"
          placeholder="Ex: Correr 30 minutos"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="w-full px-4 py-3.5 bg-paper rounded-xl text-[16px] text-ink placeholder-muted outline-none focus:ring-2 focus:ring-ink/10 mb-5"
        />

        <button
          onClick={handleSave}
          disabled={!title.trim() || !selectedGoalId}
          className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-40 bg-ink text-white"
        >
          Adicionar Tarefa
        </button>
      </div>
    </div>
  )
}
