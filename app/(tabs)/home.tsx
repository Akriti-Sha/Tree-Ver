
import { FlatList, RefreshControl, Text, View } from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { usePosts } from '../../hooks/usePosts'
import { PostCard } from '../../constants/PostCard'
import { TopThreeCarousel } from '../../constants/TopThreeCarousel'

export default function HomeScreen() {
    const { user } = useAuth()
    const { profile } = useProfile(user?.id)
    const { posts, topThree, loading, refetch } = usePosts()



    return (
        // scrolling posts
        <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            className="flex-1 bg-green-50"
            contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 300 }}

            // Pull-down-to-refresh
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={refetch} />
            }

            // This is shown ABOVE the list of posts
            ListHeaderComponent={
                <View>
                    <Text className="mb-1 text-3xl font-bold text-green-900">Community Page </Text>
                    <Text className="mb-6 text-gray-600">
                        Post and connect to the trees in our community !!
                    </Text>

                    {/* The horizontal scrolling top 3 carousel */}
                    <TopThreeCarousel posts={topThree} />
                </View>
            }

            // This is called for each post in the list
            renderItem={({ item }) => (
                <PostCard
                    post={item}
                    currentUserId={user?.id}
                    currentUserRole={profile?.role}
                    onRefresh={refetch}   // After liking/adopting, reload the feed
                />
            )}

            ItemSeparatorComponent={() => <View style={{ height: 20 }} />}

            // no posts yet on home page
            ListEmptyComponent={
                <View className="items-center py-20">
                    <Text className="text-lg text-gray-500">No posts yet, go to add post to add your very first one</Text>
                </View>
            }
        />
    )
}
