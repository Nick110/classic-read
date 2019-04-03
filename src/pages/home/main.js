import Vue from 'vue'
import App from './index'

const app = new Vue(App)
app.$mount()

// 新版已不适合这种写法，现在采用页面目录下建main.json里面写该页面的配置
// export default {
//     config: {
//         // 注意，页面级可配置属性相当于只是`src/main.js`中配置里的`window`部分
//         "navigationBarTitleText": "每日一言",
//         "enablePullDownRefresh": true,
//         "usingComponents": {
//             "i-button": "../../../static/iView/button/index",
//             "i-toast": "../../../static/iView/toast/index",
//             "i-icon": "../../../static/iView/icon/index",
//             "i-input": "../../../static/iView/input/index",
//             "i-avatar": "../../../static/iView/avatar/index"
//         }
//     }
// }