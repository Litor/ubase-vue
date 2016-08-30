const CHANGE_LOCAL = 'CHANGE_LOCAL'

export default function(i18n) {
  const defaults = {
    lang: 'cn',
    langs: [
      { key: 'cn', value: '中文' },
      { key: 'en', value: 'English' },
    ],
    current: {},
    cn: i18n.cn,
    en: i18n.en,
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
