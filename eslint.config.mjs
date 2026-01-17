import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '**/*.css',
      'src/components/ui/**',
    ],
  },
  {
    rules: {
      'no-console': 'warn',
      'semi': ['warn', 'never'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-multi-spaces': 'warn',
      'space-before-blocks': ['warn', 'always'],
      'indent': ['warn', 2],
      'quotes': ['warn', 'single'],
    },
  },
]

export default eslintConfig