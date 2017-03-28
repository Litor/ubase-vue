/* global DEBUG */

import template from './template.html'

var name = 'app'

export default {
  name,
  template: template,

  vuex: {
    getters: {
    },
  },

  ready() {
    DEBUG && console.log('init', name)
  },
}
