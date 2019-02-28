import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
App.mpType = 'app'

// leancloud存储服务
var APP_ID = 'W5kvrIuH2JRDuv1agWiUF0mc-gzGzoHsz'
var APP_KEY = 'iXAqToSFmPpQa812w5cSkPtA'
var AV = require('leancloud-storage')
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
})

const app = new Vue(App)
app.$mount()
