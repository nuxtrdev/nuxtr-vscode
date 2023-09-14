const eslintConfig = `{
    "extends": ["@nuxtjs/eslint-config-typescript"]
}
`

const stylelintConfig = `{
  "extends": "stylelint-config-recommended-vue"
}
`

const stylelintIgnore = `node_modules`

const eslintIgnore = `dist
node_modules
schema
**/*.tmpl.*
sw.js
`


export { eslintConfig, stylelintConfig, stylelintIgnore, eslintIgnore }