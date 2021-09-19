module.exports = {
  root: true,
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    mocha: true,
  },
  extends: [
    'standard',
    'plugin:promise/recommended',
    'plugin:security/recommended',
    'plugin:clean-regex/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  plugins: [
    'clean-regex',
  ],
  rules: {
    'comma-dangle': [
      'error',
      'always-multiline',
    ],
    'object-property-newline': [
      'error',
      {
        allowAllPropertiesOnSameLine: false,
      },
    ],
    'arrow-parens': [
      'warn',
      'always',
    ],
    'max-len': [
      'warn',
      {
        code: 98,
        ignoreComments: true,
      },
    ],
    'no-unused-vars': 'warn',
  },
}
