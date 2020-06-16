var state = require("./state");
var Node = require("./node");
var Identifier = require("./identifier");
var $EXP = require("./$expression");
var Instruction = require("./instruction");
var LET = require("./let");

module.exports = class OBJECT extends Node {
  constructor() {
    super();
    this.properties = {};
  }

  before() {
    if (this.name === undefined && this.object === undefined) {
      this.key = this.class.name.toLowerCase() + this.sequence;
      this.name = this.key;
    } else {
      this.key = Identifier.serialize(this);
    }
  }

  run(scope) {
    let name = this.key;

    state.assign(scope, name, `new state.${this.class.name}()`);
    scope.instances[this.class.name] = this;
    scope.object = this;

    let list = [];

    for (let i = 0; i < this.class.args.length; i++) {
      let local = new LET();
      local.name = this.class.args[i];

      if (this.args[i] !== undefined) {
        let context = $EXP(this.args[i], 0);
        local.value = context.statement.run();
        list.push(local);
      } else {
        let context = $EXP("undefined", 0);
        local.value = context.statement.run();
        list.push(local);
      }
    }

    if (this.class.construct !== undefined) {
      let construct = this.class.construct;
      let instruction = new Instruction(scope, construct, false, true, false);
      list.push(instruction);
    }

    for (let node in this.class.declarations) {
      let declaration = this.class.declarations[node];
      list.push(new Instruction(scope.root, declaration, true, true, true));
    }

    if (this.object === undefined) {
      let context = $EXP(this.class.name + "s.push ( " + this.name + " )", 0);
      list.push(context.statement);

      state.run(scope, `state.${name}.id="${name}"`);

      context = $EXP(this.name, 0);
      list.push(context.statement);
    }

    return list;
  }

  graph() {
    if (this.object !== undefined) this.object.properties[this.name] = this;
    this.class.instances[this.key] = this;
  }
};
