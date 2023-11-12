const Identifier = require("./Identifier");
const Literal = require("./Literal");
const Call = require("./Call");
const Array = require("./Array");
const Object = require("./Object");
const Node = require("./Node");
const Function = require("./Function");
const Operator = require("./Operator");
const New = require("./New");

class Expression extends Node {
  map(fn) {
    return mapReduce(this.node, fn);
  }

  find(fn) {
    // TODO Optimize this with own reduce
    const [first] = mapReduce(this.node, fn);
    return first;
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
    case "BinaryExpression":
    case "LogicalExpression":
    case "UnaryExpression":
    case "UpdateExpression":
    case "RegExpLiteral":
    case "ConditionalExpression": {
      return new Operator(node);
    }
    case "Identifier":
    case "MemberExpression": {
      return new Identifier(node);
    }
    case "CallExpression": {
      return new Call(node);
    }
    case "ArrayExpression": {
      const elements = node.elements.map((el) => convertToAST(el));
      return new Array(elements);
    }
    case "ObjectExpression": {
      return new Object(node);
    }
    case "ArrowFunctionExpression": {
      return new Function(node);
    }
    case "NewExpression": {
      return new New(node);
    }
    default: {
      throw new Error(`ParserError: Unknown expression type '${node.type}'`);
    }
  }
}

function traverseReduce(exp, fn, acc = []) {
  if (["BinaryExpression", "LogicalExpression"].includes(exp.type)) {
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
  if (["BinaryExpression", "LogicalExpression"].includes(exp.type)) {
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
