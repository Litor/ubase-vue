import { debug, production, loadappcore, dist } from './helpers/getArg'

var src = './src'
var dest = './www'

export default {
  src: src,
  dest: dest,
  components: src + '/components',
  pages: src + '/pages',
  modules: src + '/modules/',

  assets: {
    images: 'statics/images',
    scripts: 'statics/scripts',
    styles: 'statics/styles',
    fonts: 'statics/fonts',
  },

  isProduction: production,
  isDevelope: !production,
  isDebug: debug,
  argsDist: dist,
  loadappcore: loadappcore,
  NODE_ENV: production ? 'production' : 'develope',

  server: {
    port: 8081,
  },
}
