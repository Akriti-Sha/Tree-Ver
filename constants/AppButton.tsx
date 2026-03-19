import { Pressable, Text } from 'react-native'

type AppButtonProps = {
    title: string
    onPress: () => void
    variant?: 'primary' | 'secondary' | 'danger'
    size?: 'normal' | 'large'
    disabled?: boolean
}

export function AppButton({
                              title,
                              onPress,
                              variant = 'primary',
                              size = 'normal',
                              disabled = false,
                          }: AppButtonProps) {
    const bgColour = {
        primary: 'bg-green-600',
        secondary: 'bg-gray-600',
        danger: 'bg-red-600',
    }[variant]

    const buttonSize = {
        normal: 'py-4',
        large: 'py-6',
    }[size]

    const textSize = {
        normal: 'text-base',
        large: 'text-lg',
    }[size]

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            className={`w-full rounded-2xl px-4 ${buttonSize} ${bgColour} ${disabled ? 'opacity-50' : ''}`}
        >
            <Text className={`text-center font-semibold text-white ${textSize}`}>
                {title}
            </Text>
        </Pressable>
    )
}