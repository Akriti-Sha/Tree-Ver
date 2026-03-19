
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// This TypeScript type describes what a post looks like
// (the shape of the data we get back from Supabase)
export type FeedPost = {
    id: string
    caption: string | null
    created_at: string
    image_url: string
    user_id: string
    tree_id: string
    users: { username: string; avatar_id: string | null }
    trees: {
        id: string
        latitude: number | null
        longitude: number | null
        is_adopted: boolean
        current_guardian_user_id: string | null
    }
    post_tags: { tag_name: string }[]
    post_reviews: { review_status: 'pending' | 'verified' | 'rejected' } | null
    likes: { user_id: string }[]
}

// --- Priority checker ---
// A post is "priority" (shown first) if:
// 1. It has a 'diseased' or 'damaged' tag
// 2. The review hasn't been rejected
// 3. The tree has NOT been adopted yet
function isPriorityPost(post: FeedPost): boolean {
    const tags = post.post_tags.map((t) => t.tag_name)
    const isUrgent = tags.includes('diseased') || tags.includes('damaged')
    const notRejected = !post.post_reviews || ['pending', 'verified'].includes(post.post_reviews.review_status)
    const notAdopted = !post.trees?.is_adopted
    return isUrgent && notRejected && notAdopted
}

// --- Main hook ---
export function usePosts() {
    const [posts, setPosts] = useState<FeedPost[]>([])
    const [loading, setLoading] = useState(true)

    // fetchPosts is wrapped in useCallback so it doesn't re-create
    // on every render (good for performance)
    const fetchPosts = useCallback(async () => {
        setLoading(true)

        // This big .select() fetches a post AND all the related data
        // (the author, the tree, the tags, the review, the likes)
        // in ONE database request. The indented names are "joins".
        const { data, error } = await supabase
            .from('posts')
            .select(`
        id,
        caption,
        created_at,
        image_url,
        user_id,
        tree_id,
        users ( username, avatar_id ),
        trees ( id, latitude, longitude, is_adopted, current_guardian_user_id ),
        post_tags ( tag_name ),
        post_reviews ( review_status ),
        likes ( user_id )
      `)
            .eq('is_deleted', false) // Only show posts that haven't been deleted

        if (error) {
            console.error('Error loading posts:', error)
            setPosts([])
            setLoading(false)
            return
        }

        // Sort the posts:
        // - Priority posts (urgent + not adopted) come first
        // - Within each group, newest posts come first
        const sorted = [...(data as FeedPost[])].sort((a, b) => {
            const aPriority = isPriorityPost(a) ? 1 : 0
            const bPriority = isPriorityPost(b) ? 1 : 0
            if (aPriority !== bPriority) return bPriority - aPriority
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        setPosts(sorted)
        setLoading(false)
    }, [])

    // Load posts as soon as this hook is first used
    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    // The top 3 most-liked posts (for the carousel at the top of the feed)
    const topThree = [...posts]
        .sort((a, b) => b.likes.length - a.likes.length)
        .slice(0, 3)

    return { posts, topThree, loading, refetch: fetchPosts }
}