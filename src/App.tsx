import { useState, useEffect } from 'react'
import { useStore } from './store/useStore'
import { useAuth } from './lib/useAuth'
import TodayView from './views/TodayView'
import GoalsView from './views/GoalsView'
import SummaryView from './views/SummaryView'
import OnboardingTour from './components/OnboardingTour'
import SplashScreen from './components/SplashScreen'
import SettingsSheet from './components/SettingsSheet'
import AuthScreen from './components/AuthScreen'
import { ACCENT_COLORS } from './models/types'

type Tab = 'today' | 'goals' | 'summary'

const TodayIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
    {active ? (
      <><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12"/><path d="M8 12l3 3 5-5"/></>
    ) : (
      <><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></>
    )}
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
  { id: 'today' as Tab,   label: 'Hoje',   Icon: TodayIcon   },
  { id: 'goals' as Tab,   label: 'Metas',  Icon: GoalsIcon   },
  { id: 'summary' as Tab, label: 'Resumo', Icon: SummaryIcon },
]

const ProfileIcon = ({ active, letter }: { active: boolean; letter: string }) => (
  <div
    className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
    style={{
      background: active ? 'var(--ink)' : 'var(--soft)',
      color: active ? 'var(--paper)' : 'var(--ink)',
      fontSize: 10,
      transition: 'all 0.2s',
    }}
  >
    {letter && letter !== '⚙' ? letter : (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    )}
  </div>
)

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  // Só mostra splash se não há sessão já salva (evita mostrar ao relogar)
  const hasSavedSession = !!localStorage.getItem('sb-' + 
    (import.meta.env.VITE_SUPABASE_URL?.replace('https://','').split('.')[0] ?? 'x') + 
    '-auth-token') || localStorage.getItem('dailyflow-offline-mode') === '1'
  const [showSplash, setShowSplash] = useState(!hasSavedSession)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [resetOnboarding, setResetOnboarding] = useState(false)

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
      darkMode ? (settings.accentColor === 'default' ? '#F0EFE8' : ink) : ink
    )
  }, [settings.accentColor, darkMode])

  const handleSplashDone = () => {
    setShowSplash(false)
    if (!settings.onboardingDone && isAuthenticated) setShowOnboarding(true)
  }

  if (showSplash) {
    return (
      <div className={`${darkMode ? 'dark' : ''}`} style={{ background: 'var(--paper)' }}>
        <SplashScreen onDone={handleSplashDone} />
      </div>
    )
  }

  if (authLoading && !offlineMode) {
    return (
      <div className={`${darkMode ? 'dark' : ''} h-dvh flex items-center justify-center`} style={{ background: 'var(--paper)' }}>
        <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.15"/>
          <path d="M21 12a9 9 0 00-9-9"/>
        </svg>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className={`${darkMode ? 'dark' : ''}`} style={{ background: 'var(--paper)' }}>
        <AuthScreen />
      </div>
    )
  }

  // Avatar letter para tab bar / settings
  const displayName = settings.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  const avatarLetter = displayName[0]?.toUpperCase() ?? '⚙'

  return (
    <div className={`${darkMode ? 'dark' : ''} h-dvh flex flex-col overflow-hidden`} style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      {showOnboarding && <OnboardingTour onDone={() => setShowOnboarding(false)} />}
      {resetOnboarding && <OnboardingTour onDone={() => setResetOnboarding(false)} />}

      <main className="flex-1 overflow-hidden relative">
        <div className={tab === 'today'   ? 'block h-full' : 'hidden'}><TodayView onOpenSettings={() => setShowSettings(true)} /></div>
        <div className={tab === 'goals'   ? 'block h-full' : 'hidden'}><GoalsView /></div>
        <div className={tab === 'summary' ? 'block h-full' : 'hidden'}><SummaryView onOpenSettings={() => setShowSettings(true)} /></div>
      </main>

      {/* Tab bar */}
      <nav style={{ background: 'var(--white)', borderTop: '1px solid var(--line)', paddingBottom: 'var(--safe-bottom)' }}>
        <div className="flex items-stretch">
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

          {/* Profile tab — mesmo padrão dos outros */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 active:scale-90 transition-all duration-200"
            style={{ color: showSettings ? 'var(--ink)' : 'var(--muted)' }}
          >
            <ProfileIcon active={showSettings} letter={avatarLetter} />
            <span className={`text-[10px] tracking-wide ${showSettings ? 'font-semibold' : 'font-normal'}`}>Perfil</span>
          </button>
        </div>
      </nav>

      {showSettings && (
        <SettingsSheet
          onClose={() => setShowSettings(false)}
          onResetOnboarding={() => setResetOnboarding(true)}
          onSignOut={async () => {
            if (!offlineMode) await signOut()
            else localStorage.removeItem('dailyflow-offline-mode')
            setShowSettings(false)
          }}
        />
      )}
    </div>
  )
}
