import { debug, production } from './helpers/getArg'

var src = './src'
var dest = './dist'

export default {
  src: src,
  dest: dest,
  app: '/app',

  isProduction: production,
  isDevelope: !production,
  isDebug: debug,
  NODE_ENV: production ? 'production' : 'develope',

  server: {
    port: 8081,
  },
}
