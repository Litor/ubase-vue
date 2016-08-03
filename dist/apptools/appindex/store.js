'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var STORE = {
  state: {},
  actions: [],
  mutations: [],
  modules: requireAll(require.context('pages', true, /\.vuex\.js$/)),
  strict: NODE_ENV === 'develope'
};
exports.default = STORE;

/************************************************
                   helpers
===============================================*/

// https://webpack.github.io/docs/context.html#require-context

function requireAll(requireContext) {
  return requireContext.keys().reduce(function (fixtures, file) {
    var name = file.match(/.+\/([A-Za-z0-9]+?)\.vuex\.js/)[1];

    fixtures[name] = requireContext(file);

    return fixtures;
  }, {});
}