'use strict';

var ConcatSource = require("webpack-sources").ConcatSource;
var fs = require('fs');
function webpackUbaseHashPlugin(options) {
  this.isProduction = options.isProduction;
}

webpackUbaseHashPlugin.prototype.apply = function (compiler) {
  var self = this;
  compiler.plugin("emit", function (compilation, callback) {
    var assets = Object.keys(compilation.assets);
    Object.keys(compilation.assets).forEach(function (item) {
      if (item.indexOf('index.html') == -1) {
        return;
      }

      var appName = item.replace(/^([^\/]*)\/.*/, '$1');
      var originHtml = compilation.assets[item]._value + '';
      var hash = getHash(item, assets);
      var mainName = self.isProduction ? '__main_entry__-' + hash + '.js' : '__main_entry__.js';
      var newHtml = originHtml.replace(/\<\/body\>/, '\<\/body\>\n<script src="./' + mainName + '"></script>');

      compilation.assets[item] = new ConcatSource(newHtml);
    });

    callback();
  });
};

function getHash(indexhtmlFilePath, asset) {
  var str = indexhtmlFilePath.replace(/\/index\.html/, '') + '\\\/([^\/]*)\.js$';
  var re = new RegExp(str, "gi");
  var hash = null;

  asset.forEach(function (item) {
    if (re.test(item)) {
      hash = item.replace(/.*\-([^\/]*)\.js$/, '$1');
      return false;
    }
  });
  return hash;
}

module.exports = webpackUbaseHashPlugin;