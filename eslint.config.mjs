import unjs from 'eslint-config-unjs';

export default unjs({
    rules: {
        '@typescript-eslint/naming-convention': 'off',
        "@typescript-eslint/no-duplicate-enum-values": 'off',
        '@typescript-eslint/semi': 'off',
        'curly': ['error', 'all'],
        'eqeqeq': 'warn',
        'no-throw-literal': 'warn',
        'semi': 'off',
        '@typescript-eslint/indent': ['error', 4],
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
    },
    ignores: [
        'out',
        'node_modules',
        '*.js',
        'src/sideBar/build'
    ]
});
