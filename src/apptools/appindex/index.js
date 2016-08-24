import app from '{{entry}}'
import routes from '{{routes}}'
import config from '{{config}}'
import * as store from '{{store}}'
import '{{indexHtml}}'
let rootRoute = '{{rootRoute}}'
const STORE = {
  state: {},
  actions: [],
  mutations: [],
  modules: { app: store },
}

Object.keys(routes).forEach(function(key) {
  routes[rootRoute + key] = routes[key]
  delete routes[key]
})

window.STARTAPP(app, STORE, routes)
