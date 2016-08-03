import autoprefixer from 'autoprefixer'
import config from './config'
import loaders from './webpack.loaders'
import plugins from './webpack.plugins'

export default (path, webpack, userConfig) => {
  return {
    context: path.resolve(config.src),
    entry: __dirname + '/../appindex/index.js',
    resolve: {
      root: [
        path.resolve(config.src),
        path.resolve('./node_modules/'),
      ],
      alias: {},
      extensions: ['', '.js']
    },

    output: {
      publicPath: config.isDevelope ? 'http://localhost:' + config.server.port + '/' : '',
      filename: config.assets.scripts + '/[name].js',
      chunkFilename: config.assets.scripts + '/[name]-[id].js',
    },

    watch: config.isDevelope,

    module: {
      loaders: loaders(path),
    },

    // http://habrahabr.ru/post/245991/
    plugins: plugins(path, webpack, userConfig),

    postcss: () => [
      autoprefixer({
        browsers: ['last 3 versions'],
        cascade: false,
      }),
      // precss,
    ],

    cssLoader: {
      sourceMap: config.isDevelope,
      localIdentName: config.isDevelope ? '[local]' : '[hash:5]',
    },

    jadeLoader: {
      locals: config,
      pretty: config.isDevelope,
    },

    devtool: config.isDebug ? '#inline-source-map' : false,
  }
}
