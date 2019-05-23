<template>
    <div class="recite">
        <van-toast id="van-toast"/>
        <van-notify id="custom-selector" />
        <van-notify id="van-notify" />
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
                    <view
                    class="wave waveTop"
                    style="background-image:url('data:image/png;base64,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')"
                    ></view>
                </view>
                <view class="waveWrapperInner bgMiddle">
                    <view
                        class="wave waveMiddle"
                        style="background-image:url('data:image/png;base64,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')"
                    ></view>
                </view>
                <view class="waveWrapperInner bgBottom">
                    <view
                        class="wave waveBottom"
                        style="background-image:url('data:image/png;base64,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')"
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

  onHide() {
    innerAudioContext.stop();
  },

  onUnload() {
      innerAudioContext.stop();
  },

  methods: {
    getPoetry(poetryId) {
      const poetryQuery = new AV.Query("LCPoetry");
      poetryQuery
        .get(poetryId)
        .then(poetry => {
          this.poetry = poetry.toJSON();
          console.log(poetry);
          if(poetry.toJSON().poet) {
            const poetQuery = new AV.Query("LCPoet");
            poetQuery.get(poetry.toJSON().poet.objectId).then(poet => {
              this.poet = poet.toJSON();
            });
          }
          
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
          Toast.success('提交成功');
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
      display: flex;
      justify-content: center;
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
