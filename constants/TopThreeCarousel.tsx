import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

// This component takes in an array of posts to display
type TopThreeCarouselProps = {
    posts: any[]
}

export function TopThreeCarousel({ posts }: TopThreeCarouselProps) {
    return (
        <View className="mb-6">

            {/* Section title */}
            <Text className="mb-3 text-xl font-bold text-gray-900">
               Top 3 Most-Liked Posts
            </Text>

            {/* horizontal={true} lets the user scroll left and right */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-4">

                    {/* Show one card for each post */}
                    {posts.map((post) => (
                        <View
                            key={post.id}
                            className="w-64 overflow-hidden rounded-3xl bg-white shadow"
                        >
                            {/* Tree photo */}
                            <Image source={{ uri: post.image_url }} className="h-40 w-full" />

                            {/* Buttons row */}
                            <View className="flex-row items-center justify-between p-3">

                                {/* Like count */}
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="heart" size={20} color="#DC2626" />
                                    <Text className="text-sm text-gray-700">{post.likes?.length ?? 0}</Text>
                                </View>

                                {/* Button to open this tree on the map */}
                                <Pressable
                                    onPress={() =>
                                        router.push({
                                            pathname: '/(tabs)/map',
                                            params: {
                                                treeId: post.tree_id,
                                                lat: post.trees?.latitude?.toString() ?? '',
                                                lng: post.trees?.longitude?.toString() ?? '',
                                            },
                                        })
                                    }
                                >
                                    <Ionicons name="location" size={20} color="#111827" />
                                </Pressable>

                            </View>
                        </View>
                    ))}

                </View>
            </ScrollView>
        </View>
    )
}