import {
  Vue
} from './lib'

let gConfig = {}

function setConfig(config) {
  gConfig = config
}

function debug(string, sys) {
  if (gConfig['DEBUG']) {
    console && console.debug(`[${sys ? 'SYS DEBUG' : 'DEV DEBUG'}] ${new Date().toISOString()} ${(this&&this.$options&&this.$options._ubase_component_name)?'['+this.$options._ubase_component_name+']':''} ${string}`)
  }
}

function error(string, sys) {
  console && console.debug(`%c [${sys ? 'SYS ERROR' : 'DEV ERROR'}] ${new Date().toISOString()} [${(this&&this.$options&&this.$options._ubase_component_name)?'['+this.$options._ubase_component_name+']':''} ${string}`, 'color:red')
}

// Vue AJAX log 需要执行完Vue.use(VueResource)后才能初始化
function initVueAjaxLog() {
  Vue.http.interceptors.push(function (request, next) {
    debug(`[begin ajax] url: ${request.url}  request:\n ${JSON.stringify(request.body, null, 2)}`, true)
    next(function (response) {
      debug(`[end ajax] url: ${response.url}  request: ${request.body} ` + (response.status !== 200 ? `http status: ${response.status}` : `response:\n ${JSON.stringify(response.body, null, 2)} `), true)
    });
  })
}

// VUE component log
Vue.mixin({
  created() {
    var computed = this.$options.computed
    if (!computed) {
      return
    }
    var states = Object.keys(computed)
    var currentComponentName = this.$options._ubase_component_name

    if (currentComponentName && states.length > 0) {
      var statesStringArray = []

      _.each(states, (item) => {
        if (typeof computed[item] === 'function') {
          statesStringArray.push(`${item}: ${JSON.stringify(computed[item].bind(this)(), null, 2)}`)
        }
      })

      debug(`[Vue Component Create] name: ${currentComponentName} state: \n-------------------------------------------------\n${statesStringArray.join('\n\n')}\n-------------------------------------------------`, true)
    }
  },

  beforeDestroy() {
    if (!this.$options.computed) {
      return
    }
    var states = Object.keys(this.$options.computed)
    var currentComponentName = this.$options._ubase_component_name

    if (currentComponentName && states.length > 0) {
      debug(`[Vue Component Destroy] name: ${currentComponentName}`, true)
    }
  }
})

function initLog() {
  initVueAjaxLog()
}

export {debug, error, setConfig, initLog}
