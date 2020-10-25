import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const map = new Array(129)
for (let i = 0; i < map.length; ++i) map[i] = new Set()

export default new Vuex.Store({
  state: {
    map,
    svg: '',
    serial: '',
    model: '',
    version: '',
    hwc: [],
    typeIndex: {},
  },
  mutations: {
    map(state, newVal) {
      const [key, value] = newVal.split(':')
      if (!+key) {
        return ;
      }
      const id = +key - 1
      for (let i in state.map) {
        state.map[i].delete(id)
      }
      if (!state.map[+value])
        state.map[+value] = new Set()
      state.map[+value].add(id)
      state.map[0].add(id)
    },
    list(state, newVal) {
      state.svg = newVal
    },
    _panelTopology_svgbase(state, newVal) {
      state.svg = newVal
    },
    _serial(state, newVal) {
      state.serial = newVal
    },
    _model(state, newVal) {
      state.model = newVal
    },
    _version(state, newVal) {
      state.version = newVal
    },
    _panelTopology_HWC(state, newVal) {
      const json = JSON.parse(newVal)
      console.log(json)
      state.hwc = json.HWc
      state.typeIndex = json.typeIndex
    }
  }
})
