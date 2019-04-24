<template>
    <div class="recite">
        <van-toast id="van-toast"/>
        <van-notify id="custom-selector" />
        <van-dialog id="van-dialog"/>
        <img class="recite-bg" src="../../../static/img/recite_bg.png">
        <div class="poetry">
            <p class="title">{{poetry.name}}</p>
            <p class="author">
                {{'「'+ poetry.dynasty + '」'}}
                <span>{{poet.name}}</span>
            </p>
            <div class="poetry-content">
                <text>{{poetry.content}}</text>
            </div>
        </div>
        <div class="record">
            <view class="waveWrapper waveAnimation" v-if="recording">
                <view class="waveWrapperInner bgTop">
                    <view class="wave waveTop"></view>
                </view>
                <view class="waveWrapperInner bgMiddle">
                    <view
                        class="wave waveMiddle"
                        style="background-image:url('http://image.weilanwl.com/img/wave-mid.png')"
                    ></view>
                </view>
                <view class="waveWrapperInner bgBottom">
                    <view
                        class="wave waveBottom"
                        style="background-image:url('http://image.weilanwl.com/img/wave-bot.png')"
                    ></view>
                </view>
            </view>
            <div class="record-operation">
                <p @click="cancelRecord">取消</p>
                <div class="img-wrapper" @click="checkLogin">
                    <img
                        class="recite-img"
                        :src="recording ? '/static/img/recite.png' : '/static/img/recite_black.png'"
                        alt=""
                    >
                </div>
                <p @click="finishRecord">完成</p>
            </div>
            <van-popup
                :show="popupShow"
                position="bottom"
                overlay="false"
                @close="onClose"
                z-index="2"
            >
                <div class="record-preview">
                    <div class="popup-top">
                        <p class="cancel" @click="cancelSubmit">取消</p>
                        <p class="submit" @click="submitRecord">提交</p>
                    </div>
                    <div class="record-wrapper" @click="playRecord">
                        <van-icon name="volume-o" color="#2d5589"></van-icon>
                    </div>
                    <div class="text-wrapper">
                        <van-field
                            textValue="message"
                            type="textarea"
                            placeholder="说点什么吧（可选，100字以内）"
                            autosize
                            border="true"
                            clearable="true"
                            placeholder-style="color: #adadaddc"
                            @blur="finishInput"
                            maxlength="100"
                        />
                    </div>
                </div>
            </van-popup>
        </div>
    </div>
</template>

<script>
const AV = require("leancloud-storage");
import Toast from "../../../static/vant/toast/toast";
import Notify from "../../../static/vant/notify/notify";
import Dialog from "../../../static/vant/dialog/dialog";

// 全局唯一的录音管理器
const recorderManager = wx.getRecorderManager();
// 音频
const innerAudioContext = wx.createInnerAudioContext();

export default {
  data() {
    return {
      poetryId: "",
      poetry: {},
      poet: {},
      recording: false,
      tempFilePath: "",
      popupShow: false,
      // 录音开始时间
      recordStartTime: 0,
      // 录音结束时间
      recordEndTime: 0,
      loginStatus: false,
      textValue: ""
    };
  },

  onLoad(option) {
    this.poetryId = option.poetryId;
    this.getPoetry(option.poetryId);
  },

  methods: {
    getPoetry(poetryId) {
      const poetryQuery = new AV.Query("LCPoetry");
      poetryQuery
        .get(poetryId)
        .then(poetry => {
          this.poetry = poetry.toJSON();
          console.log(poetry);
          const poetQuery = new AV.Query("LCPoet");
          poetQuery.get(poetry.toJSON().poet.objectId).then(poet => {
            this.poet = poet.toJSON();
          });
        })
        .catch(err => {
          console.log(err);
        });
    },

    // 检查登录状态
    checkLogin() {
      if (this.recording) {
        return false;
      } else {
        const that = this;
        wx.checkSession({
          success: function() {
            console.log("已登录");
            that.loginStatus = true;
          },
          fail: function() {
            //不存在登陆态
            console.log("未登录");
            wx.hideLoading();
            that.loginStatus = false;
            Dialog.confirm({
              title: "登录",
              message: "你还未登录，需要登录才能朗诵"
            })
              .then(() => {
                // on confirm
                wx.switchTab({
                  url: `/pages/my/main`,
                  success: () => {
                    wx.setStorage({
                      key: "needBack",
                      data: {
                        backUrl: `/pages/recite/main?poetryId=${that.poetryId}`
                      }
                    });
                  }
                });
              })
              .catch(() => {
                // on cancel
                console.log("取消");
                return;
              });
          },

          complete: function() {
            that.startRecord();
          }
        });
      }
    },
    // 录音
    startRecord() {
      if (this.loginStatus) {
        const options = {
          duration: 300000, //指定录音的时长，单位 ms
          sampleRate: 16000, //采样率
          numberOfChannels: 1, //录音通道数
          encodeBitRate: 96000, //编码码率
          format: "mp3", //音频格式，有效值 aac/mp3
          frameSize: 50 //指定帧大小，单位 KB
        };
        //开始录音
        recorderManager.start(options);
        recorderManager.onStart(() => {
          this.recordStartTime = Date.parse(new Date());
          console.log("录音开始");
          this.recording = true;
        });
        //错误回调
        recorderManager.onError(res => {
          console.log(res);
          Toast.fail("系统出现了问题~");
        });
      }
    },

    finishRecord() {
      if (this.recording) {
        recorderManager.stop();
        recorderManager.onStop(res => {
          this.recordEndTime = Date.parse(new Date());
          this.recording = false;
          if (this.recordEndTime - this.recordStartTime < 3000) {
            Notify({
              text: "录音时间太短了哦~",
              duration: 1000,
              selector: "#custom-selector",
              backgroundColor: "#FF0000"
            });
          } else {
            // tempFilePath:录音文件的临时路径
            this.tempFilePath = res.tempFilePath;
            console.log("录音完成", res.tempFilePath);
            const { tempFilePath } = res;
            this.popupShow = true;
          }
        });
      } else {
        return;
      }
    },

    cancelRecord() {
      recorderManager.stop();
      this.recording = false;
    },

    playRecord() {
      innerAudioContext.src = this.tempFilePath;
      innerAudioContext.play();
      innerAudioContext.onPlay(() => {
        console.log("开始播放");
      });
      innerAudioContext.onError(res => {
        console.log(res);
        Toast.fail(res.errMsg);
      });
    },

    // 关联record表到user和file
    relevance(file) {
      const record = new AV.Object("LCRecord");
      const currentUser = AV.User.current();
      const poetry = AV.Object.createWithoutData("LCPoetry", this.poetryId);
      // 录音时长
      const recordDuration = this.recordEndTime - this.recordStartTime;

      // console.log(currentUser);
      record.set("file", file);
      record.set("user", currentUser);
      record.set("poetry", poetry);
      record.set("text", this.textValue);
      record.set('duration', recordDuration)
      record
        .save()
        .then(() => {
          Notify({
            text: "提交成功",
            duration: 1000,
            selector: "#custom-selector",
            backgroundColor: "#1989fa"
          });
        })
        .catch(error => {
          console.error(error);
          Notify({
            text: "上传错误",
            duration: 1000,
            selector: "#custom-selector",
            backgroundColor: "#FF0000"
          });
        });
    },

    submitRecord() {
      const that = this;
      wx.saveFile({
        tempFilePath: that.tempFilePath,
        success(res) {
          const savedFilePath = res.savedFilePath;
          const currentUser = AV.User.current().toJSON();
          //   console.log("tempFilePath: ", that.tempFilePath);
          //   console.log("savedFilePath: ", savedFilePath);
          new AV.File(`${that.poetry.name}-${currentUser.nickName}`, {
            blob: {
              uri: savedFilePath
            }
          })
            // 上传
            .save()
            // 上传成功
            .then(file => {
              //   文件保存成功;
              that.popupShow = false;
              console.log(file);
              that.relevance(file);
              wx.removeSavedFile({
                filePath: savedFilePath,
                complete(res) {
                  console.log("删除" + res);
                  that.backtoPoetryDetail();
                }
              });
            })
            // 上传发生异常
            .catch(error => {
              console.error(error);
              Notify({
                text: "提交发生异常",
                duration: 1000,
                selector: "#custom-selector",
                backgroundColor: "#FF0000"
              });
            });
        }
      });
    },

    // 返回诗歌页
    backtoPoetryDetail() {
        wx.setStorage({
            key: 'isReciteBack',
            data: true,
            success: function() {
                wx.navigateBack({
                    delta: 1
                });
            }
        })
    },

    cancelSubmit() {
      innerAudioContext.stop();
      this.popupShow = false;
    },

    onClose() {
      this.popupShow = false;
    },

    // onChange(event) {
    //     // event.detail 为当前输入的值
    //     console.log(event.mp.detail);
    //     console.log(this.textValue);
    // },

    finishInput(event) {
      console.log(event.mp.detail);
      this.textValue = event.mp.detail.value;
    }
  }
};
</script>

<style lang="less" scoped>
@import url("../../theme.less");
page {
  width: 100%;
  height: 100%;
}
.recite {
  width: 100%;
  height: 100%;
  .recite-bg {
    width: 100%;
    height: 100%;
    z-index: -1;
    position: fixed;
    top: 0;
    left: 0;
    opacity: 0.2;
  }

  .poetry {
    z-index: 2;
    padding: 20px 10px;
    overflow: scroll;
    height: 480px;
    .title {
      font-size: 23px;
      margin-bottom: 8px;
      padding: 0 5px;
      text-align: center;
    }
    .poetry-content {
      padding: 10px 23px;
      font-size: 19px;
    }

    .author {
      color: rgb(116, 115, 119);
      font-size: 18px;
      text-align: center;
    }
  }

  .record {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 2;
    background: #ffffff;
    .record-operation {
      height: 60px;
      box-sizing: border-box;
      box-shadow: 0 -5px 5px #e7e7e7a9;
      border-top: 2px solid @theme-blue;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 70px;
      font-size: 16px;
      color: rgb(121, 121, 121);
    }

    .img-wrapper {
      width: 28px;
      height: 28px;
      .recite-img {
        width: 100%;
        height: 100%;
      }
    }

    .record-preview {
      height: 200px;
      padding: 0 20px 20px 20px;
      color: @theme-blue;
      .popup-top {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        height: 40px;
        font-size: 18px;
        .cancel {
          color: @theme-grey;
        }
      }

      .text-wrapper {
        padding: 20px 0;
      }
    }

    .record-wrapper {
      width: 110px;
      height: 35px;
      padding-left: 15px;
      padding-top: 7px;
      border-radius: 20px;
      border: 1rpx solid @theme-blue;
      box-sizing: border-box;
    }
  }
  @keyframes move_wave {
    0% {
      transform: translateX(0) translateZ(0) scaleY(1);
    }

    50% {
      transform: translateX(-25%) translateZ(0) scaleY(1);
    }

    100% {
      transform: translateX(-50%) translateZ(0) scaleY(1);
    }
  }

  .waveWrapper {
    // overflow: hidden;
    position: relative;
    height: 50rpx;
    width: 100%;
    background: @theme-blue;
    transform: rotate(180deg);
  }

  .waveWrapperInner {
    position: absolute;
    width: 100%;
    overflow: hidden;
    height: 100%;
    bottom: -1px;
  }

  .bgTop {
    z-index: 15;
    opacity: 0.5;
    height: 24px;
  }

  .bgMiddle {
    z-index: 10;
    opacity: 0.75;
    height: 19px;
  }

  .bgBottom {
    z-index: 5;
    height: 14px;
  }

  .wave {
    position: absolute;
    left: 0;
    width: 2160px;
    height: 100%;
    background-repeat: repeat no-repeat;
    background-position: 0 bottom;
    transform-origin: center bottom;
  }

  .wave image {
    width: 100%;
    position: absolute;
    bottom: 0;
  }

  .waveTop {
    background-size: 540px 25px;
  }

  .waveAnimation .waveTop {
    animation: move_wave 30s linear infinite;
  }

  .waveMiddle {
    background-size: 1080px 20px;
  }

  .waveAnimation .waveMiddle {
    animation: move_wave 24s linear infinite;
  }

  .waveBottom {
    background-size: 540px 15px;
  }

  .waveAnimation .waveBottom {
    animation: move_wave 12s linear infinite;
  }
}
</style>
