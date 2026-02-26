import { useState } from 'react'
import { GoalCategory, CATEGORY_META } from '../models/types'
import { useStore } from '../store/useStore'
import DatePicker from './DatePicker'

interface Props { onClose: () => void }

const EMOJIS = ['🎯','💪','📚','💰','🏃','🧘','✍️','🎨','🎵','🌱','🚀','❤️','🧠','🌍','👨‍💻']
const CATEGORIES = Object.keys(CATEGORY_META) as GoalCategory[]

export default function AddGoalSheet({ onClose }: Props) {
  const { addGoal } = useStore()
  const [title, setTitle]     = useState('')
  const [emoji, setEmoji]     = useState('🎯')
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
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose} />

      <div className="relative rounded-t-3xl sheet-enter flex flex-col" style={{ background: 'var(--paper)', maxHeight: '92dvh' }}>
        <div className="px-6 pt-5 pb-0 flex-shrink-0">
          <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--line)' }} />
          <h2 className="font-display text-2xl mb-4" style={{ color: 'var(--ink)' }}>Nova Meta</h2>
        </div>

        <div className="overflow-y-auto scroll-area flex-1 px-6 pb-8 space-y-5">

          {/* Emoji grid */}
          <div>
            <p className="label-xs mb-2" style={{ color: 'var(--muted)' }}>EMOJI</p>
            <div className="grid grid-cols-5 gap-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className="h-12 text-2xl rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90"
                  style={{ background: emoji === e ? 'var(--ink)' : 'var(--soft)' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>NOME DA META</p>
            <input
              autoFocus
              type="text"
              placeholder="Ex: Correr 5km por dia"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl text-[16px] outline-none"
              style={{ background: 'var(--white)', color: 'var(--ink)' }}
            />
          </div>

          {/* Category */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>CATEGORIA</p>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => {
                const m = CATEGORY_META[cat]
                const active = category === cat
                return (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className="py-3 rounded-xl text-[13px] font-medium flex flex-col items-center gap-1 transition-all duration-150 active:scale-95"
                    style={{ background: active ? m.color : 'var(--white)', color: active ? '#fff' : 'var(--ink)' }}>
                    <span>{m.icon}</span>
                    <span>{cat}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target date — Fix #4 custom picker */}
          <div className="rounded-2xl p-4" style={{ background: 'var(--white)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium" style={{ color: 'var(--ink)' }}>Definir prazo</span>
              <button
                onClick={() => setHasDate(v => !v)}
                className="w-11 h-6 rounded-full relative transition-colors duration-200"
                style={{ background: hasDate ? 'var(--ink)' : 'var(--line)' }}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${hasDate ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {hasDate && (
              <div className="mt-3">
                <DatePicker value={targetDate} onChange={setTargetDate} />
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
            Criar Meta
          </button>
        </div>
      </div>
    </div>
  )
}
