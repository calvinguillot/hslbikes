import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import * as VueGoogleMaps from "vue2-google-maps";
import gKey from "../gmapKey.json"

Vue.config.productionTip = false
Vue.use(vuetify)
Vue.use(VueGoogleMaps, {
  load: {
    key: gKey.key,
  }
});

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
