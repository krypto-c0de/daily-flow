import { useState } from 'react'

interface Props { onDone: () => void }

const STEPS = [
  {
    emoji: '👋',
    title: 'Bem-vindo ao DailyFlow',
    desc: 'Organize suas metas e acompanhe seu progresso diário em um só lugar.',
  },
  {
    emoji: '🎯',
    title: 'Crie suas Metas',
    desc: 'Defina objetivos futuros como "Exercitar todo dia" ou "Ler 1 livro por mês".',
  },
  {
    emoji: '✅',
    title: 'Checklist Diário',
    desc: 'Adicione tarefas vinculadas às suas metas. Marque cada uma ao concluir.',
  },
  {
    emoji: '📊',
    title: 'Acompanhe sua Evolução',
    desc: 'Veja seu % diário, histórico de 7 dias e calendário de 30 dias no Resumo.',
  },
]

export default function Onboarding({ onDone }: Props) {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1
  const s = STEPS[step]

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center px-8"
      style={{ background: 'var(--paper)' }}>

      {/* Progress dots */}
      <div className="flex gap-2 mb-12">
        {STEPS.map((_, i) => (
          <div key={i} className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === step ? 24 : 6, background: i === step ? 'var(--ink)' : 'var(--line)' }} />
        ))}
      </div>

      {/* Content */}
      <div key={step} className="text-center fade-up">
        <div className="text-7xl mb-8">{s.emoji}</div>
        <h2 className="font-display text-3xl mb-4" style={{ color: 'var(--ink)' }}>{s.title}</h2>
        <p className="text-[16px] leading-relaxed" style={{ color: 'var(--muted)', maxWidth: 300, margin: '0 auto' }}>{s.desc}</p>
      </div>

      {/* Buttons */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-12 space-y-3"
        style={{ paddingBottom: 'calc(3rem + var(--safe-bottom))' }}>
        <button onClick={() => isLast ? onDone() : setStep(s => s + 1)}
          className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all active:scale-[0.98]"
          style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
          {isLast ? 'Começar agora →' : 'Continuar'}
        </button>
        {!isLast && (
          <button onClick={onDone}
            className="w-full py-3 text-[14px] transition-opacity active:opacity-60"
            style={{ color: 'var(--muted)' }}>
            Pular introdução
          </button>
        )}
      </div>
    </div>
  )
}
