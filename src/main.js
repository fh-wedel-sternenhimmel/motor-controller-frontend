import Vue from 'vue'
import App from './App.vue'
import store from './store'
import VueSocketio from 'vue-socket.io';

Vue.config.productionTip = false

Vue.use(VueSocketio, window.location.protocol + '//' + window.location.host);
// Vue.use(VueSocketio, 'http://192.168.8.192:3000');

new Vue({
    store,
    render: h => h(App)
}).$mount('#app')
