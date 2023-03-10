module.exports = {
    extends: ['eslint:recommended', 'plugin:import/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier', 'import', 'unicorn'],
    root: true,
    rules: {
        'prettier/prettier': 'warn',
        'prefer-arrow-callback': 'error',
        'sort-imports': [
            'error',
            {
                ignoreDeclarationSort: true,
            },
        ],
        'import/no-unresolved': 'error',
        'import/no-extraneous-dependencies': 'error',
        'import/first': 'error',
        'import/no-duplicates': 'error',
        'import/no-default-export': 'error',
        'import/no-namespace': 'error',
        'import/no-useless-path-segments': 'error',
        'import/no-named-as-default': 0,
        'no-duplicate-imports': 'error',
        'unicorn/no-typeof-undefined': 'error',
    },
    overrides: [
        {
            files: ['**/*.ts'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
                'plugin:import/typescript',
            ],
            parserOptions: {
                project: ['./tsconfig.json'],
            },
            rules: {
                '@typescript-eslint/explicit-module-boundary-types': 'error',
                '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
            },
            settings: {
                'import/resolver': {
                    typescript: {
                        project: './',
                    },
                },
            },
        },
        {
            files: ['**/*.js'],
            env: {
                node: true,
                browser: false,
            },
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
    ],
}
