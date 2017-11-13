import ExtractTextPlugin from 'extract-text-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import StringReplacePlugin from 'string-replace-webpack-plugin'
import webpack from 'webpack'
import path from 'path'
import config from '../config'
import entryHashWebpackPlugin from 'entry-hash-webpack-plugin'

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
      disable: true //config.isDeveloper,
    }
  ),

  new CopyWebpackPlugin([{
    from: path.resolve('./src/statics/**/*.json'),
    to: path.resolve('./www/')
  }
  ]),

  new StringReplacePlugin(),

  new webpack.DefinePlugin({
    DEBUG: config.isDebug,
    'process.env':Object.assign({}, {'NODE_ENV':`'${config.NODE_ENV}'`}, config.env)
  })
]
plugins.push(new entryHashWebpackPlugin({isProduction:config.isProduction, entryName:'__main_entry__'}))
config.isProduction && plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    mangle: {},
  })
)

export default plugins
