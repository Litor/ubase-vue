import ExtractTextPlugin from 'extract-text-webpack-plugin'
import config from '../config'
import path from 'path'
import {getEntryFilePath, getAppRootPath} from 'vue-entry/dist/bootstrap/utils'
var vueEntryConfig = config.vueEntryConfig

var loaders = {}

loaders.js = {
  test: /\.js$/i,
  loader: 'babel',
}

loaders.js1 = {
  test: /\.js$/i,
  include: getEntryFilePath(vueEntryConfig),
  exclude: [/\/node_modules\//, /\/bower_components\//],
  loader: 'babel',
}

loaders.configjson = {
  test: /config\.json$/i,
  exclude: [/\/components\//],
  loader: 'file',
  query: {
    context: getAppRootPath(vueEntryConfig),
    name: '[path][name].[ext]'
  }
}

loaders.indexhtml = {
  test: /index\.html$/i,
  exclude: [/\/components\//],
  loader: 'file',
  query: {
    context: getAppRootPath(vueEntryConfig),
    name: '[path][name].[ext]'
  }
};

loaders.i18n = {
  test: /\.lang\.json$/i,
  exclude: [/\/components\//],
  loader: 'file',
  query: {
    context: getEntryFilePath(vueEntryConfig),
    name: '[path][name].[ext]'
  }
};

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
  loader: 'vue',
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

loaders.css = {
  test: /\.(css)$/i,
  exclude: loaders.sassUsable.test,
  loader: ExtractTextPlugin.extract('style',
    'css-loader'
  ),
}

loaders.lessUsable = {
  test: /\.useable\.less$/i,
  loaders: [
    'style/useable',
    'css',
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
  loader: 'url',
  query: {
    limit: 0.01 * 1024,
    name: config.assets.fonts + '/[name]-[hash:5].[ext]',
  },
}

loaders.url = {
  test: /.*\.(gif|png|jpe?g|svg|ico)$/i,
  loader: 'url',
  query: {
    limit: 0.01 * 1024,
    name: '[path][name].[ext]',
  },
}

loaders.svg = {
  test: /\.svg$/,
  include: /images/,
  loader: 'svg-sprite?' + JSON.stringify({
    name: '[name]'
  })
}

var usedLoaders = [
  loaders.configjson,
  loaders.indexhtml,
  loaders.i18n,
  loaders.vue,
  loaders.js,
  loaders.js1,
  loaders.html,
  loaders.sass,
  loaders.sassUsable,
  loaders.less,
  loaders.lessUsable,
  loaders.url,
  loaders.fonts,
  loaders.svg,
  loaders.css
]

export default usedLoaders
