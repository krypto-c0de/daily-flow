import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600)
    const t2 = setTimeout(() => setPhase('out'), 1400)
    const t3 = setTimeout(() => onDone(), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{
        background: '#080808',
        opacity: phase === 'out' ? 0 : 1,
        transition: phase === 'out' ? 'opacity 0.4s ease' : undefined,
      }}
    >
      <div style={{
        opacity: phase === 'in' ? 0 : 1,
        transform: phase === 'in' ? 'translateY(6px)' : 'translateY(0)',
        transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
        textAlign: 'center',
      }}>
        <p
          className="font-display tracking-tight"
          style={{ color: '#fff', fontSize: 28, letterSpacing: '-.03em', fontFamily: '"DM Serif Display", serif' }}
        >
          DailyFlow
        </p>
      </div>
    </div>
  )
}
