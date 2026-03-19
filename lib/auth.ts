// ============================================================
// lib/auth.ts
// These are helper functions for logging in, registering,
// and logging out. They use Supabase to do the hard work.
// ============================================================

import { supabase } from './supabase'

// --- REGISTER ---
// This is called when someone creates a new account.
// It sends their details to Supabase which stores them safely.
export async function registerUser(params: {
    email: string
    password: string
    username: string
}) {
    const { email, password, username } = params

    // Tell Supabase to create a new account
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username }, // Also save their chosen username
        },
    })

    // If something went wrong, throw the error so we can show a message
    if (error) throw error

    return data
}

// --- LOGIN ---
// This is called when someone signs in with their email and password.
export async function loginUser(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) throw error

    return data
}

// --- LOGOUT ---
// This signs the user out and clears their saved login.
export async function logoutUser() {
    const { error } = await supabase.auth.signOut()

    if (error) throw error
}