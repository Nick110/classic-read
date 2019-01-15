import Vue from 'vue'
import App from '@/App'
import MpvueRouterPatch from 'mpvue-router-patch'
Vue.use(MpvueRouterPatch)

Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue(App)

app.$mount()
wx.cloud.init({
  traceUser: true
})

export default {
  // 这个字段走 app.json  相当于原来app.json里的对象
  config: {
    pages: [

    ],
    window: {
      backgroundTextStyle: 'dark',
      navigationBarBackgroundColor: '#00c25b',
      navigationBarTitleText: 'mpvue demo',
      navigationBarTextStyle: 'black',
      enablePullDownRefresh: true
    },
    tabBar: {
      "color": "#767676",
      "selectedColor": "#00c25b",
      "list": [{
        pagePath: "pages/home",
        text: "首页",
        iconPath: "/static/img/daily.png",
        selectedIconPath: "/static/img/daily-selected.png",
      }, {
        pagePath: "pages/todolist",
        text: "待办事项",
        iconPath: "/static/img/library.png",
        selectedIconPath: "/static/img/library-selected.png",
      }, {
        pagePath: "pages/my",
        text: "我的",
        iconPath: "/static/img/my.png",
        selectedIconPath: "/static/img/my-selected.png"
      }
    ]
    },
  }
}
