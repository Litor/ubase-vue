'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (i18n) {
  var cn = {},
      en = {};
  Object.keys(i18n).forEach(function (item) {
    var cnObj = {},
        enObj = {};
    cnObj[item] = i18n[item]['default']['cn'];
    enObj[item] = i18n[item]['default']['en'];
    $.extend(cn, cnObj);
    $.extend(en, enObj);
  });

  var defaults = {
    lang: 'cn',
    langs: [{ key: 'cn', value: '中文' }, { key: 'en', value: 'English' }],
    current: {},
    cn: cn,
    en: en
  };

  // initial state
  var state = defaults;

  state.current = defaults[state.lang];

  // mutations
  var mutations = _defineProperty({}, CHANGE_LOCAL, function (state, lang) {
    state.lang = lang;
    state.current = state[lang];
  });

  // actions
  var actions = {
    changeLang: function changeLang(_ref, lang) {
      var dispatch = _ref.dispatch;

      dispatch(CHANGE_LOCAL, lang);
    }
  };

  return {
    state: state,
    mutations: mutations,
    actions: actions
  };
};

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CHANGE_LOCAL = 'CHANGE_LOCAL';