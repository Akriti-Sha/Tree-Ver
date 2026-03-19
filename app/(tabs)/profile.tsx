import { useEffect, useState } from 'react'
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { AppButton } from '../../constants/AppButton'
import { PostCard } from '../../constants/PostCard'
import { supabase } from '../../lib/supabase'

export default function ProfileScreen() {

    const router = useRouter()

    const { user } = useAuth()

    const { profile } = useProfile(user?.id)

    const [username, setUsername] = useState('')
    const [myPosts, setMyPosts] = useState<any[]>([])
    const [totalLikes, setTotalLikes] = useState(0)

    // When profile loads, update username input
    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '')
        }
    }, [profile])

    // Load posts
    useEffect(() => {
        async function loadMyData() {

            if (!user?.id) return

            // Get posts from database
            const { data: posts, error: postsError } = await supabase
                .from('posts')

                .select(
                    'id, caption, created_at, image_url, user_id, tree_id, users ( username, avatar_id ), trees ( id, latitude, longitude, is_adopted, current_guardian_user_id ), post_tags ( tag_name ), post_reviews ( review_status ), likes ( user_id )'
                )

                .eq('user_id', user.id)

                // filter: exclude deleted posts
                .eq('is_deleted', false)

                .order('created_at', { ascending: false })

            // Handle errors
            if (postsError) {
                console.log('Error loading posts:', postsError.message)
                setMyPosts([])
                setTotalLikes(0)
            } else {

                // Save posts
                setMyPosts(posts || [])

                // Count total likes
                let likesCount = 0

                if (posts) {
                    for (let i = 0; i < posts.length; i++) {
                        const post = posts[i]

                        if (post.likes) {
                            likesCount = likesCount + post.likes.length
                        }
                    }
                }

                setTotalLikes(likesCount)
            }
        }

        loadMyData()

    }, [user?.id])

    // Save username changes function
    async function handleSaveProfile() {
        if (!user?.id) return

        const { error } = await supabase
            .from('users')
            .update({ username: username })
            .eq('id', user.id)

        if (error) {
            Alert.alert('Save failed', error.message)
            return
        }

        Alert.alert('Saved', 'Your profile has been updated')
    }

    // logout function
    async function doLogout() {
        const { error } = await supabase.auth.signOut()

        if (error) {
            Alert.alert('Logout failed', error.message)
            return
        }

        // Go to the login screen
        router.replace('/(auth)/login')
    }

    // Ask for confirmation before logging out
    function handleLogout() {
        Alert.alert(
            'Log out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log out', style: 'destructive', onPress: doLogout },
            ]
        )
    }

    return (
        <FlatList
            data={myPosts}
            keyExtractor={(item) => item.id.toString()}
            className="flex-1 bg-green-50"
            contentContainerStyle={{
                padding: 16,
                paddingTop: 56,
                paddingBottom: 120,
            }}


            ListHeaderComponent={
                <View>

                    {/* Header */}
                    <View className="mb-6 flex-row items-center justify-between">
                        <Text className="text-3xl font-bold text-green-900">
                            Profile
                        </Text>

                        <Pressable
                            onPress={handleLogout}
                            className="rounded-full bg-red-100 px-4 py-2"
                        >
                            <Text className="font-semibold text-red-600">
                                Log out
                            </Text>
                        </Pressable>
                    </View>

                    {/* Profile card */}
                    <View className="mb-6 rounded-3xl bg-white p-5 shadow">

                        {/* Role */}
                        <View className="mb-4 self-start rounded-full bg-green-100 px-3 py-1">
                            <Text className="text-sm font-semibold capitalize text-green-800">
                                {profile?.role || 'general'}
                            </Text>
                        </View>

                        {/* Profile details */}
                        <View className="mb-4 flex-row gap-6">

                            <View className="items-center">
                                <Text className="text-2xl font-bold text-green-700">
                                    {myPosts.length}
                                </Text>
                                <Text className="text-xs text-gray-500">Posts</Text>
                            </View>

                            {/*Total likes counter display */}

                            <View className="items-center">
                                <Text className="text-2xl font-bold text-red-500">
                                    {totalLikes}
                                </Text>
                                <Text className="text-xs text-gray-500">Likes received</Text>
                            </View>

                        </View>

                        {/* Displaying the username */}
                        <Text className="mb-1 font-semibold text-gray-700">
                            Username
                        </Text>

                        <TextInput
                            value={username}
                            onChangeText={setUsername}
                            className="mb-4 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-base"
                        />

                        {/* Saving changes to username button*/}
                        <View>
                            <AppButton
                                title="Save Profile"
                                onPress={handleSaveProfile}
                            />
                        </View>
                    </View>

                    {/* Posts*/}

                    <Text className="mb-4 text-xl font-bold text-gray-900">
                        My Posts
                    </Text>
                </View>
            }

            // The actual post itself
            renderItem={({ item }) => (
                <View className="mb-4">
                    <PostCard
                        post={item}
                        currentUserId={user?.id}
                        currentUserRole={profile?.role}
                    />
                </View>
            )}

            // If the user hasn't posted anything yet
            ListEmptyComponent={
                <View className="items-center py-10">
                    <Text className="text-gray-400">
                        You have not posted anything yet.
                    </Text>
                </View>
            }
        />
    )
}