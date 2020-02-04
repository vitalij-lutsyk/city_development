module.exports = {
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: ['plugin:vue/base'],
  plugins: ['import', 'node', 'promise', 'standard'],
  rules: {
    'space-before-function-paren': ['error', 'never']
  }
}
