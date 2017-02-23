import { debug, production } from './helpers/getArg'
import fs from 'fs'
var projectPath = process.cwd()

var content = fs.readFileSync(projectPath+'/ubase.config.json', 'utf-8')

var userConfig = JSON.parse(content)

export default {
  src: './src',
  dest: userConfig.dist || './dist',
  vueLibBuildIn:true,
  app: '/app',
  components: './src/components',
  pages: './src/pages',

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
