import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function initAuth() {
      const timeout = new Promise((resolve) => 
        setTimeout(() => resolve({ data: { session: null }, error: new Error("Supabase auth timeout after 2.5s") }), 2500)
      )

      try {
        const { data, error } = await Promise.race([
          supabase.auth.getSession(),
          timeout
        ])
        if (error) {
          console.error("Supabase session error:", error)
        }
        if (active) {
          setUser(data?.session?.user ?? null)
        }
      } catch (err) {
        console.error("Failed to get Supabase session:", err)
        if (active) {
          setUser(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    initAuth()

    let subscription = null
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      })
      subscription = data?.subscription
    } catch (err) {
      console.error("Failed to setup auth state change listener:", err)
    }

    return () => {
      active = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)