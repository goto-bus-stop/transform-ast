if (!require('has-template-literals')()) {
  require('@babel/register').default({
    plugins: [require('@babel/plugin-transform-template-literals')]
  })
}
