import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import App from './App'
import LandingPage from './components/LandingPage'
import HardwareModal from './components/hardware_modal/Main'
import TextMode from './components/hardware_modal/TextMode'
import DrawMode from './components/hardware_modal/DrawMode'
import Waiter from './components/Waiter'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(Vuex)

let map = new Array(129)
for (let i = 0; i < map.length; ++i) map[i] = new Set()

const store = new Vuex.Store({
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
      if (!+key || !+value) return;
      state.map[+value].add(+key - 1)
      state.map[0].add(+key - 1)
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
      state.hwc = json.HWc
      state.typeIndex = json.typeIndex
    }
  }
})

const routes = [
  { path: '/', component: Waiter },
  {
    path: '/landing-page/',
    component: LandingPage,
    children: [
      {
        path: 'hardware-modal/:id/',
        name: 'hardware-modal',
        component: HardwareModal,
        meta: { showModal: false },
        children: [
          { path: "", name: "Text", component: TextMode },
          { path: "draw", name: "Draw", component: DrawMode }
        ]
      },
    ]
  },
]

const router = new VueRouter({ routes })


new Vue({
  components: { App },
  template: '<App/>',
  router,
  store,
}).$mount('#app')
