import { useEffect, useState } from 'react'
import Toggle from '../components/Toggle'
import { useStore } from '../store/useStore'
import { toDateKey, CATEGORY_META } from '../models/types'

function getLast7Days() { return Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return toDateKey(d)}) }
function getLast30Days() { return Array.from({length:30},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(29-i));return toDateKey(d)}) }
function dayLabel(dk: string) {
  if (dk===toDateKey(new Date())) return 'Hoje'
  const d=new Date(dk+'T00:00:00')
  return d.toLocaleDateString('pt-BR',{weekday:'short',day:'numeric'})
}
async function requestNotifications() {
  if (!('Notification' in window)) return false
  if (Notification.permission==='granted') return true
  return (await Notification.requestPermission())==='granted'
}

export default function SummaryView({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { goals, tasksForDate, summaryForDate, reflections, darkMode, toggleDarkMode, notificationsEnabled, toggleNotifications, settings, updateSettings, getCurrentStreak, getLongestStreak } = useStore()
  const [animated, setAnimated] = useState(false)
  const [chartMode, setChartMode] = useState<'7'|'30'>('7')

  const today = toDateKey(new Date())
  const todaySummary = summaryForDate(today)
  const last7 = getLast7Days()
  const last30 = getLast30Days()
  const streak = getCurrentStreak()
  const bestStreak = getLongestStreak()

  useEffect(() => { const t=setTimeout(()=>setAnimated(true),100); return ()=>clearTimeout(t) }, [])

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) { const g=await requestNotifications(); if(g) toggleNotifications() }
    else toggleNotifications()
  }

  const statusEmoji = (() => {
    const p=todaySummary.completionPercentage
    if(p===100)return'🎉';if(p>=75)return'🔥';if(p>=50)return'💪';if(p>=25)return'🌱'
    return todaySummary.totalTasks===0?'✨':'⏳'
  })()

  // Chart data
  const chartDays = chartMode==='7' ? last7 : last30
  const chartData = chartDays.map(dk => ({ dk, pct: summaryForDate(dk).completionPercentage, total: summaryForDate(dk).totalTasks }))
  const maxPct = 100

  // Reflection summary
  const reflectionThisWeek = last7.filter(dk => reflections.some(r=>r.date===dk))
  const avgStars = reflectionThisWeek.length > 0
    ? Math.round(reflectionThisWeek.reduce((sum,dk)=>{ const r=reflections.find(x=>x.date===dk); return sum+(r?.stars??0) },0) / reflectionThisWeek.length * 10) / 10
    : null

  return (
    <div>
      <div className="flex-shrink-0 px-5 pb-2" style={{ paddingTop: '0.5rem', background: 'var(--paper)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'var(--font-system)' }}>Estatísticas</p>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ink)', fontFamily: 'var(--font-system)', marginTop: 2 }}>Resumo</h1>
          </div>
          <button onClick={toggleDarkMode} className="w-9 h-9 rounded-full flex items-center justify-center mt-1 active:scale-90 transition-transform" style={{ background: 'var(--soft)', color: 'var(--ink)', border: 'none', cursor: 'pointer' }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="px-5 pt-2 space-y-4 pb-8">

        {/* Today card */}
        <div className="rounded-2xl p-5 fade-up" style={{ background: 'var(--white)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'var(--font-system)' }}>Hoje</p>
              <p style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, letterSpacing: '-.03em', color: 'var(--ink)', fontFamily: 'var(--font-system)', fontVariantNumeric: 'tabular-nums' }}>{todaySummary.completionPercentage}<span style={{ fontSize: 28, fontWeight: 500 }}>%</span></p>
            </div>
            <div className="text-center flex flex-col items-center gap-2">
              <div style={{ fontSize: 36 }}>{statusEmoji}</div>
              {streak > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: streak>=7?'#FF6B0018':'var(--soft)', color: streak>=7?'#FF6B00':'var(--ink)' }}>
                  <span style={{ fontSize: 12, animation: streak>=3?'flamePulse 1.5s ease-in-out infinite':'none' }}>🔥</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-system)' }}>{streak}d</span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 rounded-xl overflow-hidden" style={{ background: 'var(--paper)' }}>
            {[{v:todaySummary.completedTasks,l:'Feitas'},{v:todaySummary.totalTasks-todaySummary.completedTasks,l:'Pendentes'},{v:todaySummary.totalTasks,l:'Total'}].map(({v,l},i)=>(
              <div key={l} className="flex flex-col items-center py-3 gap-0.5" style={{ borderRight: i<2?'1px solid var(--line)':'none' }}>
                <span style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-system)', color: 'var(--ink)' }}>{v}</span>
                <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-system)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Streaks */}
        <div className="grid grid-cols-2 gap-3 fade-up fade-up-1">
          {[{v:streak,l:'Sequência atual',e:'🔥',sub:'dias seguidos'},{v:bestStreak,l:'Recorde (365d)',e:'🏆',sub:'dias seguidos'}].map(({v,l,e,sub})=>(
            <div key={l} className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: 'var(--white)' }}>
              <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, color: 'var(--muted)', fontFamily: 'var(--font-system)' }}>{l}</span>
              <div className="flex items-end gap-1.5">
                <span style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-system)', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                <span style={{ fontSize: 20, marginBottom: 2 }}>{e}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-system)' }}>{sub}</span>
            </div>
          ))}
        </div>

        {/* Reflection summary */}
        {avgStars !== null && (
          <div className="rounded-2xl p-4 flex items-center gap-4 fade-up fade-up-2" style={{ background: 'var(--white)' }}>
            <div style={{ fontSize: 32 }}>🧘</div>
            <div>
              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, color: 'var(--muted)', fontFamily: 'var(--font-system)', marginBottom: 2 }}>Reflexão esta semana</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-system)' }}>{avgStars} ⭐ de média</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-system)' }}>{reflectionThisWeek.length} de 7 dias registrados</p>
            </div>
          </div>
        )}

        {/* Evolution chart */}
        <div className="rounded-2xl p-4 fade-up fade-up-2" style={{ background: 'var(--white)' }}>
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-system)' }}>Evolução</p>
            <div className="flex gap-1">
              {(['7','30'] as const).map(m => (
                <button key={m} onClick={() => setChartMode(m)} style={{ padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-system)', background: chartMode===m?'var(--ink)':'var(--soft)', color: chartMode===m?'var(--paper)':'var(--muted)', transition: 'all 0.15s' }}>
                  {m}d
                </button>
              ))}
            </div>
          </div>
          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: chartMode==='7'?6:2, height: 80 }}>
            {chartData.map(({dk,pct,total}) => {
              const isToday = dk===today
              const barH = total===0 ? 4 : Math.max(4, (pct/maxPct)*80)
              const color = pct===100?'#34C759':pct>0?'var(--ink)':'var(--line)'
              return (
                <div key={dk} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ width: '100%', height: 80, display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', height: animated?barH:4, background: color, borderRadius: '4px 4px 0 0', opacity: total===0?0.25:1, transition: 'height 0.6s cubic-bezier(0.4,0,0.2,1)', outline: isToday?'2px solid var(--ink)':'none', outlineOffset: 1 }} />
                  </div>
                  {chartMode==='7' && <span style={{ fontSize: 8, color: isToday?'var(--ink)':'var(--muted)', fontWeight: isToday?700:400, fontFamily: 'var(--font-system)' }}>{dayLabel(dk).slice(0,3)}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Last 7 days list */}
        <div className="fade-up fade-up-3">
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'var(--font-system)', marginBottom: 8 }}>Últimos 7 dias</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--white)' }}>
            {last7.map((dk,i)=>{
              const s=summaryForDate(dk); const isToday=dk===today
              const refl=reflections.find(r=>r.date===dk)
              return (
                <div key={dk} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i<6?'1px solid var(--soft)':'none' }}>
                  <span style={{ fontSize: 12, width: 72, flexShrink: 0, fontWeight: isToday?700:400, color: isToday?'var(--ink)':'var(--muted)', fontFamily: 'var(--font-system)' }}>{dayLabel(dk)}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, overflow: 'hidden', background: 'var(--soft)' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: animated?`${s.completionPercentage}%`:'0%', background: s.completionPercentage===100?'#34C759':'var(--ink)', transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
                  </div>
                  {refl && <span style={{ fontSize: 13 }}>{'⭐'.repeat(refl.stars)}</span>}
                  <span style={{ fontSize: 12, fontWeight: 700, width: 32, textAlign: 'right', fontFamily: 'var(--font-system)', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{s.totalTasks===0?'—':`${s.completionPercentage}%`}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 30-day heatmap */}
        <div className="fade-up fade-up-4">
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'var(--font-system)', marginBottom: 8 }}>Calendário (30 dias)</p>
          <div className="rounded-2xl p-4" style={{ background: 'var(--white)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 5 }}>
              {last30.map(dk=>{
                const s=summaryForDate(dk); const isToday=dk===today
                const full=s.completionPercentage===100; const partial=s.completionPercentage>0
                return <div key={dk} title={`${dk}: ${s.completionPercentage}%`} style={{ aspectRatio:'1', borderRadius: 5, background: full?'#34C759':partial?'var(--ink)':'var(--soft)', opacity: full?1:partial?0.4:0.2, outline: isToday?'2px solid var(--ink)':'none', outlineOffset: 1 }} />
              })}
            </div>
            <div className="flex items-center gap-4 mt-3">
              {[{c:'#34C759',o:1,l:'100%'},{c:'var(--ink)',o:0.4,l:'Parcial'},{c:'var(--soft)',o:1,l:'Vazio'}].map(({c,o,l})=>(
                <div key={l} className="flex items-center gap-1.5">
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c, opacity: o }} />
                  <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-system)' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goals breakdown */}
        {goals.filter(g=>!g.isArchived).length>0 && (
          <div className="fade-up fade-up-5">
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'var(--font-system)', marginBottom: 8 }}>Por meta</p>
            <div className="space-y-2">
              {goals.filter(g=>!g.isArchived).map(goal=>{
                const tasks=tasksForDate(today).filter(t=>t.goalId===goal.id)
                const done=tasks.filter(t=>t.isCompleted).length
                const pct=tasks.length>0?Math.round((done/tasks.length)*100):0
                const meta=CATEGORY_META[goal.category]
                return (
                  <div key={goal.id} className="rounded-xl p-3.5 flex items-center gap-3" style={{ background: 'var(--white)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{goal.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-system)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.title}</p>
                      <div style={{ height: 5, borderRadius: 3, overflow: 'hidden', background: 'var(--soft)' }}>
                        <div style={{ height: '100%', borderRadius: 3, width: animated?`${pct}%`:'0%', background: meta.color, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, width: 36, textAlign: 'right', fontFamily: 'var(--font-system)', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{tasks.length===0?'—':`${pct}%`}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="rounded-2xl p-4" style={{ background: 'var(--white)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-system)' }}>🔔 Lembrete diário</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-system)', marginTop: 2 }}>
                Notificação às {String(settings.notificationHour??20).padStart(2,'0')}:{String(settings.notificationMinute??0).padStart(2,'0')}h
              </p>
            </div>
            <Toggle checked={notificationsEnabled} onChange={handleNotificationToggle} />
          </div>
          {notificationsEnabled && (
            <div className="flex gap-2 mt-2">
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontFamily: 'var(--font-system)' }}>Hora</p>
                <input type="number" min="0" max="23" value={settings.notificationHour??20}
                  onChange={e => updateSettings({ notificationHour: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--soft)', color: 'var(--ink)', fontSize: 15, fontFamily: 'var(--font-system)', outline: 'none', textAlign: 'center' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontFamily: 'var(--font-system)' }}>Minuto</p>
                <input type="number" min="0" max="59" value={settings.notificationMinute??0}
                  onChange={e => updateSettings({ notificationMinute: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--soft)', color: 'var(--ink)', fontSize: 15, fontFamily: 'var(--font-system)', outline: 'none', textAlign: 'center' }} />
              </div>
            </div>
          )}
        </div>

        {/* Quote category */}
        <div className="rounded-2xl p-4" style={{ background: 'var(--white)' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-system)', marginBottom: 10 }}>💬 Categoria de citações</p>
          <div className="grid grid-cols-2 gap-2">
            {([['all','Todas'],['motivacional','Motivacional'],['stoic','Estoico'],['productivity','Produtividade']] as const).map(([v,l])=>(
              <button key={v} onClick={()=>updateSettings({quoteCategory:v})} style={{ padding: '10px', borderRadius: 12, border: `1.5px solid ${settings.quoteCategory===v?'var(--ink)':'var(--line)'}`, background: settings.quoteCategory===v?'var(--ink)':'var(--white)', color: settings.quoteCategory===v?'var(--paper)':'var(--ink)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-system)', cursor: 'pointer', transition: 'all 0.15s' }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}
