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

export default function SettingsSheet({ onClose, onResetOnboarding, onSignOut }: Props) {
  const { settings, updateSettings, notificationsEnabled, toggleNotifications } = useStore()
  const { user } = useAuth()
  const offlineMode = localStorage.getItem('dailyflow-offline-mode') === '1'

  const [name, setName] = useState(settings.name || user?.user_metadata?.full_name || '')

  const handleSave = () => {
    updateSettings({ name: name.trim() })
    onClose()
  }

  const setAccent = (color: AccentColor) => {
    updateSettings({ accentColor: color })
  }

  const clearData = () => {
    if (confirm('Isso vai apagar todas as metas e tarefas. Tem certeza?')) {
      localStorage.removeItem('dailyflow-storage-v3')
      window.location.reload()
    }
  }

  const displayName = name.trim() || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?'

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={onClose}
      />
      <div
        className="relative rounded-t-3xl sheet-enter flex flex-col"
        style={{ background: 'var(--paper)', maxHeight: '90dvh' }}
      >
        <div className="px-6 pt-5 pb-0 flex-shrink-0">
          <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--line)' }} />
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl" style={{ color: 'var(--ink)' }}>Configurações</h2>
            <button onClick={onClose} className="p-2 rounded-full active:scale-90" style={{ color: 'var(--muted)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto scroll-area flex-1 px-6 pb-8 space-y-5">
          {/* Profile card */}
          <div
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: 'var(--white)' }}
          >
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ background: 'var(--ink)', color: 'var(--paper)' }}
            >
              {avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold truncate" style={{ color: 'var(--ink)' }}>{displayName}</p>
              {!offlineMode && user?.email && (
                <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--muted)' }}>{user.email}</p>
              )}
              {offlineMode && (
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted)' }}>Modo offline</p>
              )}
            </div>
          </div>

          {/* Name input */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
              NOME EXIBIDO
            </p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Como quer ser chamado?"
              className="w-full px-4 py-3.5 rounded-xl text-[16px] outline-none"
              style={{ background: 'var(--white)', color: 'var(--ink)' }}
            />
          </div>

          {/* Accent color */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
              COR DE DESTAQUE
            </p>
            <div className="flex gap-3">
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

          {/* Toggles */}
          <div className="rounded-2xl" style={{ background: 'var(--white)', overflow: 'hidden' }}>
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-[15px] font-medium" style={{ color: 'var(--ink)' }}>🔔 Lembrete diário</p>
                <p className="text-[12px]" style={{ color: 'var(--muted)' }}>Notificação às 20h</p>
              </div>
              <Toggle checked={notificationsEnabled} onChange={toggleNotifications} />
            </div>
          </div>

          {/* Tour */}
          <button
            onClick={() => { updateSettings({ onboardingDone: false }); onResetOnboarding(); onClose() }}
            className="w-full py-3.5 rounded-2xl text-[15px] font-medium transition-all active:scale-[0.98]"
            style={{ background: 'var(--soft)', color: 'var(--ink)' }}
          >
            🎓 Ver tour de boas-vindas
          </button>

          {/* Export */}
          <button
            onClick={() => {
              const data = {
                goals: useStore.getState().goals,
                tasks: useStore.getState().tasks,
                exportedAt: new Date().toISOString(),
              }
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = 'dailyflow-backup.json'; a.click()
              URL.revokeObjectURL(url)
            }}
            className="w-full py-3.5 rounded-2xl text-[15px] font-medium transition-all active:scale-[0.98]"
            style={{ background: 'var(--soft)', color: 'var(--ink)' }}
          >
            📤 Exportar dados (JSON)
          </button>

          {/* Danger zone */}
          <button
            onClick={clearData}
            className="w-full py-3.5 rounded-2xl text-[15px] font-medium transition-all active:scale-[0.98]"
            style={{ background: '#FEE2E2', color: '#DC2626' }}
          >
            🗑️ Limpar todos os dados
          </button>

          {/* Sign out */}
          <button
            onClick={onSignOut}
            className="w-full py-3.5 rounded-2xl text-[15px] font-medium transition-all active:scale-[0.98]"
            style={{ background: 'var(--soft)', color: 'var(--muted)' }}
          >
            {offlineMode ? '🔐 Fazer login / criar conta' : '🚪 Sair da conta'}
          </button>

          <button
            onClick={handleSave}
            className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all active:scale-[0.98]"
            style={{ background: 'var(--ink)', color: 'var(--paper)' }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
