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
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose} />

      <div className="relative rounded-t-3xl p-6 sheet-enter" style={{ background: 'var(--paper)', paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: 'var(--line)' }} />
        <h2 className="font-display text-2xl mb-5" style={{ color: 'var(--ink)' }}>Nova Tarefa</h2>

        {/* Goal selector */}
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Vincular à meta</p>
        {goals.length === 0 ? (
          <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>Crie uma meta primeiro</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
            {goals.map(g => (
              <button key={g.id} onClick={() => setSelectedGoalId(g.id)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-[13px] font-medium border transition-all duration-150 active:scale-95"
                style={{
                  background: selectedGoalId === g.id ? 'var(--ink)' : 'var(--white)',
                  color: selectedGoalId === g.id ? 'var(--paper)' : 'var(--ink)',
                  borderColor: selectedGoalId === g.id ? 'var(--ink)' : 'var(--line)',
                }}>
                <span>{g.emoji}</span>
                <span className="max-w-[120px] truncate">{g.title}</span>
              </button>
            ))}
          </div>
        )}

        <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Descrição</p>
        <input
          autoFocus
          type="text"
          placeholder="Ex: Correr 30 minutos"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="w-full px-4 py-3.5 rounded-xl text-[16px] outline-none mb-5"
          style={{ background: 'var(--white)', color: 'var(--ink)' }}
        />

        <button onClick={handleSave} disabled={!title.trim() || !selectedGoalId}
          className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
          Adicionar Tarefa
        </button>
      </div>
    </div>
  )
}
