import { useState, useEffect } from 'react'
import { useAuth } from '../lib/useAuth'

type AuthMode = 'login' | 'signup'

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading, error, clearError } = useAuth()
  const [mode, setMode]         = useState<AuthMode>('login')
  const [email, setEmail]       = useState(() => localStorage.getItem('df-last-email') || '')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [showPass, setShowPass] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [mounted, setMounted]   = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])
  useEffect(() => { clearError(); setSuccessMsg('') }, [mode])
  
  // Save email to localStorage so it's pre-filled on next visit
  useEffect(() => {
    if (email.trim()) localStorage.setItem('df-last-email', email.trim())
  }, [email])

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return
    localStorage.setItem('df-last-email', email.trim())
    if (mode === 'signup') {
      await signUpWithEmail(email.trim(), password, name.trim())
      // Check state AFTER await
      const st = useAuth.getState()
      if (!st.error) {
        if (!st.user) {
          // Email confirmation required - Supabase setting
          setSuccessMsg('Conta criada! Verifique seu e-mail para confirmar e depois faça login.')
          setMode('login')
        }
        // If st.user exists, App.tsx auto-navigates via Zustand re-render
      }
    } else {
      await signInWithEmail(email.trim(), password)
      // App.tsx is subscribed to useAuth() — if user is set, it re-renders and shows main app
    }
  }

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <>
      <style>{`
        /* ── grid background ── */
        .auth-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        /* ── inputs ── */
        .auth-inp {
          width: 100%;
          height: 48px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          color: #fff;
          font-size: 15px;
          padding: 0 14px;
          outline: none;
          font-family: inherit;
          transition: border-color .15s, background .15s;
        }
        .auth-inp::placeholder { color: rgba(255,255,255,0.22); }
        .auth-inp:focus {
          border-color: rgba(255,255,255,0.28);
          background: rgba(255,255,255,0.08);
        }
        /* ── label ── */
        .auth-lbl {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.32);
          margin-bottom: 7px;
        }
        /* ── Google btn ── */
        .auth-google {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; height: 48px; border-radius: 12px;
          background: #fff; color: #111;
          font-weight: 600; font-size: 14px;
          border: none; cursor: pointer;
          transition: opacity .15s;
          font-family: inherit;
        }
        .auth-google:hover { opacity: .9; }
        .auth-google:disabled { opacity: .5; cursor: default; }
        /* ── email btn ── */
        .auth-email-btn {
          width: 100%; height: 48px; border-radius: 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.9);
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: inherit;
          transition: background .15s;
        }
        .auth-email-btn:hover { background: rgba(255,255,255,0.12); }
        .auth-email-btn:disabled { opacity: .4; cursor: default; }
        /* ── divider ── */
        .auth-div { display:flex; align-items:center; gap:12px; }
        .auth-div-line { flex:1; height:1px; background:rgba(255,255,255,0.08); }
        .auth-div-txt { font-size:12px; color:rgba(255,255,255,0.2); }
        /* ── feedback ── */
        .auth-err {
          padding: 12px 14px; border-radius: 12px; font-size: 13px;
          background: rgba(239,68,68,.12); color: #FCA5A5;
          border: 1px solid rgba(239,68,68,.2);
          display: flex; gap: 8px; align-items: flex-start;
        }
        .auth-ok {
          padding: 12px 14px; border-radius: 12px; font-size: 13px;
          background: rgba(34,197,94,.12); color: #86EFAC;
          border: 1px solid rgba(34,197,94,.2);
          display: flex; gap: 8px; align-items: flex-start;
        }
        /* ── left panel quote ── */
        .auth-quote {
          font-family: var(--font-system);
          font-size: clamp(36px, 3.8vw, 60px);
          line-height: 1.1;
          letter-spacing: -.03em;
          color: #fff;
        }
        .auth-quote em { color: rgba(255,255,255,0.28); font-style: italic; }
        /* ── mobile: slide-up form ── */
        @keyframes authSlideUp {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .auth-slide-up { animation: authSlideUp .45s ease both; }
        /* ── scrollbar hide ── */
        .auth-scroll { overflow-y:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
        .auth-scroll::-webkit-scrollbar { display:none; }
      `}</style>

      <div
        className="auth-grid fixed inset-0 flex"
        style={{
          background: '#080808',
          paddingTop: 'var(--safe-top)',
          paddingBottom: 'var(--safe-bottom)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity .4s ease',
        }}
      >

        {/* ════════════════════════════════════
            LEFT PANEL — desktop only
        ════════════════════════════════════ */}
        <div
          className="hidden lg:flex flex-col justify-between flex-shrink-0 relative overflow-hidden"
          style={{
            width: '50%',
            padding: '48px 56px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            background: '#0D0D0D',
          }}
        >
          {/* Logo — wordmark only, no icon */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{
              color:'#fff', fontWeight:700, letterSpacing:'-.02em',
              fontFamily:'var(--font-system)', fontSize:18,
            }}>
              DailyFlow
            </span>
          </div>

          {/* Quote */}
          <div>
            <p className="auth-quote">
              Pequenas ações<br/>
              <em>repetidas</em><br/>
              mudam tudo.
            </p>
            <p style={{ marginTop:20, fontSize:12, color:'rgba(255,255,255,0.2)', letterSpacing:'.1em', textTransform:'uppercase' }}>
              — Princípio DailyFlow
            </p>
          </div>

          {/* Version tag */}
          <div>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.18)', letterSpacing:'.06em' }}>
              v1.0 · Produtividade pessoal
            </span>
          </div>

          {/* Subtle corner number */}
          <span style={{
            position:'absolute', bottom:40, right:48,
            fontFamily:'var(--font-system)',
            fontSize:120, lineHeight:1,
            color:'rgba(255,255,255,0.03)',
            userSelect:'none', pointerEvents:'none',
          }}>01</span>
        </div>

        {/* ════════════════════════════════════
            RIGHT PANEL — form (desktop + mobile)
        ════════════════════════════════════ */}
        <div
          className="auth-scroll flex-1 flex flex-col justify-center"
          style={{ padding: 'clamp(32px, 6vw, 64px) clamp(24px, 6vw, 64px)' }}
        >
          <div style={{ maxWidth: 400, width:'100%', margin:'0 auto' }}>

            {/* Mobile logo — wordmark only */}
            <div
              className="mb-10 lg:hidden auth-slide-up"
              style={{ animationDelay:'.05s' }}
            >
              <span style={{
                color:'#fff', fontWeight:700, letterSpacing:'-.03em',
                fontFamily:'var(--font-system)', fontSize:22,
              }}>DailyFlow</span>
            </div>

            {/* Heading */}
            <div className="auth-slide-up mb-8" style={{ animationDelay:'.08s' }}>
              <h1 style={{
                fontFamily:'var(--font-system)',
                fontSize:'clamp(26px, 4vw, 32px)',
                color:'#fff', letterSpacing:'-.03em', lineHeight:1.15, marginBottom:6,
              }}>
                {mode === 'login' ? 'Bem-vindo de volta' : 'Comece hoje'}
              </h1>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.32)', lineHeight:1.5 }}>
                {mode === 'login'
                  ? 'Entre na sua conta para continuar.'
                  : 'Crie sua conta gratuita agora.'}
              </p>
            </div>

            {/* ── Google ── */}
            <div className="auth-slide-up" style={{ animationDelay:'.12s', marginBottom:16 }}>
              <button className="auth-google" onClick={async () => {
                setGoogleLoading(true)
                await signInWithGoogle()
                setGoogleLoading(false)
              }} disabled={googleLoading}>
                {googleLoading
                  ? <Spinner color="#333"/>
                  : <>
                      <GoogleIcon/>
                      Continuar com Google
                    </>
                }
              </button>
            </div>

            {/* ── Divider ── */}
            <div className="auth-div auth-slide-up" style={{ animationDelay:'.15s', marginBottom:16 }}>
              <div className="auth-div-line"/>
              <span className="auth-div-txt">ou</span>
              <div className="auth-div-line"/>
            </div>

            {/* ── Fields ── */}
            <div className="auth-slide-up" style={{ animationDelay:'.18s' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

                {mode === 'signup' && (
                  <div>
                    <label className="auth-lbl">Nome</label>
                    <input className="auth-inp" type="text" placeholder="Seu nome"
                      value={name} onChange={e => setName(e.target.value)}
                      onKeyDown={onKey} autoComplete="name"/>
                  </div>
                )}

                <div>
                  <label className="auth-lbl">E-mail</label>
                  <input className="auth-inp" type="email" placeholder="voce@email.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={onKey} autoComplete="email" inputMode="email"/>
                </div>

                <div>
                  <label className="auth-lbl">Senha</label>
                  <div style={{ position:'relative' }}>
                    <input
                      className="auth-inp"
                      style={{ paddingRight:44 }}
                      type={showPass ? 'text' : 'password'}
                      placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                      value={password} onChange={e => setPassword(e.target.value)}
                      onKeyDown={onKey}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      onClick={() => setShowPass(v => !v)}
                      style={{
                        position:'absolute', right:13, top:'50%', transform:'translateY(-50%)',
                        color:'rgba(255,255,255,0.28)', background:'none', border:'none',
                        cursor:'pointer', display:'flex', alignItems:'center',
                      }}
                    >
                      <EyeIcon open={showPass}/>
                    </button>
                  </div>
                </div>

                {/* Feedback */}
                {error && (
                  <div className="auth-err fade-up">
                    <span style={{ flexShrink:0 }}>⚠</span> {translateError(error)}
                  </div>
                )}
                {successMsg && (
                  <div className="auth-ok fade-up">
                    <span style={{ flexShrink:0 }}>✓</span> {successMsg}
                  </div>
                )}

                {/* Submit */}
                <button
                  className="auth-email-btn"
                  onClick={handleSubmit}
                  disabled={loading || !email.trim() || !password.trim()}
                  style={{ marginTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                >
                  {loading
                    ? <Spinner color="rgba(255,255,255,0.7)"/>
                    : (mode === 'login' ? 'Entrar com e-mail' : 'Criar conta')
                  }
                </button>
              </div>
            </div>

            {/* ── Toggle mode ── */}
            <p
              className="auth-slide-up"
              style={{ animationDelay:'.22s', marginTop:20, textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.28)' }}
            >
              {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                style={{ color:'rgba(255,255,255,0.7)', fontWeight:600, background:'none', border:'none', cursor:'pointer', fontSize:13 }}
              >
                {mode === 'login' ? 'Criar agora' : 'Entrar'}
              </button>
            </p>

            {/* ── Offline ── */}
            <p
              className="auth-slide-up"
              style={{ animationDelay:'.25s', marginTop:10, textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.16)' }}
            >
              <button
                onClick={() => { localStorage.setItem('dailyflow-offline-mode','1'); window.location.reload() }}
                style={{
                  background:'none', border:'none', cursor:'pointer',
                  textDecoration:'underline', textUnderlineOffset:3,
                  color:'inherit', fontSize:'inherit',
                }}
              >
                Usar sem conta
              </button>
            </p>

          </div>
        </div>
      </div>
    </>
  )
}

/* ── micro-components ── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  )
}

function Spinner({ color }: { color: string }) {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.15"/>
      <path d="M21 12a9 9 0 00-9-9"/>
    </svg>
  )
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (msg.includes('Email not confirmed'))       return 'Confirme seu e-mail antes de entrar.'
  if (msg.includes('User already registered'))   return 'Este e-mail já está cadastrado.'
  if (msg.includes('Password should be'))        return 'A senha deve ter pelo menos 6 caracteres.'
  if (msg.includes('rate limit'))                return 'Muitas tentativas. Aguarde alguns minutos.'
  return msg
}
