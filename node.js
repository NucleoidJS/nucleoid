var graph = require("./graph");
var uuidv4 = require("uuid/v4");
var transaction = require("./transaction");

var sequence = 0;

module.exports = class Node {
  constructor() {
    this.next = {};
    this.previous = {};
    this.id = uuidv4();
    this.sequence = sequence++;
  }

  before() {}
  run() {}
  beforeGraph() {}
  graph() {}

  static register(key, node) {
    transaction.register(graph, key, node);
  }

  static replace(sourceKey, targetNode) {
    transaction.register(targetNode.block, graph[sourceKey].block);

    for (let node in graph[sourceKey].next) {
      transaction.register(targetNode.next, node, graph[sourceKey].next[node]);
      transaction.register(graph[sourceKey].next, node, undefined);
    }

    for (let node in graph[sourceKey].previous) {
      transaction.register(graph[node].next, sourceKey, undefined);
    }

    transaction.register(graph, sourceKey, targetNode);
  }

  static direct(sourceKey, targetKey, targetNode) {
    transaction.register(graph[sourceKey].next, targetKey, targetNode);
    transaction.register(targetNode.previous, sourceKey, graph[targetKey]);
  }
};
