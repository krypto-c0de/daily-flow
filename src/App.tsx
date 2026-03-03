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
import DayDetailSheet from './components/DayDetailSheet'
import DailyReflectionSheet from './components/DailyReflectionSheet'
import { ACCENT_COLORS, toDateKey } from './models/types'

type Tab = 'today' | 'notes' | 'goals' | 'summary'

/* ── Icons ── */
const TodayIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)
const NotesIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
  </svg>
)
const GoalsIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2" fill={active ? 'currentColor' : 'none'}/>
  </svg>
)
const SummaryIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="12" width="4" height="9" rx="1" fill={active ? 'currentColor' : 'none'} opacity={active ? '0.4' : '1'}/>
    <rect x="10" y="7" width="4" height="14" rx="1" fill={active ? 'currentColor' : 'none'} opacity={active ? '0.4' : '1'}/>
    <rect x="17" y="3" width="4" height="18" rx="1" fill={active ? 'currentColor' : 'none'} opacity={active ? '0.4' : '1'}/>
  </svg>
)

const tabs: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'today',   label: 'Hoje',   Icon: TodayIcon   },
  { id: 'notes',   label: 'Notas',  Icon: NotesIcon   },
  { id: 'goals',   label: 'Metas',  Icon: GoalsIcon   },
  { id: 'summary', label: 'Resumo', Icon: SummaryIcon },
]

/* ── Pill Tab Bar — iOS glass / floating ── */
function PillTabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const glassBg = 'rgba(var(--paper-rgb,242,242,247),0.55)'
  const glassBgStrong = 'rgba(var(--paper-rgb,242,242,247),0.78)'
  const glassBorder = 'rgba(255,255,255,0.10)'
  const shadow = '0 12px 36px rgba(0,0,0,0.22)'

  return (
    <div style={{
      flexShrink: 0,
      paddingBottom: 'calc(var(--safe-bottom) + 4px)',
      paddingTop: 6, paddingLeft: 12, paddingRight: 12,
      background: 'transparent',
      position: 'sticky',
      bottom: 0,
      zIndex: 40,
    }}>
      <div style={{
        position: 'relative',
        overflow: 'visible',
        background: glassBg,
        borderRadius: 28,
        border: `1px solid ${glassBorder}`,
        backdropFilter: 'blur(26px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(26px) saturate(1.8)',
        boxShadow: shadow,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '8px 8px 10px',
        gap: 4,
      }}>
        {tabs.map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="active:scale-95"
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
                color: active ? 'var(--ink)' : 'var(--muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 4,
                position: 'relative',
                height: 48,
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: active ? glassBgStrong : 'transparent',
                border: active ? `1px solid ${glassBorder}` : '1px solid transparent',
                backdropFilter: active ? 'blur(26px) saturate(1.8)' : 'none',
                WebkitBackdropFilter: active ? 'blur(26px) saturate(1.8)' : 'none',
                boxShadow: active ? '0 8px 18px rgba(0,0,0,0.18)' : 'none',
                transform: active ? 'translateY(-16px)' : 'translateY(0)',
                transition: 'transform 0.22s cubic-bezier(0.32, 0.72, 0, 1), background 0.22s, box-shadow 0.22s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon active={active} />
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: active ? 700 : 600,
                letterSpacing: '-.01em',
                fontFamily: 'var(--font-system)',
                opacity: active ? 1 : 0.85,
                transform: active ? 'translateY(-6px)' : 'translateY(0)',
                transition: 'transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Glass header with sticky scroll effect ── */
function GlassHeader({ scrolled, avatarLetter, onProfile, onDayPress, onReflection }: {
  scrolled: boolean; avatarLetter: string; onProfile: () => void
  onDayPress: (date: Date) => void
  onReflection: () => void
}) {
  const today = new Date()
  const dow = today.getDay()
  const DAY = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
  const [selIdx, setSelIdx] = useState(dow)

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - dow + i)
    return { label: DAY[i], num: d.getDate(), date: d, isToday: i === dow }
  })

  return (
    <div style={{
      flexShrink: 0, paddingTop: 'calc(var(--safe-top) + 6px)',
      background: scrolled ? 'rgba(var(--paper-rgb,242,242,247),0.72)' : 'var(--paper)',
      backdropFilter: scrolled ? 'blur(24px) saturate(2)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(2)' : 'none',
      borderBottom: `1px solid ${scrolled ? 'rgba(0,0,0,0.06)' : 'transparent'}`,
      boxShadow: scrolled ? '0 4px 24px -4px rgba(0,0,0,0.12), 0 1px 0 0 rgba(255,255,255,0.5) inset' : 'none',
      transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      position: 'sticky', top: 0, zIndex: 30,
      isolation: 'isolate',
    }}>
      {/* Top row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '0 16px 6px' }}>
        <div />
        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', fontFamily: 'var(--font-system)', textAlign: 'center' }}>
          DailyFlow
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifySelf: 'end' }}>
          <button onClick={onReflection} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--soft)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
            🧘
          </button>
          <button onClick={onProfile} className="active:scale-90 transition-transform" style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--soft)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatarLetter
              ? <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-system)', lineHeight: 1 }}>{avatarLetter}</span>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            }
          </button>
        </div>
      </div>

      {/* Clickable week calendar */}
      <div style={{ display: 'flex', padding: '0 10px 10px', gap: 2 }}>
        {week.map(({ label, num, date, isToday }, i) => {
          const isSel = selIdx === i
          return (
            <button key={i} onClick={() => { setSelIdx(i); onDayPress(date) }}
              className="active:scale-95"
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 2px', borderRadius: 12, border: '1px solid var(--line)', cursor: 'pointer',
                background: isSel ? 'var(--ink)' : isToday ? 'var(--soft)' : 'transparent',
                transition: 'background 0.15s, border-color 0.15s',
              }}>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', fontFamily: 'var(--font-system)', color: isSel ? 'var(--paper)' : isToday ? 'var(--ink)' : 'var(--muted)', opacity: isSel ? 0.7 : 1 }}>{label}</span>
              <span style={{ fontSize: 15, fontWeight: (isSel||isToday) ? 700 : 400, lineHeight: 1, fontFamily: 'var(--font-system)', fontVariantNumeric: 'tabular-nums', color: isSel ? 'var(--paper)' : isToday ? 'var(--ink)' : 'var(--muted)' }}>{num}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Main App ── */
export default function App() {
  const [tab, setTab]                           = useState<Tab>('today')
  const [showSplash, setShowSplash]             = useState(true)
  const [showOnboarding, setShowOnboarding]     = useState(false)
  const [showProfile, setShowProfile]           = useState(false)
  const [resetOnboarding, setResetOnboarding]   = useState(false)
  const [selectedDay, setSelectedDay]           = useState<Date | null>(null)
  const [scrolled, setScrolled]                 = useState(false)
  const [showReflection, setShowReflection]     = useState(false)

  const { settings } = useStore()
  const { user, loading: authLoading, initAuth, signOut } = useAuth()
  const offlineMode = localStorage.getItem('dailyflow-offline-mode') === '1'
  const isAuthenticated = !!user || offlineMode

  useEffect(() => { const unsub = initAuth(); return unsub }, [])

  useEffect(() => {
    if (useStore.getState().darkMode) useStore.setState({ darkMode: false })
  }, [])

  useEffect(() => {
    const accentInk = ACCENT_COLORS[settings.accentColor]?.ink ?? '#1A1A1A'
    document.documentElement.style.setProperty('--ink', accentInk)
    document.documentElement.style.setProperty('--paper', '#E8E8ED')
    document.documentElement.style.setProperty('--white', '#F5F5FA')
    document.documentElement.style.setProperty('--soft', '#E0E0E6')
    document.documentElement.style.setProperty('--line', '#D8D8DD')
    document.documentElement.style.setProperty('--muted', '#8E8E93')
    document.documentElement.style.setProperty('--paper-rgb', '242,242,247')
  }, [settings.accentColor])

  // Auto-show reflection at end of day
  useEffect(() => {
    if (!isAuthenticated) return
    const now = new Date()
    const { getReflection } = useStore.getState()
    const today = toDateKey(now)
    if (now.getHours() >= 20 && !getReflection(today)) {
      const shown = localStorage.getItem('df-reflection-shown-' + today)
      if (!shown) {
        setTimeout(() => { setShowReflection(true); localStorage.setItem('df-reflection-shown-' + today, '1') }, 2000)
      }
    }
  }, [isAuthenticated])

  const handleSplashDone = () => {
    setShowSplash(false)
    if (!settings.onboardingDone && isAuthenticated) setShowOnboarding(true)
  }

  if (showSplash) return <div style={{ background: 'var(--paper)' }}><SplashScreen onDone={handleSplashDone} /></div>

  if (authLoading && !offlineMode) return (
    <div className="h-dvh flex items-center justify-center" style={{ background: '#080808' }}>
      <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.15"/><path d="M21 12a9 9 0 00-9-9"/>
      </svg>
    </div>
  )

  if (!isAuthenticated) return <div style={{ background: 'var(--paper)' }}><AuthScreen /></div>

  const displayName = settings.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  const avatarLetter = displayName[0]?.toUpperCase() ?? ''

  return (
    <div className="h-dvh flex flex-col overflow-hidden" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      {showOnboarding && <OnboardingTour onDone={() => setShowOnboarding(false)} />}
      {resetOnboarding && <OnboardingTour onDone={() => setResetOnboarding(false)} />}

      {/* Scrollable area with sticky glass header */}
      <div
        className="flex-1 overflow-y-auto scroll-area"
        onScroll={e => setScrolled(e.currentTarget.scrollTop > 10)}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <GlassHeader
          scrolled={scrolled}
          avatarLetter={avatarLetter}
          onProfile={() => setShowProfile(true)}
          onDayPress={date => setSelectedDay(date)}
          onReflection={() => setShowReflection(true)}
        />

        <div style={{ flex: 1 }}>
          <div className={tab === 'today'   ? 'block' : 'hidden'}><TodayView /></div>
          <div className={tab === 'notes'   ? 'block' : 'hidden'}><NotesView /></div>
          <div className={tab === 'goals'   ? 'block' : 'hidden'}><GoalsView /></div>
          <div className={tab === 'summary' ? 'block' : 'hidden'}><SummaryView onOpenSettings={() => setShowProfile(true)} /></div>
        </div>
      </div>

      {/* Floating pill navbar */}
      <PillTabBar tab={tab} setTab={setTab} />

      {/* Modals */}
      {selectedDay   && <DayDetailSheet date={selectedDay} onClose={() => setSelectedDay(null)} />}
      {showReflection && <DailyReflectionSheet onClose={() => setShowReflection(false)} />}
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
