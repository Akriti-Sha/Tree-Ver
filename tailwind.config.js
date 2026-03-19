/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require("nativewind/preset")],
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./hooks/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#eefbf1",
                    100: "#d9f7df",
                    500: "#2f9e44",
                    700: "#237a34",
                    900: "#174f22",
                },
            },
        },
    },
    plugins: [],
};