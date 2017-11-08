'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getArg;
function getArg(key) {
  var index = process.argv.indexOf(key);
  var next = process.argv[index + 1];
  return index < 0 ? null : !next || next[0] === "-" ? true : next;
}

var debug = exports.debug = getArg('--debug') || getArg('-dp') || getArg('-pd');
var production = exports.production = getArg('--prod') || getArg('--production') || getArg('-p');
var dist = exports.dist = getArg('--dist') || getArg('-dist');