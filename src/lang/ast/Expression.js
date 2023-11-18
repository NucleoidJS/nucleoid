const Node = require("./Node");

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
    return Node.convertToAST(this.node).resolve(scope);
  }

  traverse(fn) {
    return traverseReduce(this.node, fn);
  }

  graph(fn) {
    return graphReduce(this.node, fn);
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
    const ast = Node.convertToAST(exp);
    const curr = fn(ast);

    if (curr) {
      acc.push(curr);
    }
  }

  return acc;
}

function mapReduce(exp, fn, acc = []) {
  if (["BinaryExpression", "LogicalExpression"].includes(exp.type)) {
    mapReduce(exp.left, fn, acc);
    mapReduce(exp.right, fn, acc);
  } else if (exp.type === "UnaryExpression") {
    mapReduce(exp.argument, fn, acc);
  } else {
    const ast = Node.convertToAST(exp);
    const curr = fn(ast);

    // Filter out undefined values
    if (curr !== undefined) {
      acc.push(curr);
    }
  }

  return acc;
}

function graphReduce(exp, fn, acc = []) {
  if (["BinaryExpression", "LogicalExpression"].includes(exp.type)) {
    graphReduce(exp.left, fn, acc);
    graphReduce(exp.right, fn, acc);
  } else if (exp.type === "UnaryExpression") {
    graphReduce(exp.argument, fn, acc);
  } else {
    const ast = Node.convertToAST(exp);

    const graphed = [ast.graph()];
    graphed.flat(Infinity).forEach((item) => {
      if (item) {
        const curr = fn(item);

        if (curr !== undefined) {
          acc.push(curr);
        }
      }
    });
  }

  return acc;
}

module.exports = Expression;
