import { useState } from 'react'
import TodayView from './views/TodayView'
import GoalsView from './views/GoalsView'
import SummaryView from './views/SummaryView'

type Tab = 'today' | 'goals' | 'summary'

const tabs: { id: Tab; label: string; icon: (active: boolean) => string }[] = [
  { id: 'today',   label: 'Hoje',    icon: a => a ? '✓' : '○' },
  { id: 'goals',   label: 'Metas',   icon: a => a ? '★' : '☆' },
  { id: 'summary', label: 'Resumo',  icon: a => a ? '▮' : '▯' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('today')

  return (
    <div className="h-dvh flex flex-col bg-paper font-body overflow-hidden">
      {/* Page content */}
      <main className="flex-1 overflow-hidden relative">
        <div className={tab === 'today'   ? 'block h-full' : 'hidden'}><TodayView /></div>
        <div className={tab === 'goals'   ? 'block h-full' : 'hidden'}><GoalsView /></div>
        <div className={tab === 'summary' ? 'block h-full' : 'hidden'}><SummaryView /></div>
      </main>

      {/* Tab bar */}
      <nav className="flex-shrink-0 bg-white border-t border-line safe-bottom">
        <div className="flex">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`
                flex-1 flex flex-col items-center justify-center py-3 gap-0.5
                transition-all duration-200 active:scale-95
                ${tab === t.id ? 'text-ink' : 'text-muted'}
              `}
            >
              <span className={`text-lg leading-none font-display transition-transform duration-200 ${tab === t.id ? 'scale-110' : 'scale-100'}`}>
                {t.icon(tab === t.id)}
              </span>
              <span className={`text-[10px] font-medium tracking-wide ${tab === t.id ? 'font-semibold' : ''}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
