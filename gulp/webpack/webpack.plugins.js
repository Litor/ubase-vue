import webpack from 'webpack'
import config from '../config'

var plugins = [

  // fix for moment
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

  new webpack.optimize.AggressiveMergingPlugin({
    moveToParents: true,
  }),

  new webpack.optimize.DedupePlugin(),

  new webpack.NoErrorsPlugin(),

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

    },
  })
)

export default plugins
