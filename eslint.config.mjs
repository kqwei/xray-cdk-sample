import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginJs from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import gitignore from 'eslint-config-flat-gitignore'

export default [
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs['recommended-flat'],
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/indent': ['error', 2],
      'object-curly-newline': ['error', {
        ObjectExpression: 'always',
        ObjectPattern: {
          multiline: true,
        },
        ImportDeclaration: 'never',
        ExportDeclaration: {
          multiline: true,
          minProperties: 3,
        },
      }],
      'object-property-newline': 'error',
      'newline-per-chained-call': 'error',
    },
  },
  stylistic.configs.customize({
    indent: 2, // インデントはスペース2
    quotes: 'single', // クオートはシングル
    semi: false, // セミコロンは不要
  }),
  gitignore(),
]
