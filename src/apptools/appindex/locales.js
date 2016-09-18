const CHANGE_LOCAL = 'CHANGE_LOCAL'

export default function(i18n) {
  var cn = {},
    en = {};
  Object.keys(i18n).forEach(function(item) {
    var cnObj = {},
      enObj = {};
    cnObj[item] = i18n[item]['default']['cn'];
    enObj[item] = i18n[item]['default']['en'];
    $.extend(cn, cnObj)
    $.extend(en, enObj)
  })

  console.log(cn)
  const defaults = {
    lang: 'cn',
    langs: [
      { key: 'cn', value: '中文' },
      { key: 'en', value: 'English' },
    ],
    current: {},
    cn: cn,
    en: en,
  }

  // initial state
  const state = defaults

  state.current = defaults[state.lang]

  // mutations
  const mutations = {
    [CHANGE_LOCAL](state, lang) {
      state.lang = lang
      state.current = state[lang]
    },
  }

  // actions
  const actions = {
    changeLang({ dispatch }, lang) {
      dispatch(CHANGE_LOCAL, lang)
    },
  }

  return {
    state: state,
    mutations: mutations,
    actions: actions
  }
}
