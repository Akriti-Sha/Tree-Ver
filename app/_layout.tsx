
import '../global.css'
import { Stack } from 'expo-router'

export default function RootLayout() {
    return (

        <Stack screenOptions={{ headerShown: false }}>
            {/* The first screen shown — decides if we go to login or home */}
            <Stack.Screen name="index" />

            {/* The (auth) folder contains login and register screens */}
            <Stack.Screen name="(auth)" />

            {/* The (tabs) folder contains the main screens with the bottom tab bar */}
            <Stack.Screen name="(tabs)" />

            {/* Individual post detail page — [id] means it accepts any post id */}
            <Stack.Screen name="post/[id]" />
        </Stack>
    )
}