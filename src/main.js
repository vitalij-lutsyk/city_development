import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'leaflet/dist/leaflet.css'
import 'element-ui/lib/theme-chalk/slider.css'
import { Slider } from 'element-ui'

Vue.use(Slider)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
