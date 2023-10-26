const acorn = require("acorn");
const $VARIABLE = require("../$nuc/$VARIABLE");
const $EXPRESSION = require("../$nuc/$EXPRESSION");
const $ASSIGNMENT = require("../$nuc/$ASSIGNMENT");
const $CLASS = require("../$nuc/$CLASS");
const $OBJECT = require("../$nuc/$OBJECT");
const Expression = require("../ast/Expression");
const Identifier = require("../ast/Identifier");

function parse(string) {
  return acorn.parse(string, { ecmaVersion: 2020 }).body.map(parseNode);
}

function parseNode(node) {
  switch (node.type) {
    case "ExpressionStatement": {
      const { expression } = node;

      if (expression.type === "AssignmentExpression") {
        const { left, right } = expression;
        const name = new Identifier(left);
        return $ASSIGNMENT(name, $EXPRESSION(new Expression(right)));
      } else {
        return $EXPRESSION(new Expression(expression));
      }
    }
    case "VariableDeclaration": {
      const {
        declarations: [declaration],
      } = node;
      const { id, init } = declaration;

      if (init.type === "NewExpression") {
        const cls = new Identifier(init.callee);
        const name = new Identifier(id);
        return $OBJECT(cls, null, name, init.arguments);
      } else {
        return $VARIABLE(new Identifier(id), $EXPRESSION(new Expression(init)));
      }
    }
    case "ClassDeclaration": {
      const {
        id,
        body: { body },
      } = node;

      const name = new Identifier(id);
      return $CLASS(name, body);
    }
  }
}

module.exports.parse = parse;
