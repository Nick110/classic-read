<template>
    <div class="player">
        <div class="back-home" v-if="shareEnter" @click="toHome">
            <van-icon name="wap-home" size="24px"></van-icon>
        </div>
        
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
        <div class="playing">
            <div class="progress-wrapper">
                <p class="current-time-p">{{audioCurrentTime}}</p>
                <div class="progress">
                    <div class="current-time" :style="{width: progressWidth}"></div>
                </div>
                <p class="duration-p">{{record.colonDuration}}</p>
            </div>
            <div class="play-operation">
                <van-icon v-if="currentUserLiked" name="like" size="25px" color="#FF0000" @click="cancelLike(record.objectId)"></van-icon>
                <van-icon v-else name="like-o" size="25px" color="#767676" @click="like(record.objectId)"></van-icon>
                <van-icon v-if="playing" name="pause-circle-o" size="40px" color="#2d5589" @click="pause"></van-icon>
                <van-icon v-else name="play-circle-o" size="40px" color="#2d5589" @click="continuePlay"></van-icon>
                <button 
                    :data-id="record.objectId"
                    open-type="share"
                    class="record-share-btn">
                    <van-icon name="share" color="#767676" size="26px" custom-style="margin-right: 8px;"></van-icon>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
var AV = require("leancloud-storage")
import {ms2Minutes, symbolChange, getAudioTime} from '../../utils/timeUtils.js'
const innerAudioContext = wx.createInnerAudioContext()
export default {
    data() {
        return {
            record: {},
            poetry: {},
            user: {},
            poet: {},
            file: {},
            currentUserLiked: false,
            playing: false,
            audioCurrentTime: '00:00',
            audioDuration: '00:00',
            progressWidth: 0,
            shareEnter: false
        }
    },

    onLoad(option) {
        this.getRecordInfo(option.recordId).then(() => {
            this.play(this.file)
        })
        if(option.shareEnter) {
            this.shareEnter = true;
        }
    },

    onHide() {
        innerAudioContext.stop()
        this.playing = false
    },

    onUnload() {
        innerAudioContext.stop()
        this.playing = false
    },

    onShareAppMessage(res) {
        let that = this
        console.log(res.target)
        if(res.from === 'button') {
            return {
                title: `这一段朗诵很精彩，来听听吧`,
                path: `/pages/player/main?recordId=${res.target.dataset.id}&shareEnter=${true}`,
            }
        }
    },

    methods: {
        getRecordInfo(recordId) {
            let that = this;
            const currentUser = AV.User.current()
            const query = new AV.Query('LCRecord');
            query.include('user').include('poetry').include('file')
            return query.get(recordId).then(record => {
                console.log(record.toJSON());
                that.record = record.toJSON();
                that.record.colonDuration = record.toJSON().duration ? ms2Minutes(record.toJSON().duration) : ''
                wx.checkSession({
                    success: function() {
                        that.currentUserLiked = record.toJSON().likedUsers.indexOf(currentUser.id) < 0 ? false : true
                    },
                    fail: function() {
                        that.currentUserLiked = false
                    }
                })
                that.poetry = record.toJSON().poetry;
                that.file = record.toJSON().file;
                if(record.toJSON().poetry.poet) {
                    const poetQuery = new AV.Query('LCPoet');
                    poetQuery.get(record.toJSON().poetry.poet.objectId).then(res => {
                        that.poet = res.toJSON();
                    }).catch(err => console.log(err))
                }
                that.user = record.toJSON().user;
            }).catch(err => console.log(err))
        },

        play(file) {
            let that = this;
            innerAudioContext.src = file.url;
            innerAudioContext.play()
            innerAudioContext.onPlay(() => {
                that.playing = true;
                setTimeout(() => {
                    innerAudioContext.currentTime
                    innerAudioContext.onTimeUpdate(function () {
                        that.audioCurrentTime = getAudioTime(innerAudioContext.currentTime)
                        that.progressWidth = (innerAudioContext.currentTime * 1000 / that.record.duration) * 100 + '%'
                        // console.log(innerAudioContext.currentTime)
                    })
                }, 100)
                console.log("开始播放");
            });
            innerAudioContext.onEnded(() => {
                console.log("播放结束");
                this.playing = false;
            })
            innerAudioContext.onError((res) => {
                console.log(res);
            })
        },

        continuePlay() {
            console.log('继续播放')
            innerAudioContext.play()
            innerAudioContext.onPlay(() => {
                this.playing = true
            })
        },

        pause() {
            console.log('暂停')
            innerAudioContext.pause()
            this.playing = false
        },

         like(recordId) {
            let that = this
            wx.checkSession({
                success: function() {
                    const recordLikeMap = new AV.Object("RecordLikeMap");
                    const currentUser = AV.User.current();
                    const userId = currentUser.id;
                    // console.log(userId)
                    const record = AV.Object.createWithoutData("LCRecord", recordId);
                    recordLikeMap.set('user', currentUser);
                    recordLikeMap.set('record', record);
                    recordLikeMap.save().then(res => {
                        that.currentUserLiked = true;
                        console.log('点赞成功')
                        wx.setStorageSync('recitationNeedRefresh', true)
                        record.addUnique('likedUsers', [userId])
                        record.save().then(function (record) {
                            record.increment('like', 1);
                            return record.save({
                                fetchWhenSave: true
                            });
                        }, function (error) {
                            // 异常处理
                            console.error(error);
                        });
                    })
                },

                fail: function() {
                    Dialog.confirm({
                        title: '登录',
                        message: '需要登录才能进行操作哦'
                    }).then(() => {
                        // on confirm
                        wx.switchTab({
                            url: '/pages/my/main'
                        })
                    }).catch(() => {
                        // on cancel
                    });
                }
            })
        },

        cancelLike(recordId) {
            let that = this
            const firstQuery = new AV.Query("RecordLikeMap");
            const secondQuery = new AV.Query("RecordLikeMap");
            const currentUser = AV.User.current();
            const userId = currentUser.id;
            // console.log(userId)
            const record = AV.Object.createWithoutData("LCRecord", recordId);
            firstQuery.equalTo('user', currentUser);
            secondQuery.equalTo('record', record);
            const query = AV.Query.and(firstQuery, secondQuery)
            query.first().then(res => {
                console.log(res)
                var like = AV.Object.createWithoutData('RecordLikeMap', res.id);
                like.destroy().then(function() {
                    that.currentUserLiked = false;
                    console.log('删除一条点赞成功')
                    wx.setStorageSync('recitationNeedRefresh', true)
                    const record = AV.Object.createWithoutData("LCRecord", recordId)
                    record.remove('likedUsers', userId)
                    record.save().then(function(record) {
                        record.increment('like', -1)
                        return record.save({
                            fetchWhenSave: true
                        })
                    }, function(err) {
                        console.log(err)
                    })
                }, function(err) {
                    console.log(err)
                })
                
            }).catch(err => console.log(err))
        },

        toHome() {
            wx.switchTab({
                url: '/pages/home/main'
            })
        }
    },

}
</script>

<style lang="less" scoped>
@import url('../../theme.less');
    button::after {
        border: none;
    }
    button {
        display: inline-block;
        background: transparent;
        padding: 0;
        margin: 0;
        overflow: visible;
        line-height: normal;
    }

    .player {
        .back-home {
            width: 30px;
            height: 30px;
            border: 1px solid #000;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            position: fixed;
            bottom: 100px;
            right: 20px;
            background-color: #ffffff;
            padding-top: 3px;
            box-sizing: border-box;
        }

        .poetry {
            z-index: 2;
            padding: 20px 10px;
            overflow: scroll;
            height: 470px;
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

        .progress-wrapper {
            width: 80%;
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin: 10px auto 0 auto;
            font-size: 12px;
            color: @second-grey;
            .progress {
                width: 180px;
                height: 3px;
                border-radius: 5px;
                background: @second-grey;
                .current-time {
                    height: 100%;
                    border-radius: 3px;
                    background-color: @theme-blue;
                }
            }
        }

        .playing {
            width: 100%;
            height: 90px;
            position: fixed;
            bottom: 0;
            left: 0;
            border-top: 1px solid @border-grey;
        }

        .play-operation {
            width: 230px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin: 10px auto 0 auto;
        }

        .record-share-btn {
            margin-left: 5px;
        }
    }
</style>
