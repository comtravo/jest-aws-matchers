module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  env: {
    node: true,
    es6: true,
    'jest/globals': true
  },
  plugins: ['@typescript-eslint', 'prettier', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended'
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'newline-before-return': ['error'],
    '@typescript-eslint/no-unused-vars': 'error',
    'jest/no-commented-out-tests': 'error',
    'jest/no-standalone-expect': 'warn',
    'sort-imports': ['error', {
      'ignoreCase': true,
      'ignoreDeclarationSort': false,
      'ignoreMemberSort': false,
      'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single']
  }]
  }
};
