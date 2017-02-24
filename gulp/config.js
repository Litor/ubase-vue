import { debug, production } from './helpers/getArg'
import fs from 'fs'
import {getItem} from './localStorage'

var userConfig = JSON.parse(getItem('userConfig'))

export default {
  src: './src',
  dest: userConfig.dist || './dist',
  vueLibBuildIn:true,
  app: '/app',
  components: './src/components',
  pages: './src/pages',
  alias:userConfig.alias || {},
  proxy:userConfig.proxy||[],

  assets: {
    images: 'statics/images',
    scripts: 'statics/scripts',
    styles: 'statics/styles',
    fonts: 'statics/fonts',
  },

  isProduction: production,
  isDeveloper: !production,
  isDebug: debug,
  NODE_ENV: production ? 'production' : 'developer',

  server: {
    port: userConfig.port || 8081,
  },
}
