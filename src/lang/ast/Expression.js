const Identifier = require("./Identifier");
const Literal = require("./Literal");
const Call = require("./Call");
const Array = require("./Array");
const Object = require("./Object");
const AST = require("./AST");
const Function = require("./Function");

class Expression extends AST {
  map(fn) {
    return mapReduce(this.node, fn);
  }

  resolve(scope) {
    return convertToAST(this.node).resolve(scope);
  }

  traverse(fn) {
    return traverseReduce(this.node, fn);
  }
}

function convertToAST(node) {
  switch (node.type) {
    case "Literal": {
      return new Literal(node);
    }
    case "Identifier":
    case "MemberExpression": {
      return new Identifier(node);
    }
    case "CallExpression": {
      return new Call(node);
    }
    case "ArrayExpression": {
      return new Array(node);
    }
    case "ObjectExpression": {
      return new Object(node);
    }
    case "ArrowFunctionExpression": {
      return new Function(node);
    }
    default: {
      throw new Error(`ParserError: Unknown node type '${node.type}'`);
    }
  }
}

function traverseReduce(exp, fn, acc = []) {
  if (["LogicalExpression", "BinaryExpression"].includes(exp.type)) {
    traverseReduce(exp.left, fn, acc);
    acc.push(exp.operator);
    traverseReduce(exp.right, fn, acc);
  } else if (exp.type === "UnaryExpression") {
    acc.push(exp.operator);
    traverseReduce(exp.argument, fn, acc);
  } else {
    const ast = convertToAST(exp);
    const cur = fn(ast);

    if (cur) {
      acc.push(cur);
    }
  }

  return acc;
}

function mapReduce(exp, fn, acc = []) {
  if (exp.type === "BinaryExpression") {
    mapReduce(exp.left, fn, acc);
    mapReduce(exp.right, fn, acc);
  } else {
    const ast = convertToAST(exp);
    const cur = fn(ast);

    // Filter out undefined values
    if (cur !== undefined) {
      acc.push(cur);
    }
  }

  return acc;
}

module.exports = Expression;