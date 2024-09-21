const eslintConfig = `// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
)
`

const stylelintConfig = `{
  "extends": "stylelint-config-recommended-vue"
}
`

const stylelintIgnore = 'node_modules'


export { eslintConfig, stylelintConfig, stylelintIgnore }