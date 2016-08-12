import boot from './boot'
import { setConfig } from './utils'
import { browserDefine, browserRequire } from './require'

window.browserDefine = browserDefine
window.browserRequire = browserRequire

window.STARTAPP = function(store, routes) {

  browserRequire(['text!./config.json'], function(config) {
    var configObj = null
    eval('configObj = ' + config)
    setConfig(configObj)

    boot(store, routes, configObj)
  })
}
