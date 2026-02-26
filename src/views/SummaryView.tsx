import { useEffect, useRef, useState } from 'react'
import { useStore, ACCENT_COLORS, AccentColor } from '../store/useStore'
import { toDateKey, CATEGORY_META } from '../models/types'

function getLast7Days()  { return Array.from({length:7},  (_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return toDateKey(d)}) }
function getLast14Days() { return Array.from({length:14}, (_,i)=>{const d=new Date();d.setDate(d.getDate()-(13-i));return toDateKey(d)}) }
function getLast30Days() { return Array.from({length:30}, (_,i)=>{const d=new Date();d.setDate(d.getDate()-(29-i));return toDateKey(d)}) }

function dayShort(dk: string) {
  const d = new Date(dk+'T00:00:00')
  return d.toLocaleDateString('pt-BR',{weekday:'short'}).slice(0,3)
}

async function requestNotifications() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  return (await Notification.requestPermission()) === 'granted'
}

export default function SummaryView() {
  const { goals, tasksForDate, summaryForDate, darkMode, toggleDarkMode,
          notificationsEnabled, toggleNotifications, accentColor, setAccentColor,
          exportData } = useStore()
  const [animated, setAnimated] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const today   = toDateKey(new Date())
  const s       = summaryForDate(today)
  const last7   = getLast7Days()
  const last14  = getLast14Days()
  const last30  = getLast30Days()

  useEffect(() => { const t = setTimeout(()=>setAnimated(true),100); return ()=>clearTimeout(t) }, [])

  // #18 — Draw evolution line chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const data = last14.map(dk => summaryForDate(dk).completionPercentage)
    const pad  = { t: 10, b: 24, l: 8, r: 8 }
    const w    = W - pad.l - pad.r
    const h    = H - pad.t - pad.b
    const step = w / (data.length - 1)

    // Grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--soft').trim() || '#F0F0EE'
    ctx.lineWidth   = 1
    ;[0, 50, 100].forEach(v => {
      const y = pad.t + h - (v / 100) * h
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke()
    })

    // Fill area
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#1A1A1A'
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + h)
    grad.addColorStop(0, ink.replace('#','') === ink ? ink : ink + '30')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.beginPath()
    data.forEach((v, i) => {
      const x = pad.l + i * step
      const y = pad.t + h - (v / 100) * h
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.lineTo(pad.l + (data.length - 1) * step, pad.t + h)
    ctx.lineTo(pad.l, pad.t + h)
    ctx.closePath(); ctx.fill()

    // Line
    ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'
    ctx.beginPath()
    data.forEach((v, i) => {
      const x = pad.l + i * step, y = pad.t + h - (v / 100) * h
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Dots
    data.forEach((v, i) => {
      const x = pad.l + i * step, y = pad.t + h - (v / 100) * h
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fillStyle = ink; ctx.fill()
    })

    // X labels (every other day)
    ctx.fillStyle = '#9B9B9B'; ctx.font = '9px DM Sans'; ctx.textAlign = 'center'
    last14.forEach((dk, i) => {
      if (i % 2 !== 0) return
      ctx.fillText(dayShort(dk), pad.l + i * step, H - 6)
    })
  }, [animated, darkMode, accentColor, last14, summaryForDate])

  const streak = (() => {
    let count = 0
    for (const dk of [...last30].reverse()) {
      const sv = summaryForDate(dk)
      if (sv.totalTasks > 0 && sv.completionPercentage === 100) count++
      else if (dk !== today) break
    }
    return count
  })()

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      const ok = await requestNotifications()
      if (ok) toggleNotifications()
    } else { toggleNotifications() }
  }

  const handleExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `dailyflow-${today}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const statusEmoji = s.completionPercentage === 100 ? '🎉' : s.completionPercentage >= 75 ? '🔥'
    : s.completionPercentage >= 50 ? '💪' : s.completionPercentage >= 25 ? '🌱'
    : s.totalTasks === 0 ? '✨' : '⏳'

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-5 pb-2"
        style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)', background: 'var(--paper)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Estatísticas</p>
            <h1 className="font-display text-3xl mt-0.5" style={{ color: 'var(--ink)' }}>Resumo</h1>
          </div>
          <button onClick={toggleDarkMode}
            className="w-9 h-9 rounded-full flex items-center justify-center mt-1 active:scale-90 transition-transform"
            style={{ background: 'var(--soft)', color: 'var(--ink)' }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="flex-1 scroll-area px-5 pt-2 space-y-5"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 1rem)' }}>

        {/* Today card */}
        <div className="rounded-2xl p-5 shadow-sm fade-up" style={{ background: 'var(--white)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Hoje</p>
              <p className="font-display text-5xl leading-none mt-1" style={{ color: 'var(--ink)' }}>{s.completionPercentage}%</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-1">{statusEmoji}</div>
              {streak > 0 && (
                <div className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--soft)', color: 'var(--ink)' }}>🔥 {streak} dias</div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x rounded-xl overflow-hidden" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
            {[{v:s.completedTasks,l:'Feitas'},{v:s.totalTasks-s.completedTasks,l:'Pendentes'},{v:s.totalTasks,l:'Total'}].map(({v,l}) => (
              <div key={l} className="flex flex-col items-center py-3 gap-0.5" style={{ borderColor: 'var(--line)' }}>
                <span className="font-display text-2xl" style={{ color: 'var(--ink)' }}>{v}</span>
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* #18 — Line chart */}
        <div className="fade-up fade-up-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--muted)' }}>Evolução (14 dias)</p>
          <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'var(--white)' }}>
            <canvas ref={canvasRef} width={320} height={120} style={{ width:'100%', height:120 }} />
          </div>
        </div>

        {/* Last 7 days bars */}
        <div className="fade-up fade-up-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--muted)' }}>Últimos 7 dias</p>
          <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: 'var(--white)' }}>
            {last7.map((dk, i) => {
              const sv = summaryForDate(dk); const isToday = dk === today
              return (
                <div key={dk} className="flex items-center gap-3 px-4 py-3.5"
                  style={{ borderBottom: i < 6 ? '1px solid var(--soft)' : 'none' }}>
                  <span className={`text-[13px] w-24 flex-shrink-0 ${isToday ? 'font-semibold' : ''}`}
                    style={{ color: isToday ? 'var(--ink)' : 'var(--muted)' }}>
                    {isToday ? 'Hoje' : new Date(dk+'T00:00:00').toLocaleDateString('pt-BR',{weekday:'short',day:'numeric'})}
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--soft)' }}>
                    <div className="h-full rounded-full"
                      style={{ width: animated ? `${sv.completionPercentage}%` : '0%',
                        background: sv.completionPercentage === 100 ? '#4CAF50' : 'var(--ink)',
                        transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
                  </div>
                  <span className="text-[13px] font-semibold w-8 text-right font-display" style={{ color: 'var(--ink)' }}>
                    {sv.totalTasks === 0 ? '—' : `${sv.completionPercentage}%`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 30-day calendar */}
        <div className="fade-up fade-up-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--muted)' }}>Calendário (30 dias)</p>
          <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'var(--white)' }}>
            <div className="grid grid-cols-10 gap-1.5">
              {last30.map(dk => {
                const sv = summaryForDate(dk); const isToday = dk === today
                return (
                  <div key={dk} title={`${dk}: ${sv.completionPercentage}%`}
                    className="aspect-square rounded-md"
                    style={{ background: sv.completionPercentage===100?'#4CAF50':sv.completionPercentage>0?'var(--ink)':'var(--soft)',
                      opacity: sv.completionPercentage===100?1:sv.completionPercentage>0?0.4:0.25,
                      outline: isToday?'2px solid var(--ink)':'none', outlineOffset: 1 }} />
                )
              })}
            </div>
            <div className="flex gap-3 mt-3">
              {[{bg:'#4CAF50',l:'100%'},{bg:'var(--ink)',o:.4,l:'Parcial'},{bg:'var(--soft)',o:.25,l:'Vazio'}].map(({bg,o,l}) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background:bg, opacity:o??1 }} />
                  <span className="text-[10px]" style={{ color:'var(--muted)' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Per goal */}
        {goals.length > 0 && (
          <div className="fade-up fade-up-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--muted)' }}>Por meta</p>
            <div className="space-y-2.5">
              {goals.map(goal => {
                const gtasks = tasksForDate(today).filter(t=>t.goalId===goal.id)
                const done   = gtasks.filter(t=>t.isCompleted).length
                const pct    = gtasks.length>0?Math.round((done/gtasks.length)*100):0
                const meta   = CATEGORY_META[goal.category]
                return (
                  <div key={goal.id} className="rounded-xl p-3.5 shadow-sm flex items-center gap-3" style={{ background:'var(--white)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background:meta.bg }}>{goal.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color:'var(--ink)' }}>{goal.title}</p>
                      <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background:'var(--soft)' }}>
                        <div className="h-full rounded-full"
                          style={{ width: animated?`${pct}%`:'0%', background:meta.color, transition:'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
                      </div>
                    </div>
                    <span className="text-[14px] font-display font-bold w-10 text-right flex-shrink-0" style={{ color:'var(--ink)' }}>
                      {gtasks.length===0?'—':`${pct}%`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* #21 — Accent color picker */}
        <div className="fade-up fade-up-5 rounded-2xl p-4 shadow-sm" style={{ background:'var(--white)' }}>
          <p className="text-[13px] font-semibold mb-3" style={{ color:'var(--ink)' }}>🎨 Tema de cor</p>
          <div className="flex gap-2 flex-wrap">
            {(Object.entries(ACCENT_COLORS) as [AccentColor, {ink:string;label:string}][]).map(([key, val]) => (
              <button key={key} onClick={() => setAccentColor(key)}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all active:scale-95"
                style={{ background: accentColor===key?val.ink:'var(--soft)', color: accentColor===key?'#fff':'var(--ink)',
                  borderColor: accentColor===key?val.ink:'transparent' }}>
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl p-4 shadow-sm" style={{ background:'var(--white)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold" style={{ color:'var(--ink)' }}>🔔 Lembrete diário</p>
              <p className="text-[12px] mt-0.5" style={{ color:'var(--muted)' }}>Notificação às 20h para revisar tarefas</p>
            </div>
            <button onClick={handleNotificationToggle}
              className="w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0"
              style={{ background: notificationsEnabled?'var(--ink)':'var(--line)' }}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${notificationsEnabled?'translate-x-5':'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* #20 — Export */}
        <div className="rounded-2xl p-4 shadow-sm" style={{ background:'var(--white)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold" style={{ color:'var(--ink)' }}>📤 Exportar dados</p>
              <p className="text-[12px] mt-0.5" style={{ color:'var(--muted)' }}>Baixar metas e tarefas em JSON</p>
            </div>
            <button onClick={handleExport}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold active:scale-95 transition-transform"
              style={{ background:'var(--soft)', color:'var(--ink)' }}>
              Baixar
            </button>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}
