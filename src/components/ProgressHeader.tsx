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
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '.08em',
            color: 'var(--muted)',
            marginBottom: 6,
            fontFamily: 'var(--font-system)',
          }}>
            {isComplete ? '🎉 Dia completo!' : 'Progresso de hoje'}
          </p>
          {/* Large percentage — iOS style tabular numeral */}
          <p style={{
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-.03em',
            color: 'var(--ink)',
            fontFamily: 'var(--font-system)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {summary.completionPercentage}
            <span style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-.01em' }}>%</span>
          </p>
        </div>

        {/* Circular progress */}
        <svg width="80" height="80" className="-rotate-90" style={{ flexShrink: 0 }}>
          <circle cx="40" cy="40" r="30" fill="none" stroke="var(--soft)" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="30" fill="none"
            stroke={isComplete ? '#34C759' : 'var(--ink)'}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
          <text
            x="40" y="40" textAnchor="middle" dominantBaseline="central"
            style={{
              fontSize: 13,
              fontFamily: '-apple-system, "SF Pro Display", sans-serif',
              fontWeight: 600,
              transform: 'rotate(90deg)',
              transformOrigin: '40px 40px',
              fill: 'var(--ink)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {summary.completedTasks}/{summary.totalTasks}
          </text>
        </svg>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
        <div
          className="h-full rounded-full bar-fill"
          style={{ width: `${width}%`, background: isComplete ? '#34C759' : 'var(--ink)' }}
        />
      </div>
    </div>
  )
}
