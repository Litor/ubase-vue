'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkProjectType = exports.setPath = exports.templateReplace = exports.relativePath = exports.translateEs6to5 = exports.checkFileNameValid = exports.checkFileDuplicate = undefined;

var _babelCore = require('babel-core');

var babel = _interopRequireWildcard(_babelCore);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

_colors2.default.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'red',
  info: 'green',
  data: 'blue',
  help: 'cyan',
  warn: 'yellow',
  debug: 'magenta',
  error: 'red'
});

var gPath = null;

function setPath(path) {
  gPath = path;
}

/***
 * 检测fileList中后缀为fileType的file文件是否重复 如果重复则给出提示并退出node
 * @param fileList 文件路径列表
 * @param file 文件名
 * @param fileType 文件后缀
 */
function checkFileDuplicate(fileList, file, fileType) {
  var files = _lodash2.default.filter(fileList, function (item) {
    return _lodash2.default.endsWith(item, '/' + file + '.' + fileType);
  });

  if (files.length > 1) {
    console.error(_colors2.default.red(file + '.' + fileType + '\u6587\u4EF6\u547D\u540D\u91CD\u590D, \u540C\u4E00\u4E2A\u5E94\u7528\u4E0B' + fileType + '\u7C7B\u578B\u7684\u6587\u4EF6\u547D\u540D\u4E0D\u80FD\u91CD\u590D\uFF0C\u547D\u540D\u91CD\u590D\u6587\u4EF6\uFF1A\n' + files.join('\n')));
    process.exit();
  }
}

/***
 * 检测vue和vuex文件命名是否规范
 * @param filename 文件名
 * @param fileType 文件后缀
 */
function checkFileNameValid(filename, fileType) {
  if (filename.indexOf('-') > 0 || filename.indexOf('.') > 0) {
    console.error(_colors2.default.red('\u6587\u4EF6\u540D\u8BF7\u4F7F\u7528\u9A7C\u5CF0\u5F0F\u547D\u540D, \u5982myNameIsWisedu\uFF01\u547D\u540D\u9519\u8BEF\u6587\u4EF6\uFF1A' + filename + '.' + fileType));
    process.exit();
  }
}

/***
 * 讲es6写的代码转换成es5
 * @param file
 */
function translateEs6to5(file) {
  var content = _fs2.default.readFileSync(file);
  var result = babel.transform(content, {
    presets: ['es2015']
  });
  var exports = {};
  eval(result.code);

  return exports;
}

/***
 * 获取绝对文件路径相对于tempfile的相对路径
 * @param filePath 绝对文件路径
 */
function relativePath(filePath) {
  return gPath.relative(__dirname + '/../tempfile', filePath);
}

/**
 * 模板替换方法
 * @param  {[type]} template [模板]
 * @param  {[type]} config   [配置对象]
 * @return {[type]}          [description]
 */
function templateReplace(template, config) {
  Object.keys(config).forEach(function (item) {
    var re = new RegExp('\\{\\{' + item + '\\}\\}', 'g');
    var statementre = new RegExp('\\\'\\{\\{' + item + '\\}\\}\\\'', 'g');

    if (config[item].statement) {
      template = template.replace(statementre, config[item].content);
      return;
    }
    if (!config[item].relativePath) {
      template = template.replace(re, config[item].content);
      return;
    }

    if (_fs2.default.existsSync(config[item].content)) {
      template = template.replace(re, relativePath(config[item].content)).replace(/\\/g, '/');
    } else {
      if (config[item].required) {
        console.error(_colors2.default.red(config[item].content + '文件不存在!'));
        process.exit();
      } else {
        template = template.replace(re, config[item].default);
      }
    }
  });

  return template;
}

/***
 * 检查项目类型 单app或多app模式
 */
function checkProjectType() {
  var projectType = null;
  var indexHtml = gPath.resolve(_config2.default.src) + '/pages/index.html';
  var routeJs = gPath.resolve(_config2.default.src) + '/pages/routes.js';
  if (_fs2.default.existsSync(indexHtml) && _fs2.default.existsSync(routeJs)) {
    projectType = 'singleApp';
  }

  return projectType;
}

exports.checkFileDuplicate = checkFileDuplicate;
exports.checkFileNameValid = checkFileNameValid;
exports.translateEs6to5 = translateEs6to5;
exports.relativePath = relativePath;
exports.templateReplace = templateReplace;
exports.setPath = setPath;
exports.checkProjectType = checkProjectType;