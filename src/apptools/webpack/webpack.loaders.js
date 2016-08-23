import ExtractTextPlugin from 'extract-text-webpack-plugin'
import StringReplacePlugin from 'string-replace-webpack-plugin'
import config from './config'

export default (path, appInfo) => {
  var loaders = {}

  loaders.js = {
    test: /\.js$/i,
    include: path.resolve(config.src),
    exclude: [/\/node_modules\//, /\/bower_components\//],
    loader: 'babel',
  }

  loaders.js1 = {
    test: /\.js$/i,
    include: __dirname + '../tempfile',
    exclude: [/\/node_modules\//, /\/bower_components\//],
    loader: 'babel',
  }

  loaders.template = {
    test: /index\.html$/i,
    exclude: [/\/pages\//],
    //loader: 'file?name=[name].html'
    loaders: ['file?name=[name].html', StringReplacePlugin.replace({
      replacements: [{
        pattern: /<!-- @appList (\w*?) -->/ig,
        replacement: function(match, p1, offset, string) {
          return appInfo.appsList
        }
      }, {
        pattern: /<!-- @appName (\w*?) -->/ig,
        replacement: function(match, p1, offset, string) {
          return appInfo.appName
        }
      }]
    })]

  }

  loaders.configjson = {
    test: /config\.json$/i,
    exclude: [/\/pages\//],
    loader: 'file?name=[name].json'
  }

  loaders.config = {
    test: /config\.json$/i,
    exclude: [/\/pages\//, /\/components\//],
    loader: 'file?name=[name].json'
  }

  loaders.html = {
    test: /\.html$/i,
    exclude: [/index\.html/],
    loader: 'html',
  }

  loaders.vue = {
    test: /\.vue$/i,
    include: path.resolve(config.src),
    loader: 'vue',
    //loaders: ['file?name=[name].js','vue']

  }

  loaders.promise = {
    test: /\.js$/i,
    include: [/pages/],
    exclude: loaders.js.exclude,
    loaders: [
      'promise?global,[name].promise',
      'babel',
    ]
  }

  loaders.sassUsable = {
    test: /\.useable\.(scss|sass)$/i,
    loaders: [
      'style/useable',
      'css',
      'postcss',
      'sass',
    ],
  }

  loaders.sass = {
    test: /\.(scss|sass)$/i,
    exclude: loaders.sassUsable.test,
    loader: ExtractTextPlugin.extract('style',
      loaders.sassUsable.loaders.slice(1).join('!')
    ),
  }

  loaders.lessUsable = {
    test: /\.useable\.less$/i,
    loaders: [
      'style/useable',
      'css',
      'postcss',
      'less',
    ],
  }

  loaders.less = {
    test: /\.less$/i,
    exclude: loaders.lessUsable.test,
    loader: ExtractTextPlugin.extract('style',
      loaders.lessUsable.loaders.slice(1).join('!')
    ),
  }

  loaders.fonts = {
    test: /.*\.(ttf|eot|woff|woff2|svg)(\?.*)?$/i,
    include: /fonts/,
    loader: 'url',
    query: {
      limit: 0.01 * 1024,
      name: config.assets.fonts + '/[name]-[hash:5].[ext]',
    },
  }

  loaders.url = {
    test: /.*\.(gif|png|jpe?g|svg)$/i,
    exclude: [loaders.fonts.include, /images/],
    loader: 'url',
    query: {
      limit: 0.01 * 1024,
      name: appInfo.appName + '/statics/[name].[ext]',
    },
  }

  loaders.svg = {
    test: /\.svg$/,
    include: /images/,
    loader: 'svg-sprite?' + JSON.stringify({
      name: '[name]',
      // prefixize: true,
      // spriteModule: 'utils/my-custom-sprite'
    })
  }

  return [
    loaders.configjson,
    loaders.vue,
    loaders.js,
    loaders.js1,
    loaders.template,
    loaders.config,
    loaders.html,
    loaders.sass,
    loaders.sassUsable,
    loaders.less,
    loaders.lessUsable,
    loaders.url,
    loaders.fonts,
    loaders.svg,
  ]
}
