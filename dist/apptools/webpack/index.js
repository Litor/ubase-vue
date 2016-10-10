'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _webpack = require('./webpack.loaders');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpack3 = require('./webpack.plugins');

var _webpack4 = _interopRequireDefault(_webpack3);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

exports.default = function (path, webpack, userConfig) {
  // appEntryFiles 工程下所有app的主页面入口文件
  var appEntryFiles = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/*/*.vue');

  // app入口文件模板
  var entryIndexTemplate = _fs2.default.readFileSync(__dirname + '/../appindex/index.js', 'utf8');

  var entrys = {};
  var appsList = [];

  appEntryFiles.forEach(function (entryFilePath) {
    var filename = entryFilePath.replace(/.*\/([^\/]*)\.vue/, '$1');
    var appName = entryFilePath.replace(/.*\/pages\/(.*)\/[^\/]*\.vue/, '$1');
    if (appName !== filename) {
      return;
    }

    // 获取app下所有vuex文件路径列表
    var appVuexFilesPath = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/' + appName + '/**/*.vuex.js').concat(_glob2.default.sync(path.resolve(_config2.default.src) + '/*.vuex.js'));

    // 获取app下的vue组件及components下的组件
    var appVueFilesPath = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/' + appName + '/**/*.vue').concat(_glob2.default.sync(path.resolve(_config2.default.src) + '/components/**/*.vue'));

    // 获取app下的所有国际化文件路径列表
    var appI18nFilesPath = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/' + appName + '/**/*.i18n.js').concat(_glob2.default.sync(path.resolve(_config2.default.src) + '/*.i18n.js'));

    var routeFilePath = entryFilePath.replace(filename + '.vue', 'routes.js');
    var indexHtmlFilePath = entryFilePath.replace(filename + '.vue', 'index.html');
    var configFilePath = entryFilePath.replace(filename + '.vue', 'config.json');

    // 解析vuex文件路径 生成对应的vuex初始化语句
    var vuexTpl = generateVuexTpl(appVuexFilesPath);

    // 生成全局注册vue组件的语句
    var vueCompnentTpl = generateVueCompnentRegisterTpl(appVueFilesPath);

    // 生成初始化国际化的语句
    var appI18nFilesTpl = generateappI18nRegisterTpl(appI18nFilesPath);

    var fileContent = templateReplace(entryIndexTemplate, {
      entry: { content: entryFilePath, relativePath: true, required: true },
      importTpl: { content: vuexTpl.importTpl, relativePath: true, required: true, statement: true },
      setValueTpl: { content: vuexTpl.setValueTpl, relativePath: true, required: true, statement: true },
      vueCompnentimportTpl: { content: vueCompnentTpl.importTpl, relativePath: true, required: true, statement: true },
      vueCompnentsetValueTpl: { content: vueCompnentTpl.setValueTpl, relativePath: true, required: true, statement: true },
      i18nimportTpl: { content: appI18nFilesTpl.importTpl, relativePath: true, required: true, statement: true },
      i18nsetValueTpl: { content: appI18nFilesTpl.setValueTpl, relativePath: true, required: true, statement: true },
      routes: { content: routeFilePath, relativePath: true, required: true },
      indexHtml: { content: indexHtmlFilePath, relativePath: true, required: true },
      config: { content: configFilePath, relativePath: true, required: true },
      rootRoute: { content: '/' + filename, relativePath: false, required: true }
    });

    _fs2.default.writeFileSync(__dirname + '/../tempfile/' + filename + '.js', fileContent, 'utf8');
    entrys[filename + '/' + filename] = __dirname + '/../tempfile/' + filename + '.js';
    appsList.push(filename);
  });

  /**
   * * 生成vuex初始化语句 STORE在appindex/index.js中已定义
   * @param  {[Array]} fileList [vuex文件列表]
   * @return {[Object]}         [importTpl：require语句；setValueTpl: 赋值语句]
   */
  function generateVuexTpl(fileList) {
    var importTpl = [];
    var setValueTpl = [];
    fileList.forEach(function (vuexFile) {
      var filename = vuexFile.replace(/.*\/([^\/]*)\.vuex\.js/, '$1');
      checkFileNameValid(filename + '.vuex.js');
      importTpl.push('var ' + filename + 'Store = require("' + relativePath(vuexFile) + '");');
      setValueTpl.push('STORE.modules.' + filename + ' = ' + filename + 'Store');
    });

    return {
      importTpl: importTpl.join('\n;'),
      setValueTpl: setValueTpl.join('\n;')
    };
  }

  /**
   * * 生成国际化初始化语句 UBASE_INITI18N是ubase-vue中定义的一个全局方法
   * @param  {[Array]} fileList [i18n文件列表]
   * @return {[Object]}         [importTpl：require语句；setValueTpl: 赋值语句]
   */
  function generateappI18nRegisterTpl(fileList) {
    var importTpl = [];
    var setValueTpl = ['var _alli18n = {};'];
    fileList.forEach(function (i18nFile) {
      var filename = i18nFile.replace(/.*\/([^\/]*)\.i18n\.js/, '$1');
      checkFileNameValid(filename + '.i18n.js');
      importTpl.push('var ' + filename + 'I18n = require("' + relativePath(i18nFile) + '");');
      setValueTpl.push('_alli18n["' + filename + '"]=' + filename + 'I18n');
    });

    setValueTpl.push('window.UBASE_INITI18N(_alli18n)');

    return {
      importTpl: importTpl.join('\n;'),
      setValueTpl: setValueTpl.join('\n;')
    };
  }

  function checkFileNameValid(filename) {
    if (filename.indexOf('-') > 0) {
      console.error(_colors2.default.red('文件名请使用驼峰式命名, 如myNameIsWisedu！命名错误文件：' + filename));
      process.exit();
    }
  }

  /**
   * *全局注册vue组件，避免在业务开发的时候手动一个个import
   */
  function generateVueCompnentRegisterTpl(fileList) {
    var importTpl = [];
    var setValueTpl = [];
    fileList.forEach(function (vuexFile) {
      var filename = vuexFile.replace(/.*\/([^\/]*)\.vue/, '$1');
      checkFileNameValid(filename + '.vue');
      importTpl.push('var ' + filename + 'Component = require("' + relativePath(vuexFile) + '");');
      setValueTpl.push('Vue.component("' + filename + '", ' + filename + 'Component)');
    });

    return {
      importTpl: importTpl.join('\n;'),
      setValueTpl: setValueTpl.join('\n;')
    };
  }

  function relativePath(filePath) {
    return path.relative(__dirname + '/../tempfile', filePath);
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

  var webpackConfig = {
    context: path.resolve(_config2.default.src),
    entry: entrys,
    resolve: {
      root: [path.resolve(_config2.default.src), path.resolve('./node_modules/')],
      alias: Object.assign({}, userConfig.alias),
      extensions: ['', '.js', '.vue']
    },

    output: {
      publicPath: _config2.default.isDevelope ? '/' : '/',
      filename: '[name].js',
      chunkFilename: '[name]-[id].js'
    },

    watch: _config2.default.isDevelope,

    module: {
      loaders: (0, _webpack2.default)(path)
    },

    // http://habrahabr.ru/post/245991/
    plugins: (0, _webpack4.default)(path, webpack),

    postcss: function postcss() {
      return [(0, _autoprefixer2.default)({
        browsers: ['last 3 versions'],
        cascade: false
      })];
    },

    cssLoader: {
      sourceMap: _config2.default.isDevelope,
      localIdentName: _config2.default.isDevelope ? '[local]' : '[hash:5]'
    },

    jadeLoader: {
      locals: _config2.default,
      pretty: _config2.default.isDevelope
    },

    devtool: _config2.default.isDebug ? '#inline-source-map' : false
  };

  return webpackConfig;
};