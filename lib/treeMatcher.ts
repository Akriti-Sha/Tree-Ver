// ============================================================
// lib/treeMatcher.ts
// When someone posts a tree, we need to work out:
// Is this a tree we already know about? Or a brand new one?
// We do this by checking if the GPS location is close to an existing tree.
// ============================================================

import { supabase } from './supabase'

// How close (in metres) two posts have to be to count as the SAME tree
const MAX_DISTANCE_METRES = 15

// --- Distance calculator ---
// This uses maths (the Haversine formula) to work out how far apart
// two GPS points are, in metres.
function getDistanceMetres(
    lat1: number, lon1: number,
    lat2: number, lon2: number
) {
    const R = 6371000 // Earth's radius in metres
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in metres
}

// --- Main function ---
// Given a GPS location (or manual text), find an existing nearby tree
// OR create a brand new tree record in the database.
export async function findOrCreateTree(params: {
    latitude?: number | null
    longitude?: number | null
    manualLocationText?: string | null
}) {
    const { latitude, longitude, manualLocationText } = params

    // Step 1: If we have GPS, look for a nearby existing tree
    if (latitude != null && longitude != null) {
        // Get all trees that have GPS coordinates from the database
        const { data: trees, error } = await supabase
            .from('trees')
            .select('*')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null)

        if (error) throw error

        // Check each tree: is it within 15 metres of us?
        const nearbyTree = trees?.find((tree) => {
            const distance = getDistanceMetres(latitude, longitude, tree.latitude, tree.longitude)
            return distance <= MAX_DISTANCE_METRES
        })

        // If we found a match, use that existing tree
        if (nearbyTree) return nearbyTree
    }

    // Step 2: No nearby tree found — create a new one in the database
    const { data: newTree, error: createError } = await supabase
        .from('trees')
        .insert({
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            manual_location_text: manualLocationText ?? null,
        })
        .select()
        .single() // .single() means: we only expect one row back

    if (createError) throw createError

    return newTree
}