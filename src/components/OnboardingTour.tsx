import { useState } from 'react'
import { useStore } from '../store/useStore'

interface Step {
  title: string
  desc: string
  emoji: string
  highlight?: string
}

const STEPS: Step[] = [
  {
    emoji: '👋',
    title: 'Bem-vindo ao DailyFlow!',
    desc: 'Seu app de produtividade pessoal. Organize metas e tarefas do dia a dia com simplicidade.',
  },
  {
    emoji: '🎯',
    title: 'Crie suas Metas',
    desc: 'Na aba "Metas", crie objetivos de longo prazo: exercitar, ler mais, economizar. Cada meta tem categoria e prazo.',
  },
  {
    emoji: '✅',
    title: 'Adicione Tarefas Diárias',
    desc: 'No botão "+" da tela Hoje, adicione tarefas vinculadas às suas metas. Você pode definir prioridade e recorrência.',
  },
  {
    emoji: '💪',
    title: 'Complete o seu Dia',
    desc: 'Toque no círculo para marcar tarefas como feitas. Deslize para a esquerda para deletar. Long-press para editar.',
  },
  {
    emoji: '📊',
    title: 'Acompanhe seu Progresso',
    desc: 'Na aba "Resumo", veja streak de dias, calendário dos últimos 30 dias e evolução por meta. Bora lá! 🚀',
  },
]

export default function OnboardingTour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [exiting, setExiting] = useState(false)
  const { updateSettings } = useStore()

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  const next = () => {
    if (isLast) finish()
    else setStep(s => s + 1)
  }

  const finish = () => {
    setExiting(true)
    setTimeout(() => {
      updateSettings({ onboardingDone: true })
      onDone()
    }, 400)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-end"
      style={{
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: exiting ? 'fadeOut 0.4s ease forwards' : 'fadeIn 0.4s ease',
      }}
    >
      {/* Skip */}
      <button
        onClick={finish}
        className="absolute top-14 right-5 text-[13px] font-medium px-3 py-1.5 rounded-full"
        style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.12)' }}
      >
        Pular
      </button>

      {/* Card */}
      <div
        className="w-full rounded-t-3xl px-7 pt-8 pb-10 flex flex-col"
        style={{
          background: 'var(--paper)',
          paddingBottom: 'calc(2.5rem + var(--safe-bottom))',
          animation: 'slideUp 0.45s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Steps indicator */}
        <div className="flex gap-1.5 justify-center mb-7">
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 24 : 6,
                height: 6,
                borderRadius: 99,
                background: i === step ? 'var(--ink)' : 'var(--line)',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          ))}
        </div>

        {/* Emoji */}
        <div
          className="text-6xl text-center mb-5"
          style={{ animation: 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}
          key={step}
        >
          {current.emoji}
        </div>

        {/* Text */}
        <div style={{ animation: 'fadeUp 0.35s ease both 0.1s' }} key={`txt-${step}`}>
          <h2
            className="font-display text-2xl text-center mb-3 leading-snug"
            style={{ color: 'var(--ink)' }}
          >
            {current.title}
          </h2>
          <p
            className="text-[15px] text-center leading-relaxed"
            style={{ color: 'var(--muted)' }}
          >
            {current.desc}
          </p>
        </div>

        {/* Button */}
        <button
          onClick={next}
          className="mt-8 w-full py-4 rounded-2xl text-[16px] font-semibold transition-all active:scale-[0.97]"
          style={{ background: 'var(--ink)', color: 'var(--paper)' }}
        >
          {isLast ? 'Começar agora 🚀' : 'Próximo'}
        </button>
      </div>
    </div>
  )
}
