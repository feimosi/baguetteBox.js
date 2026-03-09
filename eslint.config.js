const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    {
        ignores: [
            '.publish/**',
            'demo/css/**',
            'demo/js/**',
            'dist/**',
            'node_modules/**',
            'playwright-report/**',
            'test-results/**',
            'tests/ui/smoke.spec.js-snapshots/**'
        ],
        linterOptions: {
            reportUnusedDisableDirectives: 0
        }
    },
    js.configs.recommended,
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'script',
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                define: 'readonly'
            }
        },
        rules: {
            'no-redeclare': 'off',
            'no-prototype-builtins': 'off',
            'no-unused-vars': ['error', { caughtErrors: 'none' }]
        }
    },
    {
        files: ['gulpfile.js', 'playwright.config.js', 'eslint.config.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.browser
            }
        }
    },
    {
        files: ['tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.browser
            }
        },
        rules: {
            'no-undef': 'off'
        }
    },
    {
        files: ['src/**/*.js', 'gulpfile.js', 'playwright.config.js', 'tests/**/*.js'],
        rules: {
            indent: ['error', 4],
            quotes: ['error', 'single'],
            semi: ['error', 'always']
        }
    }
];
