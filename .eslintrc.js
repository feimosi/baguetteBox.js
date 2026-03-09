module.exports = {
    env: {
        'browser': true,
        'es6': true,
        'node': true
    },
    overrides: [
        {
            files: [
                'playwright.config.js',
                'tests/**/*.js'
            ],
            env: {
                'browser': true,
                'es6': true,
                'node': true
            },
            parserOptions: {
                ecmaVersion: 2018
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
