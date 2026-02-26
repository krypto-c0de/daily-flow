import { useState } from 'react'
import { GoalCategory, CATEGORY_META } from '../models/types'
import { useStore } from '../store/useStore'

interface Props { onClose: () => void }

const EMOJIS = ['🎯','💪','📚','💰','🏃','🧘','✍️','🎨','🎵','🌱','🚀','❤️','🧠','🌍','👨‍💻']
const CATEGORIES = Object.keys(CATEGORY_META) as GoalCategory[]

export default function AddGoalSheet({ onClose }: Props) {
  const { addGoal } = useStore()
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [category, setCategory] = useState<GoalCategory>('Pessoal')
  const [hasDate, setHasDate] = useState(false)
  const [targetDate, setTargetDate] = useState('')

  const handleSave = () => {
    if (!title.trim()) return
    addGoal(title.trim(), emoji, category, hasDate && targetDate ? new Date(targetDate).toISOString() : undefined)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-paper rounded-t-3xl sheet-enter safe-bottom max-h-[90dvh] flex flex-col">
        <div className="p-6 pb-0">
          <div className="w-10 h-1 bg-line rounded-full mx-auto mb-6" />
          <h2 className="font-display text-2xl text-ink mb-5">Nova Meta</h2>
        </div>

        <div className="overflow-y-auto scroll-area flex-1 px-6 pb-6 space-y-5">
          {/* Emoji */}
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">Emoji</p>
            <div className="grid grid-cols-5 gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`h-12 text-2xl rounded-xl flex items-center justify-center transition-all duration-150 ${
                    emoji === e ? 'bg-ink scale-105' : 'bg-white'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">Nome da meta</p>
            <input
              autoFocus
              type="text"
              placeholder="Ex: Correr 5km por dia"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 bg-white rounded-xl text-[16px] text-ink placeholder-muted outline-none focus:ring-2 focus:ring-ink/10"
            />
          </div>

          {/* Category */}
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">Categoria</p>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => {
                const m = CATEGORY_META[cat]
                const active = category === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className="py-3 rounded-xl text-[13px] font-medium flex flex-col items-center gap-1 transition-all duration-150"
                    style={{
                      backgroundColor: active ? m.color : '#fff',
                      color: active ? '#fff' : '#1A1A1A',
                    }}
                  >
                    <span>{m.icon}</span>
                    <span>{cat}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target date */}
          <div className="bg-white rounded-xl p-4">
            <label className="flex items-center justify-between">
              <span className="text-[15px] font-medium text-ink">Definir prazo</span>
              <button
                onClick={() => setHasDate(v => !v)}
                className={`w-11 h-6 rounded-full transition-colors duration-200 ${hasDate ? 'bg-ink' : 'bg-line'} relative`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${hasDate ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
            {hasDate && (
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="mt-3 w-full px-3 py-2.5 bg-paper rounded-xl text-[15px] text-ink outline-none"
              />
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-40 bg-ink text-white"
          >
            Criar Meta
          </button>
        </div>
      </div>
    </div>
  )
}
