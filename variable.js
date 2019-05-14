var state = require("./state");
var graph = require("./graph");
var Node = require("./node");

module.exports = class VARIABLE {
  run() {
    if (this.function) {
      this.function(state);
      return;
    }

    let variable = this.variable;
    let expression = this.expression;

    graph.node[variable] = new Node(this);

    expression.tokens.forEach(token => {
      if (graph.node[token])
        graph.node[token].edge[variable] = graph.node[variable];
    });

    let list = expression.tokens.map(token =>
      graph.node[token.split(".")[0]] ? "state." + token : token
    );

    this.function = new Function(
      "state",
      "state." + variable + "=" + list.join("")
    );
    this.function(state);
  }
};
