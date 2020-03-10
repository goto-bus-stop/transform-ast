if (!require('has-template-literals')()) {
  require('babel-register').default({
    plugins: [require('babel-plugin-transform-es2015-template-literals')]
  })
}
