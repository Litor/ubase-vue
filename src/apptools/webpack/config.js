import { debug, production, loadappcore } from './helpers/getArg'

var src = './src'
var dest = './www'

export default {
  src: src,
  dest: dest,
  components: src + '/components',
  pages: src + '/pages',
  modules: src + '/modules/',

  assets: {
    images: 'assets/images',
    scripts: 'assets/scripts',
    styles: 'assets/styles',
    fonts: 'assets/fonts',
  },

  isProduction: production,
  isDevelope: !production,
  isDebug: debug,
  loadappcore: loadappcore,
  NODE_ENV: production ? 'production' : 'develope',

  server: {
    port: 8081,
  },
}
