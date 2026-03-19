
import { useState } from 'react'
import { Alert, Text, View } from 'react-native'
import { Link, router } from 'expo-router'
import { AppButton } from '../../constants/AppButton'
import { AppInput } from '../../constants//AppInput'
import { loginUser } from '../../lib/auth'

export default function LoginScreen() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleLogin() {

        try {
            setLoading(true)


            await loginUser(email.trim(), password)


            router.replace('/(tabs)/home')

        } catch (error: any) {

            Alert.alert('Login failed', error.message ?? 'Something went wrong')

        } finally {

            setLoading(false)
        }
    }

    return (
        <View className="flex-1 bg-green-50 px-6 pt-24">


            <Text className="mb-2 text-4xl font-bold text-green-900"> Treevor</Text>
            <Text className="mb-8 text-base text-gray-700">
                Log in to explore and protect trees.
            </Text>


            <View className="gap-4">


                <AppInput
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                {}
                <AppInput
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                {/* Login button — shows "Logging in..." while waiting */}
                <AppButton
                    title={loading ? 'Logging in...' : 'Log in'}
                    onPress={handleLogin}
                    disabled={loading} // Disable the button while loading
                />

            </View>

            {/* Link to the register screen */}
            <Link href="/(auth)/register" className="mt-6 text-center text-green-700">
                Dont  have an account? Register here
            </Link>

        </View>
    )
}