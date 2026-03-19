

import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { AppButton } from '../../constants/AppButton'
import { supabase } from '../../lib/supabase'

export default function GuardianScreen() {
    const { user } = useAuth()
    const { profile } = useProfile(user?.id)

    // --- Form state ---
    const [reason, setReason] = useState('')           // Why do they want to be a Guardian?
    const [isOver16, setIsOver16] = useState(false)    // Checkbox: are they over 16?
    const [agreedToRules, setAgreedToRules] = useState(false) // Checkbox: agreed to rules?
    const [loading, setLoading] = useState(false)

    // The user's most recent application (if they've applied before)
    const [latestApplication, setLatestApplication] = useState<any>(null)

    // Load the user's latest application when the screen opens
    useEffect(() => {
        async function loadApplication() {
            if (!user?.id) return

            const { data } = await supabase
                .from('guardian_applications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false }) // Most recent first
                .limit(1)                                   // Only get 1 result
                .maybeSingle()                              // It's okay if there are none

            setLatestApplication(data ?? null)
        }

        loadApplication()
    }, [user?.id])

    // --- Submit the application ---
    async function handleSubmit() {
        if (!user?.id) return

        // Validation
        if (!reason.trim()) {
            Alert.alert('Missing reason', 'Please explain why you want to be a Guardian.')
            return
        }
        if (!isOver16 || !agreedToRules) {
            Alert.alert('Checkboxes required', 'Please tick both boxes to continue.')
            return
        }

        try {
            setLoading(true)

            // Insert a new application row into the database
            const { error } = await supabase.from('guardian_applications').insert({
                user_id: user.id,
                username_snapshot: profile?.username ?? '',  // Save their username at time of applying
                reason,
                is_over_16: isOver16,
                agreed_to_rules: agreedToRules,
            })

            if (error) throw error

            Alert.alert('Application sent! ', 'An admin will review your application.')

            // Reset the form
            setReason('')
            setIsOver16(false)
            setAgreedToRules(false)

        } catch (error: any) {
            Alert.alert('Submission failed', error.message ?? 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    // Helper: pick a colour for the application status badge
    function statusColour(status: string) {
        if (status === 'approved') return 'bg-green-100 text-green-800'
        if (status === 'rejected') return 'bg-red-100 text-red-800'
        return 'bg-yellow-100 text-yellow-800' // pending
    }

    return (
        <ScrollView
            className="flex-1 bg-green-50"
            contentContainerStyle={{ padding: 16, paddingTop: 56, paddingBottom: 120 }}
        >
            {/* Page title */}
            <Text className="mb-1 text-3xl font-bold text-green-900"> Become a Guardian</Text>
            <Text className="mb-6 text-gray-600">
                Guardians help care for trees, keep records updated, and adopt trees that need attention.
            </Text>

            {/* --- Already a Guardian? Show a banner --- */}
            {profile?.role === 'guardian' && (
                <View className="mb-6 flex-row items-center gap-3 rounded-2xl bg-green-100 p-4">
                    <Ionicons name="shield-checkmark" size={24} color="#16A34A" />
                    <Text className="font-semibold text-green-800">
                        You are already a Guardian! You can adopt trees from the feed.
                    </Text>
                </View>
            )}

            {/* --- Show latest application status --- */}
            {latestApplication && (
                <View className="mb-6 rounded-2xl bg-white p-4 shadow">
                    <Text className="mb-2 font-semibold text-gray-900">Your latest application</Text>

                    {/* Status badge */}
                    <View className={`self-start rounded-full px-3 py-1 ${statusColour(latestApplication.status)}`}>
                        <Text className="text-sm font-medium capitalize">{latestApplication.status}</Text>
                    </View>

                    {/* Admin's reason if they gave one */}
                    {latestApplication.admin_reason ? (
                        <Text className="mt-2 text-gray-600">
                            Admin note: {latestApplication.admin_reason}
                        </Text>
                    ) : null}
                </View>
            )}

            {/* --- Application form (only shown if not already a Guardian) --- */}
            {profile?.role !== 'guardian' && (
                <View className="rounded-2xl bg-white p-4 shadow">
                    <Text className="mb-4 text-lg font-bold text-gray-900">Application form</Text>

                    {/* Username (read-only — pre-filled) */}
                    <Text className="mb-1 font-semibold text-gray-700">Username</Text>
                    <View className="mb-4 rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3">
                        <Text className="text-gray-600">{profile?.username ?? '...'}</Text>
                    </View>

                    {/* Reason text box */}
                    <Text className="mb-1 font-semibold text-gray-700">
                        Why do you want to be a Guardian?
                    </Text>
                    <TextInput
                        value={reason}
                        onChangeText={setReason}
                        multiline
                        placeholder="Tell us why you'd like to care for trees..."
                        placeholderTextColor="#9CA3AF"
                        className="mb-4 min-h-24 rounded-2xl border border-gray-300 p-4 text-base"
                    />

                    {/* Checkbox: over 16 */}
                    <Pressable
                        onPress={() => setIsOver16((v) => !v)}
                        className="mb-3 flex-row items-center gap-3"
                    >
                        <View
                            className={`h-6 w-6 items-center justify-center rounded border ${
                                isOver16 ? 'border-green-600 bg-green-600' : 'border-gray-400 bg-white'
                            }`}
                        >
                            {isOver16 && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                        <Text className="text-gray-800">I confirm I am over 16 years old</Text>
                    </Pressable>

                    {/* Checkbox: agreed to rules */}
                    <Pressable
                        onPress={() => setAgreedToRules((v) => !v)}
                        className="mb-6 flex-row items-center gap-3"
                    >
                        <View
                            className={`h-6 w-6 items-center justify-center rounded border ${
                                agreedToRules ? 'border-green-600 bg-green-600' : 'border-gray-400 bg-white'
                            }`}
                        >
                            {agreedToRules && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                        <Text className="text-gray-800">I agree to the Guardian rules and responsibilities</Text>
                    </Pressable>

                    {/* Submit button */}
                    <AppButton
                        title={loading ? 'Submitting...' : '️ Submit Application'}
                        onPress={handleSubmit}
                        disabled={loading}
                    />
                </View>
            )}

        </ScrollView>
    )
}