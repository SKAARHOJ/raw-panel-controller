import Vue from 'vue'
import VueRouter from 'vue-router'

import LandingPage from './components/LandingPage'
import HardwareModal from './components/hardware_modal/Main'
import TextMode from './components/hardware_modal/TextMode'
import DrawMode from './components/hardware_modal/DrawMode'
import Waiter from './components/Waiter'

Vue.use(VueRouter)

const routes = [
  { path: '/waiter/:header', component: Waiter },
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
  { path: '*', redirect: '/waiter/abc' },
]

export default new VueRouter({ routes })
