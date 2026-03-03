import { useStore } from '../store/useStore'

interface Props { onClose: () => void }

export default function BadgesSheet({ onClose }: Props) {
  const badges = useStore(s => s.getBadges())
  const unlocked = badges.filter(b => b.unlocked)
  const locked = badges.filter(b => !b.unlocked)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div className="relative rounded-t-3xl sheet-enter flex flex-col" style={{ background: 'var(--paper)', maxHeight: '85dvh' }}>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0"><div className="w-10 h-1 rounded-full" style={{ background: 'var(--line)' }} /></div>
        <div className="flex-shrink-0 px-5 pt-2 pb-3 flex items-center justify-between">
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-system)', letterSpacing: '-.02em' }}>Conquistas</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-system)', marginTop: 2 }}>{unlocked.length}/{badges.length} desbloqueadas</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--soft)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="overflow-y-auto scroll-area flex-1 px-5 pb-8 space-y-3">
          {unlocked.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'var(--font-system)', marginBottom: 10 }}>Desbloqueadas ✨</p>
              {unlocked.map(b => (
                <div key={b.id} className="flex items-center gap-3 p-4 rounded-2xl mb-2" style={{ background: 'var(--white)', border: '1px solid var(--line)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{b.emoji}</div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-system)' }}>{b.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-system)', marginTop: 1 }}>{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {locked.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'var(--font-system)', marginBottom: 10 }}>Bloqueadas 🔒</p>
              {locked.map(b => (
                <div key={b.id} className="flex items-center gap-3 p-4 rounded-2xl mb-2" style={{ background: 'var(--soft)', opacity: 0.6 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, filter: 'grayscale(1)' }}>{b.emoji}</div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-system)' }}>{b.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-system)', marginTop: 1 }}>{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
