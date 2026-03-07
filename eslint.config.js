import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // React 17+ with the new JSX transform doesn't require React in scope.
      'react/react-in-jsx-scope': 'off',

      // This project doesn't use PropTypes.
      'react/prop-types': 'off',

      // Keep legacy integration noisy but not blocking.
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Helpful during dev with Vite HMR.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
]
