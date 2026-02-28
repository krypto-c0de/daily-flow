import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'sub' | 'out'>('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400)
    const t2 = setTimeout(() => setPhase('sub'),  900)
    const t3 = setTimeout(() => setPhase('out'),  2000)
    const t4 = setTimeout(() => onDone(),         2500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onDone])

  return (
    <>
      <style>{`
        @keyframes splash-line {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes splash-dot {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splash-sub {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .splash-title {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.55s cubic-bezier(0.4,0,0.2,1), transform 0.55s cubic-bezier(0.4,0,0.2,1);
        }
        .splash-title.visible { opacity: 1; transform: translateY(0); }
        .splash-sub { opacity: 0; }
        .splash-sub.visible { animation: splash-sub 0.5s ease forwards; }
        .splash-bar { transform-origin: left; transform: scaleX(0); opacity: 0; }
        .splash-bar.visible { animation: splash-line 0.6s cubic-bezier(0.4,0,0.2,1) 0.15s forwards; }
        .splash-bar-r { transform-origin: right; transform: scaleX(0); opacity: 0; }
        .splash-bar-r.visible { animation: splash-line 0.6s cubic-bezier(0.4,0,0.2,1) 0.15s forwards; }
        .splash-dot { transform: scale(0); opacity: 0; }
        .splash-dot.visible { animation: splash-dot 0.45s cubic-bezier(0.4,0,0.2,1) 0.6s forwards; }
      `}</style>

      <div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
        style={{
          background: '#080808',
          opacity: phase === 'out' ? 0 : 1,
          transition: phase === 'out' ? 'opacity 0.5s ease' : undefined,
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        <div style={{ position: 'relative', textAlign: 'center' }}>
          <h1
            className={`splash-title ${phase !== 'in' ? 'visible' : ''}`}
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: 'clamp(36px, 10vw, 52px)',
              color: '#fff',
              letterSpacing: '-.04em',
              lineHeight: 1,
              fontWeight: 400,
            }}
          >
            DailyFlow
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 14, gap: 8 }}>
            <div className={`splash-bar ${phase !== 'in' ? 'visible' : ''}`}
              style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.25)' }} />
            <div className={`splash-dot ${phase !== 'in' ? 'visible' : ''}`}
              style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.55)' }} />
            <div className={`splash-bar-r ${phase !== 'in' ? 'visible' : ''}`}
              style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.25)' }} />
          </div>

          <p
            className={`splash-sub ${phase === 'sub' || phase === 'out' ? 'visible' : ''}`}
            style={{
              marginTop: 16,
              fontSize: 13,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              fontWeight: 500,
            }}
          >
            Produtividade pessoal
          </p>
        </div>
      </div>
    </>
  )
}
