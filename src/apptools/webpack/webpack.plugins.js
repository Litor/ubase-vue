import ExtractTextPlugin from 'extract-text-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import StringReplacePlugin from 'string-replace-webpack-plugin'

import config from './config'

export default (path, webpack) => {
  var plugins = [

    // fix for moment
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    new webpack.optimize.AggressiveMergingPlugin({
      moveToParents: true,
    }),

    // удаляем повторые модули
    new webpack.optimize.DedupePlugin(),

    // не билдим сборки, когда ошибка
    new webpack.NoErrorsPlugin(),

    // собирает все общие скрипты чанка в commons.js
    /*new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      // chunks: ['commons'],
      // minChunks: Infinity,
      children: true,
      // minSize: 1*1024,
    }),*/

    new ExtractTextPlugin(
      config.assets.styles + '/[name].css', {
        // allChunks: true,
        disable: true //config.isDevelope,
      }
    ),

    new StringReplacePlugin(),

    new webpack.DefinePlugin({
      DEBUG: config.isDebug,
      NODE_ENV: `'${config.NODE_ENV}'`
        // config: JSON.stringify(config),
    }),
  ]

  config.isProduction && plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      mangle: {
        // except: [
        //   'Vue', 'vue', 'vue-router', 'vue-i18n',
        //   'Framework7', 'Dom7', 'exports', 'require',
        // ],
      },
    })
  )

  config.loadappcore && plugins.push(
    new CopyWebpackPlugin([

      { from: __dirname + '/../../../dist/ubase-vue.js', to: path.resolve('./') }
    ])
  )

  return plugins

}
