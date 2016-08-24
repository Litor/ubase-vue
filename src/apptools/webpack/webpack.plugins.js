import ExtractTextPlugin from 'extract-text-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import StringReplacePlugin from 'string-replace-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

import config from './config'

export default (path, webpack) => {
  var plugins = [

    // fix for moment
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    new webpack.optimize.AggressiveMergingPlugin({
      moveToParents: true,
    }),

    new webpack.optimize.DedupePlugin(),

    new webpack.NoErrorsPlugin(),

    new ExtractTextPlugin(
      config.assets.styles + '/[name].css', {
        // allChunks: true,
        disable: true //config.isDevelope,
      }
    ),

 /*   new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),*/

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
