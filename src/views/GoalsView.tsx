import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Goal, CATEGORY_META, GoalCategory } from '../models/types'
import AddGoalSheet from '../components/AddGoalSheet'
import DatePicker from '../components/DatePicker'
import Toggle from '../components/Toggle'

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
    if (navigator.vibrate) navigator.vibrate(20)
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
              <Toggle checked={hasDate} onChange={() => setHasDate(v => !v)} />
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
  const { goals, deleteGoal, archiveGoal, unarchiveGoal, tasksForDate } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  const activeGoals = goals.filter(g => !g.isArchived)
  const archivedGoals = goals.filter(g => g.isArchived)

  const GoalCard = ({ goal, archived = false }: { goal: Goal; archived?: boolean }) => {
    const meta = CATEGORY_META[goal.category]
    const todayTasks = tasksForDate(today).filter(t => t.goalId === goal.id)
    const targetLabel = goal.targetDate
      ? new Date(goal.targetDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Meta contínua'

    return (
      <div className="rounded-2xl p-4 shadow-sm" style={{ background: archived ? 'var(--soft)' : 'var(--white)', opacity: archived ? 0.7 : 1 }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: meta.bg }}>
            {goal.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-semibold leading-snug" style={{ color: 'var(--ink)' }}>{goal.title}</h3>
            <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ color: meta.color, background: meta.bg }}>{goal.category}</span>
          </div>

          <div className="flex items-center gap-0.5">
            {!archived && (
              <button onClick={() => setEditingGoal(goal)}
                className="p-1.5 rounded-lg active:scale-90 transition-transform" style={{ color: 'var(--muted)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}

            <button
              onClick={() => archived ? unarchiveGoal(goal.id) : archiveGoal(goal.id)}
              className="p-1.5 rounded-lg active:scale-90 transition-transform"
              style={{ color: 'var(--muted)' }}
              title={archived ? 'Restaurar' : 'Arquivar'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {archived
                  ? <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>
                  : <><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></>
                }
              </svg>
            </button>

            <button onClick={() => deleteGoal(goal.id)}
              className="p-1.5 rounded-lg active:scale-90 transition-transform" style={{ color: 'var(--muted)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="h-px my-2" style={{ background: 'var(--soft)' }} />
        <div className="flex items-center justify-between text-[12px]" style={{ color: 'var(--muted)' }}>
          <span>{goal.targetDate ? `⏰ ${targetLabel}` : `∞ ${targetLabel}`}</span>
          <span className="font-medium px-2.5 py-1 rounded-lg" style={{ background: meta.bg, color: meta.color }}>
            {todayTasks.length} tarefa{todayTasks.length !== 1 ? 's' : ''} hoje
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-shrink-0 px-5 pb-2" style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)', background: 'var(--paper)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Planejamento</p>
            <h1 className="font-display text-3xl mt-0.5" style={{ color: 'var(--ink)' }}>Metas</h1>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xl leading-none mt-1 active:scale-90 transition-transform"
            style={{ background: 'var(--ink)' }}>+</button>
        </div>
      </div>

      <div className="flex-1 scroll-area px-5 pt-2 space-y-3" style={{ paddingBottom: 'calc(var(--safe-bottom) + 1rem)' }}>
        {activeGoals.length === 0 && archivedGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-4 fade-up">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl" style={{ background: 'var(--soft)' }}>
              🎯
            </div>
            <div className="text-center">
              <p className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>Nenhuma meta ainda</p>
              <p className="text-[14px] mt-1 text-center" style={{ color: 'var(--muted)' }}>
                Crie metas para organizar<br />suas tarefas diárias
              </p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="px-6 py-3 rounded-2xl text-[15px] font-semibold active:scale-95 transition-transform"
              style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
              Criar primeira meta
            </button>
          </div>
        ) : (
          <>
            {activeGoals.map((goal, i) => (
              <div key={goal.id} className={`fade-up fade-up-${Math.min(i + 1, 5)}`}>
                <GoalCard goal={goal} />
              </div>
            ))}

            {/* Archived section */}
            {archivedGoals.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setShowArchived(v => !v)}
                  className="flex items-center gap-2 text-[13px] font-medium px-1 mb-3"
                  style={{ color: 'var(--muted)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: showArchived ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                  Arquivadas ({archivedGoals.length})
                </button>

                {showArchived && (
                  <div className="space-y-3 fade-up">
                    {archivedGoals.map(goal => <GoalCard key={goal.id} goal={goal} archived />)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        <div className="h-4" />
      </div>

      {showAdd && <AddGoalSheet onClose={() => setShowAdd(false)} />}
      {editingGoal && <EditGoalSheet goal={editingGoal} onClose={() => setEditingGoal(null)} />}
    </div>
  )
}
