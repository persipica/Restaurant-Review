import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier'; // 추가
import react from 'eslint-plugin-react'; // 추가
import { version } from 'react'; // 추가

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    // plugins 추가
    plugins: {
      react,
    },
    extends: [
      js.configs.recommended,
      react.configs.recommended, // 추가
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier, // 추가 : 위치 반드시 마지막에
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
      'no-unused-vars': 'warn', // warn으로 수정
      // 아래 3줄 추가
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    // 추가
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
