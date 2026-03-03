import { useState } from 'react'
import { useStore } from '../store/useStore'
import { toDateKey } from '../models/types'

interface Props { onClose: () => void }

export default function DailyReflectionSheet({ onClose }: Props) {
  const { setReflection, getReflection } = useStore()
  const today = toDateKey(new Date())
  const existing = getReflection(today)
  const [stars, setStars] = useState(existing?.stars ?? 0)
  const [note, setNote] = useState(existing?.note ?? '')

  const save = () => {
    if (stars === 0) return
    setReflection(today, stars, note.trim() || undefined)
    onClose()
  }

  const labels = ['', 'Péssimo 😞', 'Ruim 😕', 'Ok 😐', 'Bom 😊', 'Incrível 🎉']

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div className="relative rounded-t-3xl sheet-enter" style={{ background: 'var(--paper)' }}>
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full" style={{ background: 'var(--line)' }} /></div>
        <div className="px-6 pt-2 pb-8">
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-system)', letterSpacing: '-.02em', marginBottom: 4 }}>Como foi seu dia?</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', fontFamily: 'var(--font-system)', marginBottom: 24 }}>Reflita sobre o seu progresso de hoje</p>

          {/* Stars */}
          <div className="flex justify-between mb-2" style={{ gap: 8 }}>
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setStars(s)} className="active:scale-90 transition-transform flex-1" style={{
                height: 52, borderRadius: 14, border: `2px solid ${stars >= s ? 'var(--ink)' : 'var(--line)'}`,
                background: stars >= s ? 'var(--ink)' : 'var(--white)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 22 }}>⭐</span>
              </button>
            ))}
          </div>
          {stars > 0 && (
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-system)', textAlign: 'center', marginBottom: 20 }}>
              {labels[stars]}
            </p>
          )}

          {/* Note */}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Algo que você quer registrar sobre hoje... (opcional)"
            rows={3}
            style={{
              width: '100%', borderRadius: 14, padding: '12px 14px', fontSize: 15,
              fontFamily: 'var(--font-system)', color: 'var(--ink)', background: 'var(--white)',
              border: '1px solid var(--line)', outline: 'none', resize: 'none',
              marginBottom: 16,
            }}
          />

          <button onClick={save} disabled={stars === 0} style={{
            width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: stars > 0 ? 'pointer' : 'default',
            background: stars > 0 ? 'var(--ink)' : 'var(--soft)', color: stars > 0 ? 'var(--paper)' : 'var(--muted)',
            fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-system)', transition: 'all 0.2s',
          }}>
            Salvar reflexão
          </button>
        </div>
      </div>
    </div>
  )
}
