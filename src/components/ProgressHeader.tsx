import { useEffect, useState } from 'react'
import { DailySummary } from '../models/types'

interface Props { summary: DailySummary }

export default function ProgressHeader({ summary }: Props) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setWidth(summary.completionPercentage), 80)
    return () => clearTimeout(t)
  }, [summary.completionPercentage])

  const isComplete = summary.completionPercentage === 100
  const circumference = 2 * Math.PI * 30
  const dash = (summary.completionPercentage / 100) * circumference

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm fade-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-medium text-muted uppercase tracking-widest mb-1">
            {isComplete ? '🎉 Dia completo!' : 'Progresso de hoje'}
          </p>
          <p className="font-display text-5xl text-ink leading-none">
            {summary.completionPercentage}%
          </p>
        </div>

        {/* SVG circle */}
        <svg width="80" height="80" className="-rotate-90">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#E8E8E6" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="30" fill="none"
            stroke={isComplete ? '#4CAF50' : '#1A1A1A'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - dash}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
          <text
            x="40" y="40"
            textAnchor="middle" dominantBaseline="central"
            className="rotate-90 fill-ink font-body font-semibold"
            style={{ fontSize: 13, transform: 'rotate(90deg)', transformOrigin: '40px 40px', fontFamily: 'DM Sans' }}
          >
            {summary.completedTasks}/{summary.totalTasks}
          </text>
        </svg>
      </div>

      {/* Linear bar */}
      <div className="h-1.5 bg-line rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bar-fill"
          style={{
            width: `${width}%`,
            backgroundColor: isComplete ? '#4CAF50' : '#1A1A1A',
          }}
        />
      </div>
    </div>
  )
}
