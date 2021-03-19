// var babel = require('@babel/core');
var t = require('@babel/types');

const visitor = {
  VariableDeclarator(path, state){
    if (state.opts.opt1 && path.node.id.name == 'a') {
      console.log('hah');
      path.node.id = t.identifier('b')
    }
  },
  BinaryExpression(path, state){
    if (path.node.operator == '==') {
      var leftIdentifier = path.node.left.name;
      var rightIdentifier = path.node.right.name;
      var now_node = t.BinaryExpression('===', t.identifier(leftIdentifier), t.identifier(rightIdentifier));
      path.replaceWith(now_node)
    }
  }
}
 
module.exports = function (babel) {
  return {
    visitor,
  }
}