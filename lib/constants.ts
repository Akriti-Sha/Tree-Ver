

// The list of tags a user can put on a tree post

export const POST_TAGS = [
    'healthy',
    'diseased',
    'damaged',
    'birds',
    'insects',
    'mammals',
    'small',
    'medium',
    'large',
] as const


// A TypeScript type that means: "one of the POST_TAGS values"
export type PostTag = (typeof POST_TAGS)[number]