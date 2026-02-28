import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from './supabase'

interface AuthStore {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signInWithEmail:  (email: string, password: string) => Promise<void>
  signUpWithEmail:  (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut:          () => Promise<void>
  clearError:       () => void
  initAuth:         () => () => void
}

export const useAuth = create<AuthStore>((set) => ({
  user: null, session: null, loading: true, error: null,

  initAuth: () => {
    if (!supabaseConfigured) {
      set({ loading: false })
      return () => {}
    }

    // Subscribe FIRST so we don't miss any event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false, error: null })
    })

    // Then get current session (triggers onAuthStateChange if session exists)
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        set({ session, user: session?.user ?? null, loading: false })
      })
      .catch(() => set({ loading: false }))

    return () => subscription.unsubscribe()
  },

  signInWithEmail: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        set({ error: error.message, loading: false })
      } else {
        // onAuthStateChange will fire and update state, but also set immediately
        set({ session: data.session, user: data.session?.user ?? null, loading: false, error: null })
      }
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  signUpWithEmail: async (email, password, name) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      })
      if (error) {
        set({ error: error.message, loading: false })
      } else if (data.session) {
        // Email confirmation disabled — user logged in immediately
        set({ session: data.session, user: data.session.user, loading: false, error: null })
      } else {
        // Email confirmation required
        set({ loading: false, error: null })
      }
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      if (error) set({ error: error.message, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  signOut: async () => {
    try { await supabase.auth.signOut() } catch {}
    set({ user: null, session: null, error: null, loading: false })
  },

  clearError: () => set({ error: null }),
}))
