export const unoCSSConfig = `import { defineConfig } from 'unocss'

export default defineConfig({

})`

export const windiCSSConfig = `import { defineConfig } from 'windicss/helpers'

export default defineConfig({

})`

export const tailwindCSSConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}`

export const tailwindCSSFile = `@tailwind base
@tailwind components
@tailwind utilities`

export const vuetifyConfigFile = `// vuetify.options.js
export default {
  breakpoint: {},
  icons: {},
  lang: {},
  rtl: true,
  theme: {}
}`
