import app from '../../src/apps/test1/test1.vue'
import routes from '../../src/apps/test1/test1.routes.js'
import * as store from '../../src/apps/test1/test1.vuex.js'
import '../appindex/index.html'
let rootRoute = '/ubase-vue-example/test1'
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
console.log(routes)
window.STARTAPP(app, STORE, routes)
