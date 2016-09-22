import ExtractTextPlugin from 'extract-text-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import StringReplacePlugin from 'string-replace-webpack-plugin'
import config from './config'

export default (path, webpack, appInfo) => {
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

    new CopyWebpackPlugin([{
      from: path.resolve('./src/statics/**/*.json'),
      to: path.resolve('./www/')
    }, {
      context: path.resolve('./src/pages'),
      from: '*/index.html',
      to: path.resolve('./')
    }, {
      context: path.resolve('./src/pages'),
      from: '*/config.json',
      to: path.resolve('./')
    }]),

    new StringReplacePlugin(),

    new webpack.DefinePlugin({
      DEBUG: config.isDebug,
      NODE_ENV: `'${config.NODE_ENV}'`
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

  return plugins

}
