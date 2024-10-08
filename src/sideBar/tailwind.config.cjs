/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                green: {
                    50: '#D6FFEE',
                    100: '#ACFFDD',
                    200: '#83FFCC',
                    300: '#30FFAA',
                    500: '#00BD6F',
                    400: '#00dc82',
                    600: '#009D5D',
                    700: '#007E4A',
                    800: '#005E38',
                    900: '#003F25',
                },
                gray: {
                    50: '#FAFAFA',
                    100: '#F4F4F5',
                    200: '#E4E4E7',
                    300: '#D4D4D8',
                    400: '#A1A1AA',
                    500: '#71717A',
                    600: '#52525B',
                    700: '#3F3F46',
                    800: '#27272A',
                },
                base: {
                    1: '#ffffff',
                    2: '#F0F0F0',
                    3: '#E7E7E7',
                    4: '#E5E5E5',
                    5: '#D4D4D4',
                    6: '#CCCCCC',
                    7: '#C6C6C6',
                    8: '#BBBBBB',
                    9: '#A0A0A0',
                    10: '#808080',
                    11: '#7F7F7F',
                    12: '#606060',
                    13: '#454545',
                    14: '#3C3C3C',
                    15: '#3A3D41',
                    16: '#333333',
                    17: '#303031',
                    18: '#292929',
                    19: '#252526',
                    20: '#1E1E1E',
                    21: '#000000',
                },
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
            },
        },
    },
};
