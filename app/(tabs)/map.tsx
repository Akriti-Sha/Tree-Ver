import { useEffect, useMemo, useState } from 'react'
import { Alert, Text, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { useLocalSearchParams } from 'expo-router'
import { supabase } from '../../lib/supabase'


export default function MapScreen() {
    const { lat, lng } = useLocalSearchParams<{
        lat?: string
        lng?: string
    }>()

    const [trees, setTrees] = useState<any[]>([])

    useEffect(() => {
        const fetchTrees = async () => {
            const { data, error } = await supabase
                .from('trees')
                .select(`
          id,
          latitude,
          longitude,
          is_adopted
        `)
                .not('latitude', 'is', null)
                .not('longitude', 'is', null)

            if (error) {
                Alert.alert('Could not load map', error.message)
                return
            }

            setTrees(data ?? [])
        }

        fetchTrees()
    }, [])

    // Default = London
    const londonRegion = {
        latitude: 51.5074,
        longitude: -0.1278,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
    }

    // Use passed coords if available
    const initialRegion = useMemo(() => {
        const latitude = Number(lat)
        const longitude = Number(lng)

        const hasValidCoords =
            !Number.isNaN(latitude) && !Number.isNaN(longitude)

        if (hasValidCoords) {
            return {
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }
        }

        return londonRegion
    }, [lat, lng])

    return (
        <View className="flex-1">
            {/* Map */}
            <MapView style={{ flex: 1 }} initialRegion={initialRegion}>

                {/* Just show pins */}
                {trees.map((tree) => (
                    <Marker
                        key={tree.id}
                        coordinate={{
                            latitude: tree.latitude,
                            longitude: tree.longitude,
                        }}
                        // Green = adopted, Red = not adopted
                        pinColor={tree.is_adopted ? 'green' : 'red'}
                    />
                ))}

            </MapView>

            {/* Adopt green pin*/}
            <View className="absolute bottom-8 left-4 right-4 flex-row justify-center gap-6 rounded-2xl bg-white p-3 shadow">
                <View className="flex-row items-center gap-2">
                    <View className="h-4 w-4 rounded-full bg-green-600" />
                    <Text className="text-sm text-gray-700">Adopted</Text>
                </View>

                {/* unAdopt red pin*/}
                <View className="flex-row items-center gap-2">
                    <View className="h-4 w-4 rounded-full bg-red-500" />
                    <Text className="text-sm text-gray-700">Needs a Guardian</Text>
                </View>
            </View>
        </View>
    )
}