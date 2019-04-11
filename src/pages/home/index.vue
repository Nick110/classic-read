<template>
    <div class="daily">
        <div class="verse" @click="toDetail">
            <div class="author">{{poetry.author}}</div>
            <text class="poetry-content">{{verse}}</text>
        </div>
    </div>
</template>

<script>
const jinrishici = require("../../utils/jinrishici.js")
export default {
    data() {
        return {
            poetry: {},
            verse: ""
        };
    },

  // 所有页面的created函数会在项目加载的时候被一起调用，而且进入页面的时候不会再被调用，
  // 所以这个函数基本就不能使用了，用小程序的onLoad钩子代替吧

  // mounted：你如果从页面B返回页面A，页面A的mounted钩子不会被触发，因为页面没有被重新加载，
  // 如果有需要每次页面展示都要调用的逻辑，使用小程序的onShow代替吧

    onLoad() {
        this.getDailypoetry();
    },

    onPullDownRefresh() {
        this.getDailypoetry().then(res => {
            wx.stopPullDownRefresh();
        });
    },

    mouted() {
        
    },

    methods: {
        getDailypoetry() {
            return new Promise((resolve, reject) => {
                jinrishici.load(result => {
                if (result.status === "success") {
                    // 下面是处理逻辑示例
                    console.log(result);
                    this.poetry = result.data.origin;
                    this.verse = result.data.content;
                    resolve(result);
                }
                });
            });
        },

        toDetail() {
            wx.navigateTo({
                url: `/pages/poetryDetail/main?verse=${this.verse}&author=${this.poetry.author}`
            })
        }
    }
};
</script>

<style lang="less">
@import url('../../theme.less');
page {
  background-color: #f0eff4;
}
.daily {
  .verse {
    background-size: cover;
    font-size: 24px;
    width: 250px;
    height: 400px;
    padding: 20px;
    margin: 0 auto;
    background-color: #ffffff;
    margin-top: 50px;
    position: relative;
    font-family: @ZoomlaXingtiJ3;
    writing-mode: tb-rl;
    box-shadow: 6px 6px 4px #6e6e6e56;
    .author {
      position: absolute;
      bottom: 40px;
      left: 20px;
    }

    .poetry-content {
      position: absolute;
      right: 20px;
    }
  }
}
</style>
