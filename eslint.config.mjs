/** Shared extension/sidebar lint policy; style rules preserve existing code conventions. */
import unjs from 'eslint-config-unjs';
import vue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

const extension = unjs({
    rules: {
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-duplicate-enum-values': 'off',
        // CommonJS is required by the extension host and official test runner.
        '@typescript-eslint/no-require-imports': 'off',
        'unicorn/prefer-class-fields': 'off',
        'curly': ['error', 'all'],
        'eqeqeq': 'warn',
        'no-throw-literal': 'warn',
        'semi': 'off',
        'no-multiple-empty-lines': 'warn',
        'no-empty': 'warn',
        'unicorn/filename-case': 'off',
        'unicorn/prefer-event-target': 'off',
        'unicorn/no-null': 'off',
        'unicorn/no-array-for-each': 'off',
        'dot-notation': 'error',
        'no-lonely-if': 'error',
        'no-useless-rename': 'error',
        'object-shorthand': 'error',
        'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: false }],
        'require-await': 'error',
        'sort-imports': ['error', { ignoreDeclarationSort: true }],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-template-curly-in-string': 'off',
        'array-callback-return': 'off',
        'camelcase': 'off',
        'no-console': 'off',
        'quotes': ['error', 'single'],
        'comma-spacing': ['error', { before: false, after: true }],
        'keyword-spacing': ['error', { before: true, after: true }],
        'space-before-function-paren': ['error', 'always'],
        'object-curly-spacing': ['error', 'always'],
        'arrow-spacing': ['error', { before: true, after: true }],
        'key-spacing': ['error', { beforeColon: false, afterColon: true, mode: 'strict' }],
        'space-before-blocks': ['error', 'always'],
        'space-infix-ops': ['error', { int32Hint: false }],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-extraneous-class': 'off',
        'comma-dangle': 'off',
    },
    ignores: [
        'out',
        '.agents/**',
        '.claude/**',
        'PLAN.md',
        'PROGRESS.md',
        'node_modules',
        '*.js',
        'src/sideBar/build'
    ]
});

// Vue owns template parsing; TypeScript parses script blocks. Preserve formatter-owned
// sidebar formatting while applying Vue error-prevention and TypeScript semantic rules.
const sidebarFiles = ['src/sideBar/**/*.vue'];
export default [
    // Editor downloads and extracted VSIX evidence contain third-party/generated code.
    { ignores: ['.vscode-test/**', '.artifacts/**'] },
    { languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } } },
    ...extension.map(config => config.files || config.ignores || config.plugins?.markdown ? config : {
        ...config, files: ['**/*.{js,ts,tsx,mjs,cjs,mts,cts}']
    }),
    ...tseslint.configs.recommended.map(config => ({ ...config, files: sidebarFiles })),
    ...vue.configs['flat/essential'],
    {
        files: sidebarFiles,
        languageOptions: { parserOptions: { parser: tseslint.parser } },
        rules: {
            // Existing internal icon/page names are stable component imports.
            'vue/multi-word-component-names': ['error', { ignores: [
                'Home', 'Project', 'Trash', 'Star', 'Template', 'Edit', 'Play', 'Module',
                'Placeholder', 'Upgrade', 'Filter', 'Downloads', 'NPM', 'Nuxt', 'Chevron',
                'Vue', 'Snippets', 'Flash', 'Add', 'Modules', 'Dependencies', 'Feedback',
                'Actions'
            ] }],
            '@typescript-eslint/no-explicit-any': 'off'
        }
    }
];
