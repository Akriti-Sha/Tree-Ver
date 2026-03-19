import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,            // No title bar at the top
                tabBarActiveTintColor: '#16A34A', // Green for the selected tab
                tabBarInactiveTintColor: '#9CA3AF', // Grey for unselected tabs
            }}
        >

            {/* HOME tab — shows the feed of tree posts */}
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />

            {/* MAP tab — shows trees on a map */}
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Map',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map" size={size} color={color} />
                    ),
                }}
            />

            {/* ADD POST tab — upload a new tree photo */}
            <Tabs.Screen
                name="add-post"
                options={{
                    title: 'Add Post',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle" size={size} color={color} />
                    ),
                }}
            />

            {/* GUARDIAN tab — apply to become a Guardian */}
            <Tabs.Screen
                name="guardian"
                options={{
                    title: 'Guardian',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="shield-checkmark" size={size} color={color} />
                    ),
                }}
            />

            {/* PROFILE tab — view and edit your profile */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />

        </Tabs>
    )
}