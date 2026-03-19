import { useState } from 'react'
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../hooks/useAuth'
import { AppButton } from '../../constants/AppButton'
import { POST_TAGS } from '../../lib/constants'
import { supabase } from '../../lib/supabase'
import { findOrCreateTree } from '../../lib/treeMatcher'

export default function AddPostScreen() {
    const { user } = useAuth()

    // Form state
    const [imageUri, setImageUri] = useState<string | null>(null)
    const [caption, setCaption] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [manualLocationText, setManualLocationText] = useState('')
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)

    // Opens the camera and saves the photo URI
    async function takePhoto() {
        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
        })

        if (!result.canceled) {
            setImageUri(result.assets[0].uri)
        }
    }

    // Asks for location permission and saves the current coordinates
    async function detectLocation() {
        const permission = await Location.requestForegroundPermissionsAsync()

        if (permission.status !== 'granted') {
            Alert.alert('Location not allowed', 'Please type your location manually below.')
            return
        }

        const currentPosition = await Location.getCurrentPositionAsync({})

        setLatitude(currentPosition.coords.latitude)
        setLongitude(currentPosition.coords.longitude)

        Alert.alert('Location captured!')
    }

    // Adds a tag if it is not selected, removes it if it already is
    function toggleTag(tag: string) {
        setSelectedTags((currentTags) =>
            currentTags.includes(tag)
                ? currentTags.filter((currentTag) => currentTag !== tag)
                : [...currentTags, tag]
        )
    }

    // Uploads the image to Supabase Storage and returns the public image URL
    async function uploadImage(uri: string): Promise<string> {
        const response = await fetch(uri)
        const imageData = await response.arrayBuffer()

        const fileName = `${user?.id}/${Date.now()}.jpg`

        const { error } = await supabase.storage
            .from('tree-images')
            .upload(fileName, imageData, {
                contentType: 'image/jpeg',
                upsert: false,
            })

        if (error) {
            throw error
        }

        const { data } = supabase.storage
            .from('tree-images')
            .getPublicUrl(fileName)

        return data.publicUrl
    }

    // Checks that the user filled in the required fields before posting
    function isFormValid() {
        if (!user?.id) {
            Alert.alert('Not logged in')
            return false
        }

        if (!imageUri) {
            Alert.alert('No image', 'Please take or choose a photo first.')
            return false
        }

        if (!latitude && !manualLocationText.trim()) {
            Alert.alert('No location', 'Please capture or type a location.')
            return false
        }

        return true
    }

    // Creates the post: upload image → find/create tree → save post → save tags
    async function handleSubmit() {
        if (!isFormValid()) return

        try {
            setLoading(true)

            const imageUrl = await uploadImage(imageUri!)

            const tree = await findOrCreateTree({
                latitude,
                longitude,
                manualLocationText: manualLocationText.trim() || null,
            })

            const { data: post, error: postError } = await supabase
                .from('posts')
                .insert({
                    user_id: user!.id,
                    tree_id: tree.id,
                    image_url: imageUrl,
                    caption,
                })
                .select()
                .single()

            if (postError) {
                throw postError
            }

            if (selectedTags.length > 0) {
                const tagRows = selectedTags.map((tag) => ({
                    post_id: post.id,
                    tag_name: tag,
                }))

                const { error: tagError } = await supabase
                    .from('post_tags')
                    .insert(tagRows)

                if (tagError) {
                    throw tagError
                }
            }

            Alert.alert('Posted! 🌳', 'Your tree has been shared.')

            // Reset the form after a successful post
            setImageUri(null)
            setCaption('')
            setSelectedTags([])
            setManualLocationText('')
            setLatitude(null)
            setLongitude(null)
        } catch (error: any) {
            Alert.alert('Post failed', error.message ?? 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScrollView
            className="flex-1 bg-green-50"
            contentContainerStyle={{ padding: 16, paddingTop: 56, paddingBottom: 120 }}
        >
            <Text className="mb-1 text-3xl font-bold text-green-900">Add Post</Text>

            {/* Photo section */}
            <View className="mb-4 gap-3">
                <AppButton title="Take a Photo" onPress={takePhoto} />
            </View>

            {imageUri ? (
                <Image source={{ uri: imageUri }} className="mb-6 h-72 w-full rounded-3xl" />
            ) : (
                <View className="mb-6 h-40 w-full items-center justify-center rounded-3xl border-2 border-dashed border-gray-300">
                    <Text className="text-gray-400">No photo chosen yet</Text>
                </View>
            )}

            {/* Caption section */}
            <Text className="mb-2 text-base font-semibold text-gray-800">Caption</Text>
            <TextInput
                value={caption}
                onChangeText={setCaption}
                multiline
                placeholder="Write something about this tree..."
                placeholderTextColor="#9CA3AF"
                className="mb-6 min-h-20 rounded-2xl border border-gray-300 bg-white p-4 text-base"
            />

            {/* Tags section */}
            <Text className="mb-2 text-base font-semibold text-gray-800">Tags</Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
                {POST_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag)
                    const isUrgentTag = tag === 'diseased' || tag === 'damaged'

                    return (
                        <Pressable
                            key={tag}
                            onPress={() => toggleTag(tag)}
                            className={`rounded-full px-4 py-2 ${
                                isSelected
                                    ? isUrgentTag
                                        ? 'bg-red-500'
                                        : 'bg-green-600'
                                    : 'border border-gray-300 bg-white'
                            }`}
                        >
                            <Text className={isSelected ? 'font-medium text-white' : 'text-gray-700'}>
                                {tag}
                            </Text>
                        </Pressable>
                    )
                })}
            </View>

            {/* Location section */}
            <Text className="mb-2 text-base font-semibold text-gray-800">Location</Text>

            {latitude && (
                <View className="mb-3 flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                    <Text className="text-green-700">GPS location captured!</Text>
                </View>
            )}

            <View className="mb-3">
                <AppButton title="Capture GPS Location" onPress={detectLocation} />
            </View>

            <TextInput
                value={manualLocationText}
                onChangeText={setManualLocationText}
                placeholder="Or type location manually (e.g. Hyde Park, London)"
                placeholderTextColor="#9CA3AF"
                className="mb-8 rounded-2xl border border-gray-300 bg-white p-4 text-base"
            />

            {/* Submit button */}
            <AppButton
                title={loading ? 'Uploading...' : 'Share Tree Post'}
                onPress={handleSubmit}
                disabled={loading}
            />
        </ScrollView>
    )
}