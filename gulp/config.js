import { debug, production } from './helpers/getArg'

var src = './src'
var dest = './dist'

export default {
  src: src,
  dest: dest,
  app: '/app',
  components: src + '/components',
  pages: src + '/pages',

  assets: {
    images: 'statics/images',
    scripts: 'statics/scripts',
    styles: 'statics/styles',
    fonts: 'statics/fonts',
  },

  isProduction: production,
  isDevelope: !production,
  isDebug: debug,
  NODE_ENV: production ? 'production' : 'develope',

  server: {
    port: 8082,
  },
}
