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

type Section = null | 'about' | 'appearance' | 'data' | 'notifications'

const ChevronIcon = ({ rotated }: { rotated: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ color: 'var(--muted)', transform: rotated ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
)

export default function ProfileSheet({ onClose, onResetOnboarding, onSignOut }: Props) {
  const { settings, updateSettings, notificationsEnabled, toggleNotifications } = useStore()
  const { user } = useAuth()
  const offlineMode = localStorage.getItem('dailyflow-offline-mode') === '1'

  const [name, setName] = useState(settings.name || user?.user_metadata?.full_name || '')
  const [expandedSection, setExpandedSection] = useState<Section>(null)

  const handleSave = () => { updateSettings({ name: name.trim() }); onClose() }

  const setAccent = (color: AccentColor) => {
    updateSettings({ accentColor: color })
  }

  const clearData = () => {
    if (confirm('Isso vai apagar todas as metas e tarefas. Tem certeza?')) {
      localStorage.removeItem('dailyflow-storage-v4')
      window.location.reload()
    }
  }

  const displayName = name.trim() || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?'

  const toggle = (s: Section) => setExpandedSection(prev => prev === s ? null : s)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose} />
      <div className="relative rounded-t-3xl sheet-enter flex flex-col" style={{ background: 'var(--paper)', maxHeight: '92dvh' }}>
        {/* Handle */}
        <div className="flex-shrink-0 pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--line)' }} />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-2 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
              {avatarLetter}
            </div>
            <div>
              <p className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>{displayName}</p>
              {!offlineMode && user?.email && (
                <p className="text-[12px]" style={{ color: 'var(--muted)' }}>{user.email}</p>
              )}
              {offlineMode && (
                <p className="text-[12px]" style={{ color: 'var(--muted)' }}>Modo offline</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--soft)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto scroll-area flex-1 px-5 pb-8 space-y-2">
          {/* Nome */}
          <button
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl active:opacity-70 transition-opacity"
            style={{ background: 'var(--white)', borderBottom: expandedSection === 'about' ? `1px solid var(--soft)` : 'none' }}
            onClick={() => toggle('about')}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">👤</span>
              <span className="text-[15px] font-medium" style={{ color: 'var(--ink)' }}>Meu nome</span>
            </div>
            <ChevronIcon rotated={expandedSection === 'about'} />
          </button>
          {expandedSection === 'about' && (
            <div className="px-4 py-4 rounded-2xl" style={{ background: 'var(--white)' }}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Como posso te chamar?"
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

          {/* Aparência */}
          <button
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl active:opacity-70 transition-opacity"
            style={{ background: 'var(--white)' }}
            onClick={() => toggle('appearance')}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">🎨</span>
              <span className="text-[15px] font-medium" style={{ color: 'var(--ink)' }}>Aparência</span>
            </div>
            <ChevronIcon rotated={expandedSection === 'appearance'} />
          </button>
          {expandedSection === 'appearance' && (
            <div className="px-4 py-4 rounded-2xl" style={{ background: 'var(--white)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>COR DE DESTAQUE</p>
              <div className="flex gap-3">
                {(Object.entries(ACCENT_COLORS) as [AccentColor, { ink: string; label: string }][]).map(([key, val]) => (
                  <button key={key} onClick={() => setAccent(key)} className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: val.ink, outline: settings.accentColor === key ? `3px solid ${val.ink}` : '3px solid transparent', outlineOffset: 2 }}>
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

          {/* Notificações */}
          <button
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl active:opacity-70 transition-opacity"
            style={{ background: 'var(--white)' }}
            onClick={() => toggle('notifications')}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">🔔</span>
              <span className="text-[15px] font-medium" style={{ color: 'var(--ink)' }}>Notificações</span>
            </div>
            <ChevronIcon rotated={expandedSection === 'notifications'} />
          </button>
          {expandedSection === 'notifications' && (
            <div className="px-4 py-4 rounded-2xl" style={{ background: 'var(--white)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium" style={{ color: 'var(--ink)' }}>Lembrete diário</p>
                  <p className="text-[12px]" style={{ color: 'var(--muted)' }}>Notificação às {String(settings.notificationHour ?? 20).padStart(2, '0')}:{String(settings.notificationMinute ?? 0).padStart(2, '0')}h</p>
                </div>
                <Toggle checked={notificationsEnabled} onChange={toggleNotifications} />
              </div>
              {notificationsEnabled && (
                <div className="flex gap-2 mt-3">
                  <div style={{ flex: 1 }}>
                    <p className="text-[11px] mb-1" style={{ color: 'var(--muted)' }}>Hora</p>
                    <input type="number" min="0" max="23" value={settings.notificationHour ?? 20}
                      onChange={e => updateSettings({ notificationHour: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--soft)', color: 'var(--ink)', fontSize: 15, outline: 'none', textAlign: 'center' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="text-[11px] mb-1" style={{ color: 'var(--muted)' }}>Minuto</p>
                    <input type="number" min="0" max="59" value={settings.notificationMinute ?? 0}
                      onChange={e => updateSettings({ notificationMinute: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--soft)', color: 'var(--ink)', fontSize: 15, outline: 'none', textAlign: 'center' }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tour */}
          <button
            onClick={() => { updateSettings({ onboardingDone: false }); onResetOnboarding(); onClose() }}
            className="w-full py-4 rounded-2xl text-[15px] font-medium transition-all active:scale-[0.98]"
            style={{ background: 'var(--white)', color: 'var(--ink)' }}
          >
            🎓 Ver tour de boas-vindas
          </button>

          {/* Export */}
          <button
            onClick={() => {
              const data = { goals: (window as any).__store?.getState?.()?.goals, exportedAt: new Date().toISOString() }
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = 'dailyflow-backup.json'; a.click()
              URL.revokeObjectURL(url)
            }}
            className="w-full py-4 rounded-2xl text-[15px] font-medium transition-all active:scale-[0.98]"
            style={{ background: 'var(--white)', color: 'var(--ink)' }}
          >
            📤 Exportar dados (JSON)
          </button>

          {/* Danger */}
          <button onClick={clearData} className="w-full py-4 rounded-2xl text-[15px] font-medium transition-all active:scale-[0.98]" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            🗑️ Limpar todos os dados
          </button>

          {/* Sign out */}
          <button onClick={onSignOut} className="w-full py-4 rounded-2xl text-[15px] font-medium transition-all active:scale-[0.98]" style={{ background: 'var(--white)', color: 'var(--muted)' }}>
            {offlineMode ? '🔐 Fazer login / criar conta' : '🚪 Sair da conta'}
          </button>

          <button onClick={handleSave} className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all active:scale-[0.98]" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
