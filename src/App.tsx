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
import BadgesSheet from './components/BadgesSheet'
import AddTaskSheet from './components/AddTaskSheet'
import AddGoalSheet from './components/AddGoalSheet'
import { ACCENT_COLORS, DAILY_QUOTES, toDateKey } from './models/types'

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

/* ── Pill Tab Bar — fixed at bottom, no glass ── */
function PillTabBar({ tab, setTab, onAdd }: { tab: Tab; setTab: (t: Tab) => void; onAdd: () => void }) {
  return (
    <div style={{
      flexShrink: 0,
      paddingBottom: 'calc(var(--safe-bottom) + 12px)',
      paddingTop: 10, paddingLeft: 14, paddingRight: 14,
      background: 'var(--paper)',
    }}>
      <div style={{
        background: 'var(--white)', borderRadius: 36,
        display: 'flex', alignItems: 'center', padding: '5px',
        boxShadow: '0 1px 16px rgba(0,0,0,0.08), 0 0 0 1px var(--line)',
        gap: 2,
      }}>
        {tabs.slice(0, 2).map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => setTab(id)} className="active:scale-95"
              style={{
                flex: active ? '1.6' : '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: active ? 5 : 0, padding: '10px 6px', borderRadius: 30,
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--paper)' : 'var(--muted)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden', minWidth: 0, whiteSpace: 'nowrap',
              }}>
              <Icon active={active} />
              {active && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-.01em', fontFamily: 'var(--font-system)' }}>{label}</span>}
            </button>
          )
        })}

        {/* Center + button */}
        <button onClick={onAdd} className="active:scale-90 transition-transform"
          style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'transparent', color: 'var(--muted)',
            border: '1.5px dashed var(--muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>

        {tabs.slice(2, 4).map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => setTab(id)} className="active:scale-95"
              style={{
                flex: active ? '1.6' : '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: active ? 5 : 0, padding: '10px 6px', borderRadius: 30,
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--paper)' : 'var(--muted)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden', minWidth: 0, whiteSpace: 'nowrap',
              }}>
              <Icon active={active} />
              {active && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-.01em', fontFamily: 'var(--font-system)' }}>{label}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Daily quote ── */
function getDailyQuote(category?: string) {
  const pools = category === 'all' || !category
    ? [...DAILY_QUOTES.motivacional, ...DAILY_QUOTES.stoic, ...DAILY_QUOTES.productivity]
    : DAILY_QUOTES[category] ?? DAILY_QUOTES.motivacional
  const dayIdx = Math.floor(Date.now() / 86400000) % pools.length
  return pools[dayIdx]
}

/* ── Glass header with sticky scroll effect ── */
function GlassHeader({ scrolled, avatarLetter, onProfile, onDayPress, streak, quoteCategory, onReflection, onBadges }: {
  scrolled: boolean; avatarLetter: string; onProfile: () => void
  onDayPress: (date: Date) => void; streak: number; quoteCategory?: string
  onReflection: () => void; onBadges: () => void
}) {
  const today = new Date()
  const dow = today.getDay()
  const DAY = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
  const [selIdx, setSelIdx] = useState(dow)
  const quote = getDailyQuote(quoteCategory)

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - dow + i)
    return { label: DAY[i], num: d.getDate(), date: d, isToday: i === dow }
  })

  return (
    <div style={{
      flexShrink: 0, paddingTop: 'calc(var(--safe-top) + 6px)',
      background: scrolled ? 'rgba(var(--paper-rgb,242,242,247),0.82)' : 'var(--paper)',
      backdropFilter: scrolled ? 'blur(20px) saturate(1.8)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.8)' : 'none',
      borderBottom: `1px solid ${scrolled ? 'var(--line)' : 'transparent'}`,
      transition: 'background 0.2s ease, border-color 0.2s ease',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 6px', gap: 8 }}>
        {/* Streak badge */}
        <button onClick={onBadges} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 20, background: streak > 0 ? 'var(--ink)' : 'var(--soft)', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: 13 }}>🔥</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: streak > 0 ? 'var(--paper)' : 'var(--muted)', fontFamily: 'var(--font-system)' }}>{streak}</span>
        </button>

        {/* App name centered */}
        <span style={{ flex: 1, fontSize: 17, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', fontFamily: 'var(--font-system)', textAlign: 'center' }}>
          DailyFlow
        </span>

        {/* Profile + reflection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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

      {/* Daily quote — only when not scrolled */}
      {!scrolled && (
        <div style={{ padding: '0 16px 8px' }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-system)', fontStyle: 'italic', lineHeight: 1.4 }}>
            "{quote.text}" <span style={{ fontStyle: 'normal', fontWeight: 600 }}>— {quote.author}</span>
          </p>
        </div>
      )}

      {/* Clickable week calendar */}
      <div style={{ display: 'flex', padding: '0 10px 10px', gap: 2 }}>
        {week.map(({ label, num, date, isToday }, i) => {
          const isSel = selIdx === i
          return (
            <button key={i} onClick={() => { setSelIdx(i); onDayPress(date) }}
              className="active:scale-95"
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 2px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isSel ? 'var(--ink)' : isToday ? 'var(--soft)' : 'transparent',
                transition: 'background 0.15s',
              }}>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', fontFamily: 'var(--font-system)', color: isSel ? 'rgba(255,255,255,0.55)' : isToday ? 'var(--ink)' : 'var(--muted)' }}>{label}</span>
              <span style={{ fontSize: 15, fontWeight: (isSel||isToday) ? 700 : 400, lineHeight: 1, fontFamily: 'var(--font-system)', fontVariantNumeric: 'tabular-nums', color: isSel ? '#fff' : isToday ? 'var(--ink)' : 'var(--muted)' }}>{num}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Badge unlock toast ── */
function BadgeToast({ badges, onDone }: { badges: { emoji: string; title: string }[]; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{ position: 'fixed', top: 'calc(var(--safe-top) + 80px)', left: '50%', transform: 'translateX(-50%)', zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      {badges.map((b, i) => (
        <div key={i} className="fade-up" style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 20, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 18 }}>{b.emoji}</span>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-system)' }}>Conquista desbloqueada: {b.title}</span>
        </div>
      ))}
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
  const [showAddSheet, setShowAddSheet]         = useState(false)
  const [selectedDay, setSelectedDay]           = useState<Date | null>(null)
  const [scrolled, setScrolled]                 = useState(false)
  const [showReflection, setShowReflection]     = useState(false)
  const [showBadges, setShowBadges]             = useState(false)
  const [newBadges, setNewBadges]               = useState<{ emoji: string; title: string }[]>([])

  const { darkMode, settings, getCurrentStreak, checkAndUnlockBadges, getBadges } = useStore()
  const { user, loading: authLoading, initAuth, signOut } = useAuth()
  const offlineMode = localStorage.getItem('dailyflow-offline-mode') === '1'
  const isAuthenticated = !!user || offlineMode

  useEffect(() => { const unsub = initAuth(); return unsub }, [])

  useEffect(() => {
    const ink = ACCENT_COLORS[settings.accentColor]?.ink ?? '#1A1A1A'
    document.documentElement.style.setProperty('--ink', darkMode ? (settings.accentColor === 'default' ? '#F2F2F7' : ink) : ink)
    document.documentElement.style.setProperty('--paper-rgb', darkMode ? '17,17,16' : '242,242,247')
  }, [settings.accentColor, darkMode])

  // Check badges periodically
  useEffect(() => {
    if (!isAuthenticated) return
    const check = () => {
      const unlocked = checkAndUnlockBadges()
      if (unlocked.length > 0) {
        const all = getBadges()
        const details = unlocked.map(id => all.find(b => b.id === id)).filter(Boolean) as { emoji: string; title: string }[]
        setNewBadges(details)
      }
    }
    check()
    const t = setInterval(check, 30000)
    return () => clearInterval(t)
  }, [isAuthenticated])

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

  if (showSplash) return <div className={darkMode ? 'dark' : ''} style={{ background: 'var(--paper)' }}><SplashScreen onDone={handleSplashDone} /></div>

  if (authLoading && !offlineMode) return (
    <div className={`${darkMode ? 'dark' : ''} h-dvh flex items-center justify-center`} style={{ background: '#080808' }}>
      <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.15"/><path d="M21 12a9 9 0 00-9-9"/>
      </svg>
    </div>
  )

  if (!isAuthenticated) return <div className={darkMode ? 'dark' : ''} style={{ background: 'var(--paper)' }}><AuthScreen /></div>

  const displayName = settings.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  const avatarLetter = displayName[0]?.toUpperCase() ?? ''
  const streak = getCurrentStreak()
  const handleAdd = () => { if (tab === 'today' || tab === 'goals') setShowAddSheet(true) }

  return (
    <div className={`${darkMode ? 'dark' : ''} h-dvh flex flex-col overflow-hidden`} style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
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
          streak={streak}
          quoteCategory={settings.quoteCategory}
          onReflection={() => setShowReflection(true)}
          onBadges={() => setShowBadges(true)}
        />

        <div style={{ flex: 1 }}>
          <div className={tab === 'today'   ? 'block' : 'hidden'}><TodayView /></div>
          <div className={tab === 'notes'   ? 'block' : 'hidden'}><NotesView /></div>
          <div className={tab === 'goals'   ? 'block' : 'hidden'}><GoalsView /></div>
          <div className={tab === 'summary' ? 'block' : 'hidden'}><SummaryView onOpenSettings={() => setShowProfile(true)} /></div>
        </div>
      </div>

      {/* Floating pill navbar */}
      <PillTabBar tab={tab} setTab={setTab} onAdd={handleAdd} />

      {/* Modals */}
      {selectedDay   && <DayDetailSheet date={selectedDay} onClose={() => setSelectedDay(null)} />}
      {showReflection && <DailyReflectionSheet onClose={() => setShowReflection(false)} />}
      {showBadges    && <BadgesSheet onClose={() => setShowBadges(false)} />}
      {newBadges.length > 0 && <BadgeToast badges={newBadges} onDone={() => setNewBadges([])} />}
      {showAddSheet && (tab === 'today' || tab === 'goals') && (
        tab === 'today' ? <AddTaskSheet onClose={() => setShowAddSheet(false)} /> : <AddGoalSheet onClose={() => setShowAddSheet(false)} />
      )}
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
