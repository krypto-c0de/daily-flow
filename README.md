# DailyFlow PWA

Checklist diário vinculado a metas futuras. Instalável no iPhone via Safari.

## 🚀 Setup

```bash
npm install
npm run dev        # desenvolvimento
npm run build      # produção → pasta dist/
npm run preview    # preview local do build
```

## 📦 Deploy no Vercel

1. `npm run build`
2. Arraste a pasta `dist/` em vercel.com/new
   — ou conecte o repositório GitHub

## 📱 Instalar no iPhone

1. Abra o app no Safari
2. Toque em **Compartilhar → Adicionar à Tela de Início**
3. Funciona offline após a primeira visita

## 🗂 Estrutura

```
src/
  models/types.ts      # tipos TypeScript
  store/useStore.ts    # Zustand + localStorage
  views/               # TodayView, GoalsView, SummaryView
  components/          # TaskRow, GoalCard, ProgressHeader, Sheets
  App.tsx              # navegação por tabs
```
