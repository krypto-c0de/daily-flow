import { useEffect, useState } from 'react'
import { DailySummary } from '../models/types'

interface Props { summary: DailySummary }

export default function ProgressHeader({ summary }: Props) {
  const [width, setWidth] = useState(0)
  const [dashOffset, setDashOffset] = useState(0)

  const circumference = 2 * Math.PI * 30
  const isComplete = summary.completionPercentage === 100

  useEffect(() => {
    const t = setTimeout(() => {
      setWidth(summary.completionPercentage)
      setDashOffset(circumference - (summary.completionPercentage / 100) * circumference)
    }, 80)
    return () => clearTimeout(t)
  }, [summary.completionPercentage, circumference])

  return (
    <div className="rounded-2xl p-5 shadow-sm fade-up" style={{ background: 'var(--white)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>
            {isComplete ? '🎉 Dia completo!' : 'Progresso de hoje'}
          </p>
          <p className="font-display text-5xl leading-none" style={{ color: 'var(--ink)' }}>
            {summary.completionPercentage}%
          </p>
        </div>

        <svg width="80" height="80" className="-rotate-90" style={{ flexShrink: 0 }}>
          <circle cx="40" cy="40" r="30" fill="none" stroke="var(--soft)" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="30" fill="none"
            stroke={isComplete ? '#4CAF50' : 'var(--ink)'}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
          <text
            x="40" y="40" textAnchor="middle" dominantBaseline="central"
            style={{
              fontSize: 12, fontFamily: 'DM Sans', fontWeight: 600,
              transform: 'rotate(90deg)', transformOrigin: '40px 40px',
              fill: 'var(--ink)',
            }}
          >
            {summary.completedTasks}/{summary.totalTasks}
          </text>
        </svg>
      </div>

      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
        <div
          className="h-full rounded-full bar-fill"
          style={{ width: `${width}%`, background: isComplete ? '#4CAF50' : 'var(--ink)' }}
        />
      </div>
    </div>
  )
}
