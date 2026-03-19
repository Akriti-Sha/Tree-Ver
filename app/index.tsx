
import { Redirect } from 'expo-router'


import { ActivityIndicator, View } from 'react-native'

import { useAuth } from "../hooks/useAuth"

export default function IndexScreen() {

  const { isLoggedIn, loading } = useAuth()


  if (loading) {
    return (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
    )
  }


  if (isLoggedIn) {
    return <Redirect href="/(tabs)/home" />
  }


  return <Redirect href="/(auth)/login" />
}