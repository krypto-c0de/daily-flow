import { useState } from 'react'
import { TaskPriority, PRIORITY_META } from '../models/types'
import { useStore } from '../store/useStore'

interface Props { onClose: () => void }

export default function AddTaskSheet({ onClose }: Props) {
  const { goals, addTask } = useStore()
  const [title,          setTitle]          = useState('')
  const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id ?? '')
  const [priority,       setPriority]       = useState<TaskPriority>('media')
  const [recurrent,      setRecurrent]      = useState(false)

  const handleSave = () => {
    if (!title.trim() || !selectedGoalId) return
    addTask(selectedGoalId, title.trim(), priority, recurrent)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose} />
      <div className="relative rounded-t-3xl p-6 sheet-enter" style={{ background: 'var(--paper)', paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: 'var(--line)' }} />
        <h2 className="font-display text-2xl mb-5" style={{ color: 'var(--ink)' }}>Nova Tarefa</h2>

        {/* Goal */}
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Meta</p>
        {goals.length === 0 ? (
          <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>Crie uma meta primeiro</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
            {goals.map(g => (
              <button key={g.id} onClick={() => setSelectedGoalId(g.id)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-[13px] font-medium border transition-all active:scale-95"
                style={{ background: selectedGoalId === g.id ? 'var(--ink)' : 'var(--white)', color: selectedGoalId === g.id ? 'var(--paper)' : 'var(--ink)', borderColor: selectedGoalId === g.id ? 'var(--ink)' : 'var(--line)' }}>
                <span>{g.emoji}</span><span className="max-w-[110px] truncate">{g.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Title */}
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Descrição</p>
        <input autoFocus type="text" placeholder="Ex: Correr 30 minutos" value={title}
          onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="w-full px-4 py-3.5 rounded-xl text-[16px] outline-none mb-4"
          style={{ background: 'var(--white)', color: 'var(--ink)' }} />

        {/* Priority */}
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Prioridade</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(Object.entries(PRIORITY_META) as [TaskPriority, typeof PRIORITY_META[TaskPriority]][]).map(([key, m]) => (
            <button key={key} onClick={() => setPriority(key)}
              className="py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95 border"
              style={{
                background: priority === key ? m.color + '20' : 'var(--white)',
                borderColor: priority === key ? m.color : 'var(--line)',
                color: priority === key ? m.color : 'var(--ink)',
              }}>
              {m.dot} {m.label}
            </button>
          ))}
        </div>

        {/* Recurrent toggle */}
        <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-5"
          style={{ background: 'var(--white)' }}>
          <div>
            <p className="text-[14px] font-medium" style={{ color: 'var(--ink)' }}>Repetir todo dia ↻</p>
            <p className="text-[11px]" style={{ color: 'var(--muted)' }}>Aparece automaticamente no checklist</p>
          </div>
          <button onClick={() => setRecurrent(v => !v)}
            className="w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0"
            style={{ background: recurrent ? 'var(--ink)' : 'var(--line)' }}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${recurrent ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <button onClick={handleSave} disabled={!title.trim() || !selectedGoalId}
          className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
          Adicionar Tarefa
        </button>
      </div>
    </div>
  )
}
