
import { useState } from 'react'
import { Alert, Text, View } from 'react-native'
import { Link, router } from 'expo-router'
import { AppButton } from '../../constants/AppButton'
import { AppInput } from '../../constants/AppInput'
import { registerUser } from '../../lib/auth'

export default function RegisterScreen() {
    // Three pieces of state — one for each input field
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleRegister() {
        // Basic checks before sending to Supabase
        if (!username.trim()) {
            Alert.alert('Missing username', 'Please choose a username.')
            return
        }
        if (!email.trim()) {
            Alert.alert('Missing email', 'Please enter your email address.')
            return
        }
        if (password.length < 6) {
            Alert.alert('Weak password', 'Password must be at least 6 characters.')
            return
        }

        try {
            setLoading(true)

            await registerUser({
                username: username.trim(),
                email: email.trim(),
                password,
            })

            // Registration worked! Tell the user and send them to login.
            Alert.alert(
                'Account created! ',
                'You can now log in with your email and password.',
                [{ text: 'Go to Login', onPress: () => router.replace('/(auth)/login') }]
            )

        } catch (error: any) {
            Alert.alert('Registration failed', error.message ?? 'Something went wrong')

        } finally {
            setLoading(false)
        }
    }

    return (
        <View className="flex-1 bg-green-50 px-6 pt-24">

            {/* Page title */}
            <Text className="mb-2 text-4xl font-bold text-green-900">Create account</Text>
            <Text className="mb-8 text-base text-gray-700">
                Join the community and share trees. 🌿
            </Text>

            {/* Input fields */}
            <View className="gap-4">

                {/* Username — shown on their posts */}
                <AppInput
                    placeholder="Username (shown to others)"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                {/* Email — used to log in */}
                <AppInput
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                {/* Password */}
                <AppInput
                    placeholder="Password (6+ characters)"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                {/* Register button */}
                <AppButton
                    title={loading ? 'Creating account...' : 'Register'}
                    onPress={handleRegister}
                    disabled={loading}
                />

            </View>

            {/* Link back to login */}
            <Link href="/(auth)/login" className="mt-6 text-center text-green-700">
                Already have an account? Log in
            </Link>

        </View>
    )
}