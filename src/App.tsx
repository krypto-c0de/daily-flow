import { useState } from 'react'
import { useStore } from './store/useStore'
import TodayView from './views/TodayView'
import GoalsView from './views/GoalsView'
import SummaryView from './views/SummaryView'

type Tab = 'today' | 'goals' | 'summary'

// Fix #10 — SVG icons, consistent on all devices
const TodayIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
    {active
      ? <><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12"/><path d="M8 12l3 3 5-5"/></>
      : <><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></>
    }
  </svg>
)

const GoalsIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6" fill={active ? 'currentColor' : 'none'} opacity="0.2"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
)

const SummaryIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="12" width="4" height="9" rx="1" fill={active ? 'currentColor' : 'none'} opacity="0.3"/>
    <rect x="10" y="7" width="4" height="14" rx="1" fill={active ? 'currentColor' : 'none'} opacity="0.3"/>
    <rect x="17" y="3" width="4" height="18" rx="1" fill={active ? 'currentColor' : 'none'} opacity="0.3"/>
    <rect x="3" y="12" width="4" height="9" rx="1"/>
    <rect x="10" y="7" width="4" height="14" rx="1"/>
    <rect x="17" y="3" width="4" height="18" rx="1"/>
  </svg>
)

const tabs = [
  { id: 'today' as Tab,   label: 'Hoje',    Icon: TodayIcon   },
  { id: 'goals' as Tab,   label: 'Metas',   Icon: GoalsIcon   },
  { id: 'summary' as Tab, label: 'Resumo',  Icon: SummaryIcon },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const { darkMode } = useStore()

  return (
    <div className={`${darkMode ? 'dark' : ''} h-dvh flex flex-col overflow-hidden`} style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      <main className="flex-1 overflow-hidden relative">
        <div className={tab === 'today'   ? 'block h-full' : 'hidden'}><TodayView /></div>
        <div className={tab === 'goals'   ? 'block h-full' : 'hidden'}><GoalsView /></div>
        <div className={tab === 'summary' ? 'block h-full' : 'hidden'}><SummaryView /></div>
      </main>

      {/* Tab bar — Fix #2 safe bottom */}
      <nav style={{ background: 'var(--white)', borderTop: '1px solid var(--line)', paddingBottom: 'var(--safe-bottom)' }}>
        <div className="flex">
          {tabs.map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{ color: active ? 'var(--ink)' : 'var(--muted)' }}
                className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all duration-200 active:scale-90"
              >
                <Icon active={active} />
                <span className={`text-[10px] tracking-wide ${active ? 'font-semibold' : 'font-normal'}`}>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
