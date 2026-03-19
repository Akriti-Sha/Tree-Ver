

import { TextInput, TextInputProps, View } from 'react-native'

export function AppInput(props: TextInputProps) {
    return (
        <View className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-1">
            <TextInput
                placeholderTextColor="#9CA3AF"
                className="text-base text-gray-900"
                {...props}
            />
        </View>
    )
}