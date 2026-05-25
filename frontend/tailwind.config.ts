import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#00a279',
                    light: '#e6f6f1',
                    dark: '#008b67',
                },
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    // other standard slate colors
                },
                gray: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                }
            },
        },
    },
    plugins: [],
}
export default config
