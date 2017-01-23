import {
  Vue
} from './lib'
import {error} from './log'

// 事件管理, 事件统一注册在eventHub对象中
var eventHub = new Vue({})

eventHub.comps = {}
// 通过mixin混入，将vue组件的method方法，注册到事件管理器中
Vue.mixin({
  created() {
    var eventMap = this.$options.methods
    var currentComponentName = this.$options._ubase_component_name

    // 事件绑定
    if (eventMap && currentComponentName) {
      eventHub.comps[currentComponentName] = this
    }
  },

  beforeDestroy() {
    var eventMap = this.$options.methods
    var currentComponentName = this.$options._ubase_component_name

    // 清除事件监听
    if (eventMap && currentComponentName) {
      eventHub.comps[currentComponentName] = null
    }
  }
})

// 事件全局触发
function invoke(event, ...args) {
  var [componentName, methodName] = event.split('.')
  if (!eventHub.comps[componentName]) {
    error(`${componentName}.vue不存在！`, true)
    return
  }

  if (typeof eventHub.comps[componentName][methodName] !== 'function') {
    error(`${componentName}.vue中methods下不存在方法${methodName}！`, true)
    return
  }

  return eventHub.comps[componentName][methodName](...args)
}

function getData(componentName) {
  if (!eventHub.comps[componentName]) {
    error(`${componentName}.vue不存在！`, true)
    return
  }

  return eventHub.comps[componentName].$data
}

export {invoke, getData}
