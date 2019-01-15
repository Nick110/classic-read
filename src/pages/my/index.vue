<template>
  <div>我的</div>
</template>

<script>

export default {
  data() {
    return {

    }
  },

  // 所有页面的created函数会在项目加载的时候被一起调用，而且进入页面的时候不会在被调用，
  // 所以这个函数基本就不能使用了，用小程序的onLoad钩子代替吧

  // mounted：你如果从页面B返回页面A，页面A的mounted钩子不会被触发，因为页面没有被重新加载，
  // 如果有需要每次页面展示都要调用的逻辑，使用小程序的onShow代替吧

  mouted() {

  },

  methods: {
    
  }
}
</script>

<style lang="less" scoped>

</style>
