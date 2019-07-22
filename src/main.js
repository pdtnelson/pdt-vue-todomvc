import Vue from 'vue'
import App from './App.vue'
import Axios from 'axios'

Vue.config.productionTip = false

const axios = Axios.create({
    baseURL: 'http://localhost:8081/v1/api'
})
Vue.prototype.$http = axios
Vue.directive('todo-focus', (el, binding) => {
  if (binding.value) {
    el.focus();
  }
})
new Vue({
  render: h => h(App),
}).$mount('#app')
