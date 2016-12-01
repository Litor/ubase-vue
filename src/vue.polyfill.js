import {
  Vue
} from './lib'

/**
 * vue source
 * Vue.prototype.$broadcast = function (event) {
	    var isSource = typeof event === 'string';
	    event = isSource ? event : event.name;
	    // if no child has registered for this event,
	    // then there's no need to broadcast.
	    if (!this._eventsCount[event]) return;
	    var children = this.$children;
	    var args = toArray(arguments);
	    if (isSource) {
	      // use object event to indicate non-source emit
	      // on children
	      args[0] = { name: event, source: this };
	    }
	    for (var i = 0, l = children.length; i < l; i++) {
	      var child = children[i];
	      var shouldPropagate = child.$emit.apply(child, args);
	      if (shouldPropagate) {
	        child.$broadcast.apply(child, args);
	      }
	    }
	    return this;
	  };

 在循环触发Vue实例的$children中的$emit方法时， 前一个child中的$emit方法可能会销毁掉其他的child（$children数组长度相应的也减少）导致循环往后执行时找不到child对象（children[i]为undefined）
 * **/
var old$broadcast = Vue.prototype.$broadcast
Vue.prototype.$broadcast = function(event, a, b, c, d, e, f, g){
  try {
    old$broadcast.bind(this)(event, a, b, c, d, e, f, g)
  } catch (e) {
    // console.log('child remove by prev child $emit')
  }

  return this
}

// https://github.com/vuejs/vue/pull/3726
Vue.prototype._updateRef = function (remove) {
  var ref = this.$options._ref
  if (ref) {
    var context = (this._scope || this._context)
    if(!context){
      return
    }
    var refs = context.$refs
    if (remove) {
      if (refs[ref] === this) {
        refs[ref] = null
      }
    } else {
      refs[ref] = this
    }
  }
}
