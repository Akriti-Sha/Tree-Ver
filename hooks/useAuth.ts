

import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  // 'session' stores the current login session (or null if not logged in)
  const [session, setSession] = useState<Session | null>(null)

  // 'loading' is true while we're checking if the user is logged in
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Step 1: Check if there's already a saved session from last time
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setLoading(false)
    })

    // Step 2: Listen for any login/logout changes while the app is open
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession ?? null)
        setLoading(false)
      }
    )

    // Step 3: When this hook is no longer needed, stop listening
    return () => subscription.unsubscribe()
  }, [])

  return {
    session,                          // The full session object
    user: session?.user ?? null,      // Just the user part
    loading,                          // Are we still checking?
    isLoggedIn: !!session?.user,      // Simple true/false
  }
}