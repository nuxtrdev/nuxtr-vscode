const unoCSSConfig = `import { defineConfig } from 'unocss'

export default defineConfig({

})
`

const windiCSSConfig = `import { defineConfig } from 'windicss/helpers'

export default defineConfig({

})
`

const tailwindCSSConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
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
    windiCSSConfig,
    tailwindCSSConfig,
    tailwindCSSFile,
    vuetifyConfigFile
}