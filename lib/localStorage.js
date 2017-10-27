'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage(__dirname + '/../scratch');

function getItem(key) {
  return localStorage.getItem(key);
}

function setItem(key, value) {
  localStorage.setItem(key, value);
}

exports.setItem = setItem;
exports.getItem = getItem;