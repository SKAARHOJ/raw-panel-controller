import Vue from 'vue'
import VModal from 'vue-js-modal'
import App from './App'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false
Vue.use(VModal, { dialog: true })

/* eslint-disable no-new */
new Vue({
  components: { App },
  template: '<App/>'
}).$mount('#app')
