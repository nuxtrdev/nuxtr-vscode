const unoCSSConfig = `import { defineConfig } from 'unocss'

export default defineConfig({

})
`
const tailwindCSSJSConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}
`

const tailwindCSSTSConfig = `import type { Config } from 'tailwindcss'

export default <Partial<Config>> {
  content: [],
  theme: {
    extend: {
    }
  },
  plugins: []
}
`

const tailwindCSSFile = `@tailwind base;
@tailwind components;
@tailwind utilities;`

const vuetifyConfigFile = `// vuetify.options.js
export default {
  breakpoint: {},
  icons: {},
  lang: {},
  rtl: true,
  theme: {}
}
`

export {
    unoCSSConfig,
    tailwindCSSJSConfig,
    tailwindCSSTSConfig,
    tailwindCSSFile,
    vuetifyConfigFile
}