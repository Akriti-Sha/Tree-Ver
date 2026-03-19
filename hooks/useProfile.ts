// ============================================================
// hooks/useProfile.ts
// This hook loads a user's profile from the database.
// Pass in a userId and it gives you back their profile info
// (username, role, avatar etc.)
// ============================================================

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useProfile(userId?: string) {
    // 'profile' will hold the user's data once it's loaded
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // If no userId was given, there's nothing to load
        if (!userId) {
            setProfile(null)
            setLoading(false)
            return
        }

        // Track if this request is still "active"
        // (prevents bugs when the component unmounts quickly)
        let active = true

        async function loadProfile() {
            setLoading(true)

            // Ask Supabase for the user's profile row
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId) // Find the row where id = userId
                .single()         // Expect exactly one result

            // If the component has already gone away, do nothing
            if (!active) return

            if (error) {
                console.error('Error loading profile:', error)
                setProfile(null)
            } else {
                setProfile(data) // Save the profile data
            }

            setLoading(false)
        }

        loadProfile()

        // Cleanup: mark this request as "no longer needed"
        return () => { active = false }
    }, [userId]) // Re-run this whenever userId changes

    return { profile, loading }
}