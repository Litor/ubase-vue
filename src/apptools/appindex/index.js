import app from '{{entry}}'
import routes from '{{routes}}'
import '{{config}}'
import locales from '../appindex/locales'
import i18n from '{{i18n}}'
'{{importTpl}}'
import * as globalStore from '{{globalStore}}'
import '{{indexHtml}}'
let rootRoute = '{{rootRoute}}'

const STORE = {
  state: {},
  actions: [],
  mutations: [],
  modules: { global: globalStore, locales: locales(i18n) },
}

'{{setValueTpl}}'

Object.keys(routes).forEach(function(key) {
  routes[rootRoute + key] = routes[key]
  delete routes[key]
})

window.UBASE_STARTAPP(app, STORE, routes, i18n)
