<template>
    <div class="account">
        <van-notify id="custom-selector"/>
        <van-toast id="van-toast" />
        <div class="logged">
            <div class="top">
                <img class="avatar-bg" src="../../../static/img/my_bg.png">
                <div class="avatar" v-if="loginStatus">
                    <div class="avatar-wrapper">
                        <img class="avatar-img" :src="user.avatarUrl">
                    </div>
                    <div class="user-desc">
                        <p class="nick-name">{{user.nickName}}</p>
                        <p class="motto">谁知盘中餐，粒粒皆辛苦</p>
                    </div>
                </div>
                <!-- 未登录 -->
                <div class="avatar" v-else>
                    <div class="avatar-wrapper">
                        <img class="avatar-img" src="../../../static/img/wechat.png">
                    </div>
                    <div class="user-desc">
                        <button
                            class="nick-name login-btn"
                            @getuserinfo="bindGetUserInfo"
                            open-type="getUserInfo"
                        >微信登录
                            <van-icon custom-class="arrow-login" name="arrow" color="#000000"></van-icon>
                        </button>
                        <p class="motto">人生得意须登录，莫使好诗空对月</p>
                    </div>
                </div>
            </div>
            <div class="data-list">
                <div class="list-item" @click="toCollection">
                    <van-icon
                        custom-class="list-item-icon"
                        name="star-o"
                        color="#FFD700"
                        size="22px"
                    />
                    <span class="list-item-name">我的收藏</span>
                    <van-icon custom-class="arrow-right" name="arrow" color="#C0C0C0"></van-icon>
                </div>
                <div class="list-item">
                    <van-icon
                        custom-class="list-item-icon"
                        name="records"
                        color="#1E90FF"
                        size="22px"
                    />
                    <span class="list-item-name">我的创作</span>
                    <van-icon custom-class="arrow-right" name="arrow" color="#C0C0C0"></van-icon>
                </div>
                <div class="list-item">
                    <van-icon
                        custom-class="list-item-icon"
                        name="bullhorn-o"
                        color="#92130a"
                        size="22px"
                    />
                    <span class="list-item-name">我的朗诵</span>
                    <van-icon custom-class="arrow-right" name="arrow" color="#C0C0C0"></van-icon>
                </div>
            </div>
            <div class="data-list about">
                <div class="list-item">
                    <van-icon
                        custom-class="list-item-icon"
                        name="smile-comment-o"
                        color="#3CB371"
                        size="22px"
                    />
                    <span class="list-item-name">关于</span>
                    <van-icon custom-class="arrow-right" name="arrow" color="#C0C0C0"></van-icon>
                </div>
            </div>
        </div>
        <!-- <div class="not-log-in">
            <van-button
                class="login-btn"
                type="primary"
                plain
                @click="login"
                open-type="getUserInfo"
        >登录</van-button>-->
        <!-- <van-button type="info" @click="checkLogin">检查登录状态</van-button> -->
        <!-- </div> -->
    </div>
</template>

<script>
var AV = require("leancloud-storage");
import Notify from "../../../static/vant/notify/notify";
import Toast from "../../../static/vant/toast/toast";

export default {
  data() {
    return {
      user: {},
      loginStatus: "",
      needBack: false
    };
  },

  // 所有页面的created函数会在项目加载的时候被一起调用，而且进入页面的时候不会在被调用，
  // 所以这个函数基本就不能使用了，用小程序的onLoad钩子代替吧

  // mounted：你如果从页面B返回页面A，页面A的mounted钩子不会被触发，因为页面没有被重新加载，
  // 如果有需要每次页面展示都要调用的逻辑，使用小程序的onShow代替吧

  onLoad(option) {
    if (option.back) {
      this.needBack = true;
    }
    wx.showLoading({
      title: "加载中"
    });
    this.checkLogin();
  },

  methods: {
    // 从stroage获取user信息
    getCurrentUser() {
      const user = wx.getStorage({
        key: "user",
        success: res => {
          console.log(res.data);
          this.user = res.data;
        }
      });
    },

    bindGetUserInfo(e) {
      const that = this;
      //用户按了允许授权按钮
      // console.log(e.mp.detail.userInfo)
      if (e.mp.detail.userInfo) {
        that.login().then(() => {
          const needBack = wx.getStorageSync("needBack");
          if (needBack) {
            wx.navigateTo({
              url: needBack.backUrl,
              success: function() {
                wx.removeStorage({
                  key: "needBack"
                });
              }
            });
          }
        });
      } else {
        Notify({
          text: "你取消了授权",
          duration: 1000,
          selector: "#custom-selector",
          backgroundColor: "#FF0000"
        });
        return;
      }
    },

    // 登录操作
    login() {
      const that = this;
      return AV.User.loginWithWeapp()
        .then(user => {
          console.log(user.toJSON());
          wx.setStorage({
            key: "user",
            data: user.toJSON()
          });
        })
        .then(() => {
          that.getUserInfo();
          that.loginStatus = true;
          that.getCurrentUser();
          Notify({
            text: "登录成功",
            duration: 1000,
            selector: "#custom-selector",
            backgroundColor: "#1989fa"
          });
        })
        .catch(console.error);
    },

    // 检查登录状态
    checkLogin() {
      const that = this;
      wx.checkSession({
        success: function() {
          console.log("已登录");
          that.loginStatus = true;
          that.getCurrentUser();
          wx.hideLoading();
        },
        fail: function() {
          //不存在登陆态
          console.log("未登录");
          that.loginStatus = false;
          const user = wx.getStorageSync("user");
          if (user) {
            wx.removeStorage({
              key: "user",
              success: res => {
                console.log("缓存已清除");
              }
            });
          } else {
            console.log("未登录状态，但是缓存已经不存在");
          }
          wx.hideLoading();
        }
      });
    },

    getUserInfo() {
      // 假设已经通过 AV.User.loginWithWeapp() 登录
      // 获得当前登录用户
      const user = AV.User.current();
      // 调用小程序 API，得到用户信息
      wx.getUserInfo({
        success: ({ userInfo }) => {
          // 更新当前用户的信息
          user
            .set(userInfo)
            .save()
            .then(user => {
              // 成功，此时可在控制台中看到更新后的用户信息
              //   getApp().globalData.user = user.toJSON();
              wx.setStorage({
                key: "user",
                data: user.toJSON()
              });
            })
            .catch(console.error);
        }
      });
    },

    toCollection() {
        if(this.loginStatus) {
            wx.navigateTo({
                url: `/pages/collection/main`
            })
        } else {
            Toast('需要登录才能进行此操作');
        }
    }
  }
};
</script>

<style lang="less">
@import url("../../theme.less");
page {
  background-color: @page-bg-grey;
}
.account {
  text-align: center;

  .top {
    position: relative;
    height: 180px;
    overflow: hidden;
  }
  .avatar-bg {
    width: 100%;
  }

  .avatar {
    width: 90%;
    height: 90px;
    position: absolute;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 6px;
    background-color: #ffffff;
    display: flex;
    padding: 0 20px;
    box-sizing: border-box;
    // justify-content: space-around;
    align-items: center;
    box-shadow: 2px 2px 4px #9c9c9c62;
    .avatar-img {
      width: 50px;
      height: 50px;
      border-radius: 5px;
      border: 1rpx solid #dddee1;
    }

    .user-desc {
      margin-left: 20px;
      font-size: 16px;
      text-align: left;
      .nick-name {
        margin-bottom: 6px;
        font-size: 20px;
      }

      .login-btn::after {
        border: 0;
      }

      .login-btn {
        background-color: #ffffff;
        line-height: 1.3;
        text-align: left;
        padding-left: 0;
      }

      .arrow-login {
        position: relative;
        top: 3px;
      }

      .motto {
        font-size: 14px;
        color: @theme-grey;
      }
    }
  }

  .data-list {
    text-align: left;
    background-color: #ffffff;
    padding: 0 20px;
    border-top: 1rpx solid #dddee1;
    border-bottom: 1rpx solid #dddee1;
    .list-item:not(:last-child) {
      border-bottom: 1rpx solid #dddee1;
    }
    .list-item {
      height: 50px;
      line-height: 50px;
      position: relative;
      .list-item-icon {
        position: relative;
        top: 3px;
      }
      .list-item-name {
        display: inline-block;
        margin-left: 10px;
      }
      .arrow-right {
        position: absolute;
        top: 16px;
        right: 6px;
      }
    }
  }

  .about {
    margin-top: 10px;
  }
}
</style>
