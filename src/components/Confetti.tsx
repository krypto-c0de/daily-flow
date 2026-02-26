import { useEffect, useRef } from 'react'

const COLORS = ['#1A1A1A','#4CAF50','#2196F3','#FF9800','#9C27B0','#F44336','#FFD700']

interface Piece {
  x: number
  left: number
  delay: number
  duration: number
  color: string
  rotate: number
  size: number
  shape: 'rect' | 'circle'
}

export default function Confetti({ onDone }: { onDone?: () => void }) {
  const pieces = useRef<Piece[]>(
    Array.from({ length: 60 }, () => ({
      x: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 2.2 + Math.random() * 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 8,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }))
  )

  useEffect(() => {
    const maxDuration = Math.max(...pieces.current.map(p => p.delay + p.duration)) * 1000
    const t = setTimeout(() => onDone?.(), maxDuration + 200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.current.map((p, i) => (
        <div
          key={i}
          className="confetti-piece absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.shape === 'rect' ? p.size * 0.6 : p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
      {/* Big emoji center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-7xl animate-bounce" style={{ animationDuration: '0.6s' }}>🎉</div>
      </div>
    </div>
  )
}
