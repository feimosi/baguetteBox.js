const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');

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
        files: ['src/**/*.ts'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'script',
            parser: tseslint.parser,
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                define: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin
        },
        rules: {
            'no-redeclare': 'off',
            'no-undef': 'off',
            'no-prototype-builtins': 'off',
            'no-unused-vars': 'off',
            'no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }]
        }
    },
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
        files: ['src/**/*.ts', 'src/**/*.js', 'gulpfile.js', 'playwright.config.js', 'tests/**/*.js'],
        rules: {
            indent: ['error', 4],
            quotes: ['error', 'single'],
            semi: ['error', 'always']
        }
    }
];
