/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  extends: [
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier'
  ],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-useless-escape': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  }
}
