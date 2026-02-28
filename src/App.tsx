import { useState, useEffect } from 'react'
import { useStore } from './store/useStore'
import { useAuth } from './lib/useAuth'
import TodayView from './views/TodayView'
import GoalsView from './views/GoalsView'
import SummaryView from './views/SummaryView'
import NotesView from './views/NotesView'
import OnboardingTour from './components/OnboardingTour'
import SplashScreen from './components/SplashScreen'
import ProfileSheet from './components/ProfileSheet'
import AuthScreen from './components/AuthScreen'
import { ACCENT_COLORS } from './models/types'

type Tab = 'today' | 'notes' | 'goals' | 'summary'

/* ── Tab icons ── */
const TodayIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
    {active && <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeWidth="3"/>}
  </svg>
)

const NotesIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <path d="M14 2v6h6"/>
    <path d="M16 13H8M16 17H8M10 9H8"/>
  </svg>
)

const GoalsIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2" fill={active ? 'currentColor' : 'none'}/>
  </svg>
)

const SummaryIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="12" width="4" height="9" rx="1" fill={active ? 'currentColor' : 'none'} opacity={active ? "0.35" : "1"}/>
    <rect x="10" y="7" width="4" height="14" rx="1" fill={active ? 'currentColor' : 'none'} opacity={active ? "0.35" : "1"}/>
    <rect x="17" y="3" width="4" height="18" rx="1" fill={active ? 'currentColor' : 'none'} opacity={active ? "0.35" : "1"}/>
  </svg>
)

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

const tabs: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'today',   label: 'Hoje',   Icon: TodayIcon   },
  { id: 'notes',   label: 'Notas',  Icon: NotesIcon   },
  { id: 'goals',   label: 'Metas',  Icon: GoalsIcon   },
  { id: 'summary', label: 'Resumo', Icon: SummaryIcon },
]

/* ── Weekly calendar strip ── */
function WeekCalendar() {
  const today = new Date()
  const dow = today.getDay()
  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - dow + i)
    return { label: dayLabels[i], num: d.getDate(), isToday: i === dow }
  })

  return (
    <div className="flex items-center justify-between px-4 pb-2" style={{ gap: 0 }}>
      {week.map(({ label, num, isToday }, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center flex-1"
          style={{ position: 'relative' }}
        >
          {/* Separator line between days */}
          {idx > 0 && (
            <div style={{
              position: 'absolute', left: 0, top: '10%', height: '80%',
              width: 1, background: 'var(--line)',
            }} />
          )}
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '.04em',
              color: isToday ? 'var(--ink)' : 'var(--muted)',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-system)',
              marginBottom: 3,
            }}
          >
            {label}
          </span>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isToday ? 'var(--ink)' : 'transparent',
              color: isToday ? 'var(--paper)' : 'var(--muted)',
              fontSize: 14,
              fontWeight: isToday ? 700 : 400,
              fontFamily: 'var(--font-system)',
            }}
          >
            {num}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  // Always show splash on first load — it's short enough not to matter
  const [showSplash, setShowSplash]     = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showProfile, setShowProfile]   = useState(false)
  const [resetOnboarding, setResetOnboarding] = useState(false)
  const [showAddSheet, setShowAddSheet] = useState(false)

  const { darkMode, settings } = useStore()
  const { user, loading: authLoading, initAuth, signOut } = useAuth()

  const offlineMode = localStorage.getItem('dailyflow-offline-mode') === '1'
  const isAuthenticated = !!user || offlineMode

  useEffect(() => {
    const unsub = initAuth()
    return unsub
  }, [])

  useEffect(() => {
    const ink = ACCENT_COLORS[settings.accentColor]?.ink ?? '#1A1A1A'
    document.documentElement.style.setProperty(
      '--ink',
      darkMode ? (settings.accentColor === 'default' ? '#F2F2F7' : ink) : ink
    )
  }, [settings.accentColor, darkMode])

  const handleSplashDone = () => {
    setShowSplash(false)
    if (!settings.onboardingDone && isAuthenticated) setShowOnboarding(true)
  }

  if (showSplash) {
    return (
      <div className={darkMode ? 'dark' : ''} style={{ background: 'var(--paper)' }}>
        <SplashScreen onDone={handleSplashDone} />
      </div>
    )
  }

  // While auth is still initializing, show a neutral loading screen
  // This prevents the flash of AuthScreen when user already has a valid session
  if (authLoading && !offlineMode) {
    return (
      <div className={`${darkMode ? 'dark' : ''} h-dvh flex items-center justify-center`} style={{ background: '#080808' }}>
        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.15"/>
          <path d="M21 12a9 9 0 00-9-9"/>
        </svg>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className={darkMode ? 'dark' : ''} style={{ background: 'var(--paper)' }}>
        <AuthScreen />
      </div>
    )
  }

  const displayName = settings.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  const avatarLetter = displayName[0]?.toUpperCase() ?? ''

  return (
    <div className={`${darkMode ? 'dark' : ''} h-dvh flex flex-col overflow-hidden`} style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      {showOnboarding && <OnboardingTour onDone={() => setShowOnboarding(false)} />}
      {resetOnboarding && <OnboardingTour onDone={() => setResetOnboarding(false)} />}

      {/* ── Global top bar ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5"
        style={{
          paddingTop: 'calc(var(--safe-top) + 0.5rem)',
          paddingBottom: '0.25rem',
          background: 'var(--paper)',
        }}
      >
        {/* App name — centered, iOS style */}
        <div style={{ width: 36 }} /> {/* spacer */}
        <h1 style={{
          fontFamily: 'var(--font-system)',
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: '-.01em',
          color: 'var(--ink)',
          textAlign: 'center',
          flex: 1,
        }}>
          DailyFlow
        </h1>

        {/* Profile button — iOS style circle */}
        <button
          onClick={() => setShowProfile(true)}
          className="active:scale-90 transition-transform"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'var(--soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {avatarLetter ? (
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--ink)',
              fontFamily: 'var(--font-system)',
              lineHeight: 1,
            }}>
              {avatarLetter}
            </span>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── Weekly calendar ── */}
      <WeekCalendar />

      {/* Separator */}
      <div style={{ height: 1, background: 'var(--line)', flexShrink: 0 }} />

      {/* ── Main content ── */}
      <main className="flex-1 overflow-hidden relative">
        <div className={tab === 'today'   ? 'block h-full' : 'hidden'}><TodayView /></div>
        <div className={tab === 'notes'   ? 'block h-full' : 'hidden'}><NotesView /></div>
        <div className={tab === 'goals'   ? 'block h-full' : 'hidden'}><GoalsView /></div>
        <div className={tab === 'summary' ? 'block h-full' : 'hidden'}><SummaryView onOpenSettings={() => setShowProfile(true)} /></div>
      </main>

      {/* ── Tab bar — iOS style with + center button ── */}
      <nav style={{
        background: 'var(--white)',
        borderTop: '1px solid var(--line)',
        paddingBottom: 'var(--safe-bottom)',
        position: 'relative',
        flexShrink: 0,
      }}>
        <div className="flex items-end" style={{ height: 56 }}>

          {/* Left two tabs */}
          {tabs.slice(0, 2).map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-90 transition-all duration-150 h-full"
                style={{ color: active ? 'var(--ink)' : 'var(--muted)' }}
              >
                <Icon active={active} />
                <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: '.02em', fontFamily: 'var(--font-system)' }}>{label}</span>
              </button>
            )
          })}

          {/* Center + button */}
          <div className="flex-1 flex flex-col items-center justify-center h-full" style={{ paddingBottom: 8 }}>
            <button
              onClick={() => {
                // Opens add sheet based on current tab
                if (tab === 'today' || tab === 'goals') setShowAddSheet(true)
              }}
              className="active:scale-90 transition-transform"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--ink)',
                color: 'var(--paper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
              }}
            >
              <PlusIcon />
            </button>
          </div>

          {/* Right two tabs */}
          {tabs.slice(2, 4).map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-90 transition-all duration-150 h-full"
                style={{ color: active ? 'var(--ink)' : 'var(--muted)' }}
              >
                <Icon active={active} />
                <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: '.02em', fontFamily: 'var(--font-system)' }}>{label}</span>
              </button>
            )
          })}

        </div>
      </nav>

      {/* Add sheet — delegate to current view */}
      {showAddSheet && (tab === 'today' || tab === 'goals') && (
        <AddSheetProxy tab={tab} onClose={() => setShowAddSheet(false)} />
      )}

      {/* Profile Sheet */}
      {showProfile && (
        <ProfileSheet
          onClose={() => setShowProfile(false)}
          onResetOnboarding={() => setResetOnboarding(true)}
          onSignOut={async () => {
            if (!offlineMode) await signOut()
            else localStorage.removeItem('dailyflow-offline-mode')
            setShowProfile(false)
          }}
        />
      )}
    </div>
  )
}

/* Proxy to open add sheet in the right view */
import AddTaskSheet from './components/AddTaskSheet'
import AddGoalSheet from './components/AddGoalSheet'

function AddSheetProxy({ tab, onClose }: { tab: Tab; onClose: () => void }) {
  if (tab === 'today') return <AddTaskSheet onClose={onClose} />
  if (tab === 'goals') return <AddGoalSheet onClose={onClose} />
  return null
}
