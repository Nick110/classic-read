//   第一个是默认的首页
module.exports = [
  {
    path: 'pages/home',
    name: 'home',
    config: {
      navigationBarTitleText: '每日',
      enablePullDownRefresh: true,
      usingComponents: {
        'i-button': '../../static/iView/button/index',
        "i-toast": "../../static/iView/toast/index",
        "i-icon": "../../static/iView/icon/index",
        "i-input": "../../static/iView/input/index",
        "i-avatar": "../../static/iView/avatar/index"
      }
    }
  },
  {
    path: 'pages/todolist',
    name: 'todolist',
    config: {
      navigationBarTitleText: '待办事项',
      enablePullDownRefresh: true,
      usingComponents: {
        'i-button': '../../static/iView/button/index',
        "i-toast": "../../static/iView/toast/index",
        "i-icon": "../../static/iView/icon/index",
        "i-input": "../../static/iView/input/index",
        "i-avatar": "../../static/iView/avatar/index"
      }
    }
  }, 
  {
    path: 'pages/my',
    name: 'my',
    config: {
      navigationBarTitleText: '我',
      enablePullDownRefresh: true,
      usingComponents: {
        'i-button': '../../static/iView/button/index',
        "i-toast": "../../static/iView/toast/index",
        "i-icon": "../../static/iView/icon/index",
        "i-input": "../../static/iView/input/index",
        "i-avatar": "../../static/iView/avatar/index"
      }
    }
  }
]
