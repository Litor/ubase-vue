import {
  Vue,
  VueRouter,
  VueResource,
  Vuex
} from './lib'

import jquery from 'jquery'
window.$ = jquery
Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(Vuex)

let router = null
  /*var apppath='ubase-vue-example/test1';document.getElementById('current-app')&&document.getElementById('current-app').remove();var head = document.getElementsByTagName('head')[0];var script = document.createElement('script');
          script.src = 'http://localhost:8081/'+apppath+'.js';
          script.type = 'text/javascript';
          script.id="current-app";
          head.appendChild(script);location.hash="#!/"+apppath;*/
window.STARTAPP = function(app, store, routes) {
  document.getElementById('app-container').innerHTML = '<router-view></router-view>'
  router && router.stop()
  router = new VueRouter({
    root: '',
    linkActiveClass: 'active',
    hashbang: true
  })
  store = new Vuex.Store(store)
  router.map(routes)
  router.start(Vue.extend({
    components: {
      app
    },
    store: store
  }), document.getElementById('app-container'))
}

window.SWITCHAPP = function(apppath) {
  document.getElementById('current-app') && document.getElementById('current-app').remove()
  var head = document.getElementsByTagName('head')[0]
  var script = document.createElement('script')
  script.src = 'http://localhost:8081/' + apppath + '.js'
  script.type = 'text/javascript'
  script.id = 'current-app'
  head.appendChild(script)
  location.hash = '#!/' + apppath
}
