export const eslintConfig = `{
    "extends": ["@nuxtjs/eslint-config-typescript"]
}`

export const stylelintConfig = `{
  "extends": "stylelint-config-recommended-vue"
}`

export const stylelintIgnore = `node_modules`

export const eslintIgnore = `dist
node_modules
schema
**/*.tmpl.*
sw.js
`
