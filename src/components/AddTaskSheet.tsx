import { useState } from 'react'
import { useStore } from '../store/useStore'
import { TaskPriority, TaskRecurrence } from '../models/types'

interface Props { onClose: () => void }

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'Alta',  label: '🔴 Alta',  color: '#EF4444' },
  { value: 'Média', label: '🟡 Média', color: '#F59E0B' },
  { value: 'Baixa', label: '🟢 Baixa', color: '#10B981' },
]

const RECURRENCE_OPTIONS: { value: TaskRecurrence; label: string; icon: string }[] = [
  { value: 'none',   label: 'Única',   icon: '1️⃣' },
  { value: 'daily',  label: 'Diária',  icon: '🔁' },
  { value: 'weekly', label: 'Semanal', icon: '📅' },
]

export default function AddTaskSheet({ onClose }: Props) {
  const { goals, addTask } = useStore()
  const [title, setTitle] = useState('')
  const [selectedGoalId, setSelectedGoalId] = useState(goals.filter(g => !g.isArchived)[0]?.id ?? '')
  const [priority, setPriority] = useState<TaskPriority>('Média')
  const [recurrence, setRecurrence] = useState<TaskRecurrence>('none')
  const [note, setNote] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const activeGoals = goals.filter(g => !g.isArchived)

  const handleSave = () => {
    if (!title.trim() || !selectedGoalId) return
    addTask(selectedGoalId, title.trim(), undefined, priority, recurrence, note.trim() || undefined)
    if (navigator.vibrate) navigator.vibrate(30)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose} />

      <div
        className="relative rounded-t-3xl sheet-enter flex flex-col"
        style={{ background: 'var(--paper)', maxHeight: '92dvh', paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}
      >
        <div className="px-6 pt-5 pb-0 flex-shrink-0">
          <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--line)' }} />
          <h2 className="font-display text-2xl mb-4" style={{ color: 'var(--ink)' }}>Nova Tarefa</h2>
        </div>

        <div className="overflow-y-auto scroll-area flex-1 px-6 space-y-5">
          {/* Goal selector */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Vincular à meta</p>
            {activeGoals.length === 0 ? (
              <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>Crie uma meta primeiro</p>
            ) : (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {activeGoals.map(g => (
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
          </div>

          {/* Title */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Descrição</p>
            <input
              autoFocus
              type="text"
              placeholder="Ex: Correr 30 minutos"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="w-full px-4 py-3.5 rounded-xl text-[16px] outline-none"
              style={{ background: 'var(--white)', color: 'var(--ink)' }}
            />
          </div>

          {/* Priority */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Prioridade</p>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setPriority(opt.value)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all active:scale-95"
                  style={{
                    background: priority === opt.value ? opt.color + '20' : 'var(--white)',
                    color: priority === opt.value ? opt.color : 'var(--muted)',
                    border: `1.5px solid ${priority === opt.value ? opt.color : 'transparent'}`,
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Recorrência</p>
            <div className="flex gap-2">
              {RECURRENCE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setRecurrence(opt.value)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all active:scale-95 flex flex-col items-center gap-0.5"
                  style={{
                    background: recurrence === opt.value ? 'var(--ink)' : 'var(--white)',
                    color: recurrence === opt.value ? 'var(--paper)' : 'var(--muted)',
                  }}>
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center gap-2 text-[13px]"
            style={{ color: 'var(--muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
            {showAdvanced ? 'Ocultar nota' : 'Adicionar nota (opcional)'}
          </button>

          {showAdvanced && (
            <div>
              <textarea
                placeholder="Detalhes extras sobre esta tarefa..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-3.5 rounded-xl text-[15px] outline-none resize-none"
                style={{ background: 'var(--white)', color: 'var(--ink)' }}
              />
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!title.trim() || !selectedGoalId}
            className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'var(--ink)', color: 'var(--paper)' }}
          >
            Adicionar Tarefa
          </button>

          <div className="h-2" />
        </div>
      </div>
    </div>
  )
}
