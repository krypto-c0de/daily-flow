import { useState } from 'react'

interface Props {
  value: string        // YYYY-MM-DD or ''
  onChange: (v: string) => void
}

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function DatePicker({ value, onChange }: Props) {
  const today = new Date()
  const initYear  = value ? parseInt(value.slice(0,4)) : today.getFullYear()
  const initMonth = value ? parseInt(value.slice(5,7)) - 1 : today.getMonth()

  const [year, setYear]   = useState(initYear)
  const [month, setMonth] = useState(initMonth)

  const selected = value ? new Date(value + 'T00:00:00') : null

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const pick = (day: number) => {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onChange(`${year}-${mm}-${dd}`)
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--paper)' }}>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: 'var(--soft)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span className="font-semibold text-[15px]" style={{ color: 'var(--ink)' }}>
          {MONTHS[month]} {year}
        </span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: 'var(--soft)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['D','S','T','Q','Q','S','S'].map((d, i) => (
          <div key={i} className="text-center text-[11px] font-medium py-1" style={{ color: 'var(--muted)' }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const mm = String(month + 1).padStart(2, '0')
          const dd = String(day).padStart(2, '0')
          const dateKey = `${year}-${mm}-${dd}`
          const isSelected = selected && value === dateKey
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          return (
            <button
              key={i}
              onClick={() => pick(day)}
              className="w-full aspect-square rounded-full flex items-center justify-center text-[13px] font-medium transition-all duration-150 active:scale-90"
              style={{
                background: isSelected ? 'var(--ink)' : isToday ? 'var(--soft)' : 'transparent',
                color: isSelected ? '#fff' : 'var(--ink)',
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
