import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Goal, CATEGORY_META, GoalCategory } from '../models/types'
import AddGoalSheet from '../components/AddGoalSheet'
import DatePicker from '../components/DatePicker'

const EMOJIS = ['🎯','💪','📚','💰','🏃','🧘','✍️','🎨','🎵','🌱','🚀','❤️','🧠','🌍','👨‍💻']
const CATEGORIES = Object.keys(CATEGORY_META) as GoalCategory[]

function EditGoalSheet({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const { editGoal } = useStore()
  const [title, setTitle]   = useState(goal.title)
  const [emoji, setEmoji]   = useState(goal.emoji)
  const [category, setCategory] = useState<GoalCategory>(goal.category)
  const [hasDate, setHasDate] = useState(!!goal.targetDate)
  const [targetDate, setTargetDate] = useState(goal.targetDate ? goal.targetDate.slice(0, 10) : '')

  const handleSave = () => {
    if (!title.trim()) return
    editGoal(goal.id, {
      title: title.trim(), emoji, category,
      targetDate: hasDate && targetDate ? new Date(targetDate).toISOString() : undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose} />
      <div className="relative rounded-t-3xl sheet-enter flex flex-col" style={{ background: 'var(--paper)', maxHeight: '92dvh' }}>
        <div className="px-6 pt-5 pb-0 flex-shrink-0">
          <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--line)' }} />
          <h2 className="font-display text-2xl mb-4" style={{ color: 'var(--ink)' }}>Editar Meta</h2>
        </div>
        <div className="overflow-y-auto scroll-area flex-1 px-6 pb-8 space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>EMOJI</p>
            <div className="grid grid-cols-5 gap-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className="h-12 text-2xl rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{ background: emoji === e ? 'var(--ink)' : 'var(--soft)' }}>{e}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>NOME</p>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl text-[16px] outline-none"
              style={{ background: 'var(--white)', color: 'var(--ink)' }} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>CATEGORIA</p>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => {
                const m = CATEGORY_META[cat]
                const active = category === cat
                return (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className="py-3 rounded-xl text-[13px] font-medium flex flex-col items-center gap-1 transition-all active:scale-95"
                    style={{ background: active ? m.color : 'var(--white)', color: active ? '#fff' : 'var(--ink)' }}>
                    <span>{m.icon}</span><span>{cat}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'var(--white)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium" style={{ color: 'var(--ink)' }}>Definir prazo</span>
              <button onClick={() => setHasDate(v => !v)}
                className="w-11 h-6 rounded-full relative transition-colors duration-200"
                style={{ background: hasDate ? 'var(--ink)' : 'var(--line)' }}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${hasDate ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {hasDate && <div className="mt-3"><DatePicker value={targetDate} onChange={setTargetDate} /></div>}
          </div>
          <button onClick={handleSave} disabled={!title.trim()}
            className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GoalsView() {
  const { goals, deleteGoal, tasksForDate } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-5 pb-2" style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)', background: 'var(--paper)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Planejamento</p>
            <h1 className="font-display text-3xl mt-0.5" style={{ color: 'var(--ink)' }}>Metas Futuras</h1>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xl leading-none mt-1 active:scale-90 transition-transform"
            style={{ background: 'var(--ink)' }}>+</button>
        </div>
      </div>

      <div className="flex-1 scroll-area px-5 pt-2 space-y-3" style={{ paddingBottom: 'calc(var(--safe-bottom) + 1rem)' }}>
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 gap-3 fade-up">
            <span className="text-5xl">🎯</span>
            <p className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>Nenhuma meta ainda</p>
            <p className="text-[14px] text-center" style={{ color: 'var(--muted)' }}>Crie metas para organizar<br />suas tarefas diárias</p>
            <button onClick={() => setShowAdd(true)}
              className="mt-2 px-6 py-3 rounded-2xl text-[15px] font-semibold active:scale-95 transition-transform"
              style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
              Criar primeira meta
            </button>
          </div>
        ) : (
          goals.map((goal, i) => {
            const meta = CATEGORY_META[goal.category]
            const todayTasks = tasksForDate(today).filter(t => t.goalId === goal.id)
            const targetLabel = goal.targetDate
              ? new Date(goal.targetDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'Meta contínua'

            return (
              <div key={goal.id} className={`rounded-2xl p-4 shadow-sm fade-up fade-up-${Math.min(i+1,5)}`} style={{ background: 'var(--white)' }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: meta.bg }}>
                    {goal.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-semibold leading-snug" style={{ color: 'var(--ink)' }}>{goal.title}</h3>
                    <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ color: meta.color, background: meta.bg }}>{goal.category}</span>
                  </div>
                  {/* Edit button (#7) */}
                  <button onClick={() => setEditingGoal(goal)}
                    className="p-1.5 rounded-lg active:scale-90 transition-transform" style={{ color: 'var(--muted)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 rounded-lg active:scale-90 transition-transform" style={{ color: 'var(--muted)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>
                <div className="h-px my-2" style={{ background: 'var(--soft)' }} />
                <div className="flex items-center justify-between text-[12px]" style={{ color: 'var(--muted)' }}>
                  <span>{goal.targetDate ? `⏰ ${targetLabel}` : `∞ ${targetLabel}`}</span>
                  <span className="font-medium px-2.5 py-1 rounded-lg"
                    style={{ background: meta.bg, color: meta.color }}>
                    {todayTasks.length} tarefa{todayTasks.length !== 1 ? 's' : ''} hoje
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div className="h-4" />
      </div>

      {showAdd && <AddGoalSheet onClose={() => setShowAdd(false)} />}
      {editingGoal && <EditGoalSheet goal={editingGoal} onClose={() => setEditingGoal(null)} />}
    </div>
  )
}
