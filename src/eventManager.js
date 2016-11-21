import {
  Vue
} from './lib'

// 事件管理, 事件统一注册在eventHub对象中
var eventHub = new Vue({})

// 通过mixin混入，将vue组件的method方法，注册到事件管理器中
Vue.mixin({
  created() {
    var eventMap = this.$options.methods
    var currentComponentName = this.$options._ubase_component_name

    // 事件绑定
    if (eventMap && currentComponentName) {
      Object.keys(eventMap).forEach((item) => {
        eventHub.$on(currentComponentName + '.' + item, eventMap[item].bind(this))
      })
    }
  },

  beforeDestroy() {
    var eventMap = this.$options.methods
    var currentComponentName = this.$options._ubase_component_name

    // 清除事件监听
    if (eventMap && currentComponentName) {
      Object.keys(eventMap).forEach((item) => {
        eventHub.$off(currentComponentName + '.' + item, eventMap[item])
      })
    }
  }
})

// 事件全局触发
function invoke(event, ...args) {
  Vue.nextTick(() => {
    eventHub.$emit(event, ...args)
  })
}

export {invoke}
