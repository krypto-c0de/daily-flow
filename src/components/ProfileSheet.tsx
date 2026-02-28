import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useAuth } from '../lib/useAuth'
import { ACCENT_COLORS, AccentColor } from '../models/types'
import Toggle from './Toggle'

interface Props {
  onClose: () => void
  onResetOnboarding: () => void
  onSignOut: () => void
}

type Section = null | 'about' | 'preferences' | 'appearance' | 'data' | 'notifications'

export default function ProfileSheet({ onClose, onResetOnboarding, onSignOut }: Props) {
  const { settings, updateSettings, darkMode, toggleDarkMode, notificationsEnabled, toggleNotifications } = useStore()
  const { user } = useAuth()
  const offlineMode = localStorage.getItem('dailyflow-offline-mode') === '1'

  const [name, setName]           = useState(settings.name || user?.user_metadata?.full_name || '')
  const [expandedSection, setExpandedSection] = useState<Section>(null)

  const handleSave = () => { updateSettings({ name: name.trim() }); onClose() }

  const setAccent = (color: AccentColor) => {
    updateSettings({ accentColor: color })
    const val = ACCENT_COLORS[color].ink
    document.documentElement.style.setProperty('--ink', darkMode
      ? (color === 'default' ? '#F0EFE8' : val) : val)
  }

  const clearData = () => {
    if (confirm('Isso vai apagar todas as metas e tarefas. Tem certeza?')) {
      localStorage.removeItem('dailyflow-storage-v3')
      window.location.reload()
    }
  }

  const displayName = name.trim() || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?'

  const toggle = (s: Section) => setExpandedSection(prev => prev === s ? null : s)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={onClose}
      />
      <div
        className="relative rounded-t-3xl sheet-enter flex flex-col"
        style={{ background: 'var(--paper)', maxHeight: '92dvh' }}
      >
        {/* Handle */}
        <div className="flex-shrink-0 pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--line)' }} />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-2 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ background: 'var(--ink)', color: 'var(--paper)' }}
            >
              {avatarLetter}
            </div>
            <div>
              <p className="text-[16px] font-semibold" style={{ color: 'var(--ink)' }}>{displayName}</p>
              {!offlineMode && user?.email && (
                <p className="text-[12px]" style={{ color: 'var(--muted)' }}>{user.email}</p>
              )}
              {offlineMode && (
                <p className="text-[12px]" style={{ color: 'var(--muted)' }}>Modo offline</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90" style={{ background: 'var(--soft)', color: 'var(--muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto scroll-area flex-1 px-5 pb-8 space-y-3">

          {/* ── Seção principal ── */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--white)' }}>

            {/* Sobre você */}
            <button
              className="w-full flex items-center justify-between px-4 py-4 active:opacity-70 transition-opacity"
              style={{ borderBottom: '1px solid var(--soft)' }}
              onClick={() => toggle('about')}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">👤</span>
                <span className="text-[15px] font-medium" style={{ color: 'var(--ink)' }}>Sobre você</span>
              </div>
              <ChevronIcon rotated={expandedSection === 'about'} />
            </button>
            {expandedSection === 'about' && (
              <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--soft)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Nome exibido</p>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Como quer ser chamado?"
                  className="w-full px-4 py-3 rounded-xl text-[15px] outline-none"
                  style={{ background: 'var(--soft)', color: 'var(--ink)' }}
                />
                <button
                  onClick={handleSave}
                  className="w-full mt-3 py-3 rounded-xl text-[14px] font-semibold active:scale-[0.98] transition-transform"
                  style={{ background: 'var(--ink)', color: 'var(--paper)' }}
                >
                  Salvar nome
                </button>
              </div>
            )}

            {/* Preferências */}
            <button
              className="w-full flex items-center justify-between px-4 py-4 active:opacity-70 transition-opacity"
              style={{ borderBottom: '1px solid var(--soft)' }}
              onClick={() => toggle('preferences')}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">⚙️</span>
                <span className="text-[15px] font-medium" style={{ color: 'var(--ink)' }}>Preferências</span>
              </div>
              <ChevronIcon rotated={expandedSection === 'preferences'} />
            </button>
            {expandedSection === 'preferences' && (
              <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--soft)' }}>
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-[14px] font-medium" style={{ color: 'var(--ink)' }}>Modo Escuro</p>
                    <p className="text-[12px]" style={{ color: 'var(--muted)' }}>Tema dark para o app</p>
                  </div>
                  <Toggle checked={darkMode} onChange={toggleDarkMode} />
                </div>
              </div>
            )}

            {/* Aparência */}
            <button
              className="w-full flex items-center justify-between px-4 py-4 active:opacity-70 transition-opacity"
              style={{ borderBottom: '1px solid var(--soft)' }}
              onClick={() => toggle('appearance')}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🎨</span>
                <span className="text-[15px] font-medium" style={{ color: 'var(--ink)' }}>Aparência</span>
              </div>
              <ChevronIcon rotated={expandedSection === 'appearance'} />
            </button>
            {expandedSection === 'appearance' && (
              <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--soft)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Cor de destaque</p>
                <div className="flex gap-3 flex-wrap">
                  {(Object.entries(ACCENT_COLORS) as [AccentColor, { ink: string; label: string }][]).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setAccent(key)}
                      className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: val.ink,
                          outline: settings.accentColor === key ? `3px solid ${val.ink}` : '3px solid transparent',
                          outlineOffset: 2,
                        }}
                      >
                        {settings.accentColor === key && (
                          <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                            <path d="M1 6L5 10L13 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{val.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tour */}
            <button
              className="w-full flex items-center justify-between px-4 py-4 active:opacity-70 transition-opacity"
              onClick={() => { updateSettings({ onboardingDone: false }); onResetOnboarding(); onClose() }}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🎓</span>
                <span className="text-[15px] font-medium" style={{ color: 'var(--ink)' }}>Tour de boas-vindas</span>
              </div>
              <ChevronIcon />
            </button>
          </div>

          {/* ── CONTA ── */}
          <p className="text-[11px] font-semibold uppercase tracking-widest px-1 pt-1" style={{ color: 'var(--muted)' }}>Conta</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--white)' }}>

            {/* Notificações */}
            <button
              className="w-full flex items-center justify-between px-4 py-4 active:opacity-70 transition-opacity"
              style={{ borderBottom: '1px solid var(--soft)' }}
              onClick={() => toggle('notifications')}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🔔</span>
                <span className="text-[15px] font-medium" style={{ color: 'var(--ink)' }}>Notificações</span>
              </div>
              <ChevronIcon rotated={expandedSection === 'notifications'} />
            </button>
            {expandedSection === 'notifications' && (
              <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--soft)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium" style={{ color: 'var(--ink)' }}>Lembrete diário</p>
                    <p className="text-[12px]" style={{ color: 'var(--muted)' }}>Notificação às 20h</p>
                  </div>
                  <Toggle checked={notificationsEnabled} onChange={toggleNotifications} />
                </div>
              </div>
            )}

            {/* Seus dados */}
            <button
              className="w-full flex items-center justify-between px-4 py-4 active:opacity-70 transition-opacity"
              style={{ borderBottom: '1px solid var(--soft)' }}
              onClick={() => toggle('data')}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📦</span>
                <span className="text-[15px] font-medium" style={{ color: 'var(--ink)' }}>Seus dados</span>
              </div>
              <ChevronIcon rotated={expandedSection === 'data'} />
            </button>
            {expandedSection === 'data' && (
              <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--soft)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => {
                    const data = { goals: useStore.getState().goals, tasks: useStore.getState().tasks, exportedAt: new Date().toISOString() }
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = 'dailyflow-backup.json'; a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="w-full py-3 rounded-xl text-[14px] font-medium active:scale-[0.98] transition-transform"
                  style={{ background: 'var(--soft)', color: 'var(--ink)' }}
                >
                  📤 Exportar dados (JSON)
                </button>
                <button
                  onClick={clearData}
                  className="w-full py-3 rounded-xl text-[14px] font-medium active:scale-[0.98] transition-transform"
                  style={{ background: '#FEE2E2', color: '#DC2626' }}
                >
                  🗑️ Limpar todos os dados
                </button>
              </div>
            )}

            {/* Sair */}
            <button
              className="w-full flex items-center justify-between px-4 py-4 active:opacity-70 transition-opacity"
              onClick={onSignOut}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{offlineMode ? '🔐' : '🚪'}</span>
                <span className="text-[15px] font-medium" style={{ color: offlineMode ? 'var(--ink)' : '#DC2626' }}>
                  {offlineMode ? 'Fazer login / criar conta' : 'Sair da conta'}
                </span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

function ChevronIcon({ rotated }: { rotated?: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{
        color: 'var(--muted)',
        transform: rotated ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
        flexShrink: 0,
      }}
    >
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}
