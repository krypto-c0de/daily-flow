import { useState, useEffect, useRef } from 'react'
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
import { ACCENT_COLORS } from './models/types'

type Tab = 'today' | 'notes' | 'goals' | 'summary'

const TodayIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)
const NotesIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>
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
    <rect x="3" y="12" width="4" height="9" rx="1" fill={active ? 'currentColor' : 'none'} opacity={active ? '0.35' : '1'}/>
    <rect x="10" y="7" width="4" height="14" rx="1" fill={active ? 'currentColor' : 'none'} opacity={active ? '0.35' : '1'}/>
    <rect x="17" y="3" width="4" height="18" rx="1" fill={active ? 'currentColor' : 'none'} opacity={active ? '0.35' : '1'}/>
  </svg>
)
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

const tabs: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'today',   label: 'Hoje',   Icon: TodayIcon   },
  { id: 'notes',   label: 'Notas',  Icon: NotesIcon   },
  { id: 'goals',   label: 'Metas',  Icon: GoalsIcon   },
  { id: 'summary', label: 'Resumo', Icon: SummaryIcon },
]

/* ── Floating pill tab bar ── */
function PillTabBar({ tab, setTab, onAdd }: { tab: Tab; setTab: (t: Tab) => void; onAdd: () => void }) {
  return (
    <div style={{
      flexShrink: 0,
      paddingBottom: 'calc(var(--safe-bottom) + 10px)',
      paddingTop: 8,
      paddingLeft: 16,
      paddingRight: 16,
      background: 'var(--paper)',
    }}>
      <div style={{
        background: 'var(--white)',
        borderRadius: 32,
        display: 'flex',
        alignItems: 'center',
        padding: '5px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.09), 0 0 0 1px var(--line)',
        gap: 2,
      }}>
        {/* Left 2 tabs */}
        {tabs.slice(0, 2).map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => setTab(id)}
              style={{
                flex: active ? '1.8' : '1',
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: active ? 6 : 0,
                padding: '10px 8px',
                borderRadius: 26,
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--paper)' : 'var(--muted)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden', minWidth: 0,
              }}
              className="active:scale-95"
            >
              <Icon active={active} />
              {active && (
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-.01em', fontFamily: 'var(--font-system)', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              )}
            </button>
          )
        })}

        {/* Center + */}
        <button onClick={onAdd}
          style={{
            width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
            background: 'transparent', color: 'var(--ink)',
            border: '1.5px solid var(--line)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          className="active:scale-90 transition-transform"
        >
          <PlusIcon />
        </button>

        {/* Right 2 tabs */}
        {tabs.slice(2, 4).map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => setTab(id)}
              style={{
                flex: active ? '1.8' : '1',
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: active ? 6 : 0,
                padding: '10px 8px',
                borderRadius: 26,
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--paper)' : 'var(--muted)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden', minWidth: 0,
              }}
              className="active:scale-95"
            >
              <Icon active={active} />
              {active && (
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-.01em', fontFamily: 'var(--font-system)', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Glassmorphism header with clickable week calendar ── */
function GlassHeader({
  scrolled,
  onDayPress,
  onProfile,
  avatarLetter,
}: {
  scrolled: boolean
  onDayPress: (date: Date) => void
  onProfile: () => void
  avatarLetter: string
}) {
  const today = new Date()
  const dow = today.getDay()
  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const [selectedIdx, setSelectedIdx] = useState(dow)

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - dow + i)
    return { label: dayLabels[i], num: d.getDate(), date: d, isToday: i === dow }
  })

  const handleDay = (i: number, date: Date) => {
    setSelectedIdx(i)
    onDayPress(date)
  }

  return (
    <div
      style={{
        flexShrink: 0,
        paddingTop: 'calc(var(--safe-top) + 0.5rem)',
        background: scrolled
          ? 'rgba(var(--paper-rgb, 247,246,243), 0.75)'
          : 'var(--paper)',
        backdropFilter: scrolled ? 'blur(16px) saturate(1.8)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(1.8)' : 'none',
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 6px' }}>
        <div style={{ width: 34 }} />
        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', fontFamily: 'var(--font-system)' }}>
          DailyFlow
        </span>
        <button
          onClick={onProfile}
          style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--soft)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          className="active:scale-90 transition-transform"
        >
          {avatarLetter
            ? <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-system)', lineHeight: 1 }}>{avatarLetter}</span>
            : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          }
        </button>
      </div>

      {/* Week calendar — clickable */}
      <div style={{ display: 'flex', padding: '0 12px 10px', gap: 4 }}>
        {week.map(({ label, num, date, isToday }, i) => {
          const isSelected = selectedIdx === i
          const highlight = isSelected || isToday
          return (
            <button
              key={i}
              onClick={() => handleDay(i, date)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: isSelected ? 'var(--ink)' : isToday ? 'var(--soft)' : 'transparent',
                transition: 'background 0.18s',
              }}
              className="active:scale-95"
            >
              <span style={{
                fontSize: 10, fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase',
                color: isSelected ? 'rgba(255,255,255,0.65)' : isToday ? 'var(--ink)' : 'var(--muted)',
                fontFamily: 'var(--font-system)',
              }}>
                {label}
              </span>
              <span style={{
                fontSize: 15, fontWeight: highlight ? 700 : 400, lineHeight: 1,
                color: isSelected ? '#fff' : isToday ? 'var(--ink)' : 'var(--muted)',
                fontFamily: 'var(--font-system)', fontVariantNumeric: 'tabular-nums',
              }}>
                {num}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function App() {
  const [tab, setTab]               = useState<Tab>('today')
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showProfile, setShowProfile]       = useState(false)
  const [resetOnboarding, setResetOnboarding] = useState(false)
  const [showAddSheet, setShowAddSheet]     = useState(false)
  const [selectedDay, setSelectedDay]       = useState<Date | null>(null)
  const [scrolled, setScrolled]             = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

  const { darkMode, settings } = useStore()
  const { user, loading: authLoading, initAuth, signOut } = useAuth()

  const offlineMode = localStorage.getItem('dailyflow-offline-mode') === '1'
  const isAuthenticated = !!user || offlineMode

  useEffect(() => { const unsub = initAuth(); return unsub }, [])

  useEffect(() => {
    const ink = ACCENT_COLORS[settings.accentColor]?.ink ?? '#1A1A1A'
    document.documentElement.style.setProperty('--ink',
      darkMode ? (settings.accentColor === 'default' ? '#F2F2F7' : ink) : ink)
    // Set paper-rgb for glassmorphism
    if (darkMode) {
      document.documentElement.style.setProperty('--paper-rgb', '17,17,16')
    } else {
      document.documentElement.style.setProperty('--paper-rgb', '242,242,247')
    }
  }, [settings.accentColor, darkMode])

  // Detect scroll for glass effect
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 10)
  }

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
  const handleAdd = () => { if (tab === 'today' || tab === 'goals') setShowAddSheet(true) }

  return (
    <div className={`${darkMode ? 'dark' : ''} h-dvh flex flex-col overflow-hidden`} style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      {showOnboarding && <OnboardingTour onDone={() => setShowOnboarding(false)} />}
      {resetOnboarding && <OnboardingTour onDone={() => setResetOnboarding(false)} />}

      {/* Glass header + calendar — mobile */}
      <GlassHeader
        scrolled={scrolled}
        onDayPress={(date) => setSelectedDay(date)}
        onProfile={() => setShowProfile(true)}
        avatarLetter={avatarLetter}
      />

      {/* Content — scroll tracked for glass effect */}
      <div
        ref={mainRef}
        className="flex-1 overflow-y-auto scroll-area"
        onScroll={handleScroll}
      >
        <div className={tab === 'today'   ? 'block' : 'hidden'}><TodayView /></div>
        <div className={tab === 'notes'   ? 'block' : 'hidden'}><NotesView /></div>
        <div className={tab === 'goals'   ? 'block' : 'hidden'}><GoalsView /></div>
        <div className={tab === 'summary' ? 'block' : 'hidden'}><SummaryView onOpenSettings={() => setShowProfile(true)} /></div>
      </div>

      {/* Floating pill tab bar */}
      <PillTabBar tab={tab} setTab={setTab} onAdd={handleAdd} />

      {/* Modals */}
      {selectedDay && <DayDetailSheet date={selectedDay} onClose={() => setSelectedDay(null)} />}
      {showAddSheet && (tab === 'today' || tab === 'goals') && <AddSheetProxy tab={tab} onClose={() => setShowAddSheet(false)} />}
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

import AddTaskSheet from './components/AddTaskSheet'
import AddGoalSheet from './components/AddGoalSheet'

function AddSheetProxy({ tab, onClose }: { tab: Tab; onClose: () => void }) {
  if (tab === 'today') return <AddTaskSheet onClose={onClose} />
  if (tab === 'goals') return <AddGoalSheet onClose={onClose} />
  return null
}
