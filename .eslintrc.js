module.exports = {
    env: {
        'browser': true
    },
    overrides: [
        {
            files: [
                'playwright.config.js',
                'tests/**/*.js'
            ],
            env: {
                'browser': true,
                'es2021': true,
                'node': true
            },
            parserOptions: {
                ecmaVersion: 2020
            }
        }
    ],
    extends: 'eslint:recommended',
    rules: {
        'indent': [
            'error',
            4
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ]
    }
};
