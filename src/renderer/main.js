import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App'
import LandingPage from './components/LandingPage'
import HardwareModal from './components/hardware_modal/Main'
import TextMode from './components/hardware_modal/TextMode'
import DrawMode from './components/hardware_modal/DrawMode'
import Waiter from './components/Waiter'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.use(VueRouter)

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
  router
}).$mount('#app')
