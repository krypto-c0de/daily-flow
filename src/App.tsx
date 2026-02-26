import { useEffect, useState } from 'react'
import { useStore, ACCENT_COLORS } from './store/useStore'
import { toDateKey } from './models/types'
import TodayView   from './views/TodayView'
import GoalsView   from './views/GoalsView'
import SummaryView from './views/SummaryView'

type Tab = 'today' | 'goals' | 'summary'

const TodayIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
    {active ? <><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12"/><path d="M8 12l3 3 5-5"/></> : <><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></>}
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
  { id: 'today'   as Tab, label: 'Hoje',   Icon: TodayIcon   },
  { id: 'goals'   as Tab, label: 'Metas',  Icon: GoalsIcon   },
  { id: 'summary' as Tab, label: 'Resumo', Icon: SummaryIcon },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const { darkMode, accentColor, spawnRecurrent } = useStore()

  // Spawn recurrent tasks on mount
  useEffect(() => {
    spawnRecurrent(toDateKey(new Date()))
  }, [spawnRecurrent])

  // Inject accent color CSS var
  const inkColor = ACCENT_COLORS[accentColor].ink
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', inkColor)
    if (!darkMode) document.documentElement.style.setProperty('--ink', inkColor)
    else           document.documentElement.style.setProperty('--ink', '#F0EFE8')
  }, [accentColor, darkMode, inkColor])

  const MobileApp = (
    <div className="flex flex-col h-full" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      <main className="flex-1 overflow-hidden relative">
        <div className={tab === 'today'   ? 'block h-full' : 'hidden'}><TodayView /></div>
        <div className={tab === 'goals'   ? 'block h-full' : 'hidden'}><GoalsView /></div>
        <div className={tab === 'summary' ? 'block h-full' : 'hidden'}><SummaryView /></div>
      </main>
      <nav style={{ background: 'var(--white)', borderTop: '1px solid var(--line)', paddingBottom: 'var(--safe-bottom)', flexShrink: 0 }}>
        <div className="flex">
          {tabs.map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button key={id} onClick={() => setTab(id)}
                style={{ color: active ? 'var(--ink)' : 'var(--muted)' }}
                className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all duration-200 active:scale-90 cursor-pointer">
                <Icon active={active} />
                <span className={`text-[10px] tracking-wide ${active ? 'font-semibold' : 'font-normal'}`}>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )

  return (
    <div className={darkMode ? 'dark' : ''} style={{ height: '100dvh', background: darkMode ? '#0a0a09' : '#e5e4e0' }}>
      {/* Desktop wrapper — centers the mobile shell, no layout breaks */}
      <div className="hidden md:flex h-full items-center justify-center">
        <div
          className="relative overflow-hidden"
          style={{
            width: 390,
            height: '92dvh',
            maxHeight: 844,
            borderRadius: 44,
            boxShadow: '0 40px 80px rgba(0,0,0,0.35), 0 0 0 10px rgba(0,0,0,0.15)',
            background: 'var(--paper)',
          }}
        >
          {/* Fake notch bar */}
          <div style={{ height: 44, background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 120, height: 32, background: darkMode ? '#1a1a18' : '#1A1A1A', borderRadius: 20 }} />
          </div>
          <div style={{ height: 'calc(100% - 44px)' }}>
            {MobileApp}
          </div>
        </div>
      </div>

      {/* Mobile — full screen, no wrapper */}
      <div className="md:hidden h-full">
        {MobileApp}
      </div>
    </div>
  )
}
