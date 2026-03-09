import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jestPlugin from 'eslint-plugin-jest'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  // ✅ Regular React/JS files
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['tests/**'], 
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  // ✅ Apply Jest globals to all test files inside the tests folder (any depth)
  {
    files: ['tests/**/*.{js,jsx}'],
    plugins: { jest: jestPlugin },
    extends: ['plugin:jest/recommended'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
])