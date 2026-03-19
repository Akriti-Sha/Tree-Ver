import { Alert, Image, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '../lib/supabase'

type PostCardProps = {
    post: any
    currentUserId?: string
    currentUserRole?: 'general' | 'guardian' | 'admin'
    onRefresh?: () => void
}

export function PostCard({ post, currentUserId, currentUserRole, onRefresh }: PostCardProps) {
    const tags = post.post_tags?.map((t: any) => t.tag_name) ?? []
    const likedByMe = post.likes?.some((l: any) => l.user_id === currentUserId)
    const likeCount = post.likes?.length ?? 0
    const isAdopted = !!post.trees?.is_adopted
    const isMyAdoption = post.trees?.current_guardian_user_id === currentUserId

    async function handleToggleLike() {
        if (!currentUserId) return

        const { error } = await supabase.rpc('toggle_like', {
            p_post_id: post.id,
            p_user_id: currentUserId,
        })

        if (error) {
            Alert.alert('Error', error.message)
            return
        }

        onRefresh?.()
    }

    async function handleAdoption() {
        if (!currentUserId) return

        if (currentUserRole !== 'guardian' && currentUserRole !== 'admin') {
            Alert.alert('Guardians only', 'Apply to become a Guardian first!')
            return
        }

        try {
            if (isMyAdoption) {
                const { error } = await supabase.rpc('unadopt_tree', {
                    p_tree_id: post.tree_id,
                    p_guardian_user_id: currentUserId,
                })
                if (error) throw error
            } else {
                const { error } = await supabase.rpc('adopt_tree', {
                    p_tree_id: post.tree_id,
                    p_guardian_user_id: currentUserId,
                })
                if (error) throw error
            }

            onRefresh?.()
        } catch (error: any) {
            Alert.alert('Adoption failed', error.message ?? 'Something went wrong')
        }
    }

    function openOnMap() {
        router.push({
            pathname: '/(tabs)/map',
            params: {
                treeId: post.tree_id,
                lat: post.trees?.latitude?.toString() ?? '',
                lng: post.trees?.longitude?.toString() ?? '',
            },
        })
    }

    return (
        <View className="mb-5 overflow-hidden rounded-3xl bg-white shadow">
            {/* Author */}
            <View className="flex-row items-center gap-3 p-4">
                <View className="h-10 w-10 rounded-full bg-green-200" />
                <Text className="text-base font-semibold text-gray-900">
                    {post.users?.username}
                </Text>
            </View>

            {/* Image */}
            <Image
                source={{ uri: post.image_url }}
                className="h-72 w-full"
                resizeMode="cover"
            />

            {/* Bottom content area */}
            <View className="px-6 pt-5 pb-6">
                {/* Icons row on the right */}
                <View className="mb-4 w-full flex-row justify-end">
                    <View className="flex-row items-center gap-100">
                        <Pressable onPress={handleAdoption}>
                            <Ionicons
                                name="shield"
                                size={24}
                                color={isAdopted? '#16A34A' : '#9CA3AF'}
                            />
                        </Pressable>

                        <Pressable
                            onPress={handleToggleLike}
                            className="flex-row items-center gap-1"
                        >
                            <Ionicons
                                name={likedByMe ? 'heart' : 'heart-outline'}
                                size={24}
                                color={likedByMe? '#DC2626' : '#111827'}
                            />
                            <Text>{likeCount}</Text>
                        </Pressable>

                        <Pressable onPress={openOnMap}>
                            <Ionicons
                                name="location-outline"
                                size={24}
                                color="#111827"
                            />
                        </Pressable>
                    </View>
                </View>

                {/* Caption */}
                <Text className="mb-4 text-base leading-6 text-gray-900">
                    {post.caption}
                </Text>

                {/* Tags */}
                <View className="mt-1 flex-row flex-wrap">
                    {tags.map((tag: string) => (
                        <View
                            key={tag}
                            className="mr-3 mb-3 rounded-full bg-green-100 px-4 py-2"
                        >
                            <Text className="text-xs font-medium text-green-900">
                                #{tag}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    )
}
