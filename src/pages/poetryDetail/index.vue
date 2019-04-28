<template>
    <div class="poetry-detail">
        <van-toast id="van-toast" />
        <van-dialog id="van-dialog" />
        <div class="collect" v-if="poetry.objectId">
            <van-icon name="star-o" color="#8B8989" size="28px"></van-icon>
            <div class="to-record" @click="toRecite">
                <img class="record-img" src="../../../static/img/microphone.png">
            </div>
            <button id="pageShare" open-type="share" class="share-btn">
                <van-icon name="share" color="#8B8989" size="28px"></van-icon>
            </button>
            <div class="back-home" v-if="shareEnter" @click="backHome">
                <van-icon name="wap-home" color="#8B8989" size="28px" custom-style="margin-right: 5px;"></van-icon>
                <span>返回首页</span>
            </div>
        </div>
        <div class="poetry-content">
            <p class="title">{{poetry.name}}</p>
            <p class="author">{{'「'+ poetry.dynasty + '」'}}<span v-if="poet.desc">{{poet.name}}</span></p>
            <div class="content-wrapper">
                <text class="content">
                    {{poetry.content}}
                </text>
            </div>
            <div class="load-more-wrapper" v-if="loading">
                <i-load-more i-class="load-more"/>
            </div>
        </div>
        <div class="translate">
            <Tabs :currentTab="current" :tabsArr="tabsArr" @listenToChildEvent="switchTab"></Tabs>
            <div class="tab-content">
                <p v-if="current === 'translate'">
                    <text v-if="poetry.fanyi">
                        {{poetry.fanyi}}
                    </text>
                    <no-data v-else name="暂无译注"></no-data>
                </p>
                <p v-if="current === 'appreciate'">
                    <text v-if="poetry.shangxi">
                       {{poetry.shangxi}} 
                    </text>
                    <no-data v-else name="暂无赏析"></no-data>
                </p>
                <p class="about-tab" v-if="current === 'about'">
                    <text v-if="poetry.about">
                        {{poetry.about}}
                    </text>
                    <no-data v-else name="暂无背景"></no-data>
                </p>
                <!-- 朗诵 -->
                <div class="recite-tab" v-if="current === 'recite'">
                    <div class="record-list-wrapper" v-if="recordListExist">
                        <div class="record-play" v-for="(record, index) in recordList" :key="index">
                            <div class="user-wrapper">
                                <img class="avatar-img" :src="record.user.avatarUrl">
                                <span class="nickName-span">{{record.user.nickName}}</span>
                            </div>
                            <div class="record-text">
                                {{record.text}}
                            </div>
                            <div class="record-wrapper" @click="playRecord(record, index)">
                                <van-icon custom-style="margin-top: 7px" name="volume-o" color="#2d5589" size="20"></van-icon>
                                <span class="duration-span" v-if="record.formatDuration">{{record.formatDuration}}</span>
                            </div>
                            <div class="record-share">
                                <span class="record-date">{{record.formatCreatedAt}}</span>
                                <div>
                                    <van-icon v-if="record.currentUserLiked" name="like" color="#FF0000" size="22px" @click="cancelLike(record.objectId, index)"></van-icon>
                                    <van-icon v-else name="like-o" color="#767676" size="22px" @click="like(record.objectId, index)"></van-icon>
                                    <span v-if="record.like > 0" class="record-like" :class="{'record-liked': record.currentUserLiked}">{{record.like}}</span>
                                    <button 
                                        :data-url="record.file.url"
                                        :data-duration="record.duration"
                                        :data-colonDuration="record.colonDuration"
                                        :data-avatar="record.user.avatarUrl"
                                        open-type="share"
                                        class="record-share-btn record-item-share">
                                        <van-icon name="share" color="#767676" size="22px" custom-style="margin-right: 8px;"></van-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <no-record v-else :poetryId="poetry.objectId"></no-record>
                </div>
                <van-popup
                    :show="popupShow"
                    position="bottom"
                    overlay="false"
                    @close="onClose"
                    custom-style="height: 300px;"
                    >
                    <div class="play-wrapper">
                        <div class="close-player">
                            <van-icon name="cross" size="25px" color="#000" @click="closePlayer"></van-icon>
                        </div>
                        <div :class="['disc', playing ? '': 'animation-pause']">
                            <div class='level_2'>
                                <div class='level_3'>
                                    <div class='level_3'>
                                        <div class='level_3'>
                                            <div class='level_3'>
                                                <div class='level_3 level_4'>
                                                    <div class='level_3 level_5'>
                                                        <img class="disc-img" :src="playingAvatar">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="progress-wrapper">
                            <p class="current-time-p">{{audioCurrentTime}}</p>
                            <div class="progress">
                                <div class="current-time" :style="{width: progressWidth}"></div>
                            </div>
                            <p class="duration-p">{{playingRecord.colonDuration}}</p>
                        </div>
                        <div class="play-operation">
                            <div v-if="playingRecordIndex >= 0">
                                <van-icon v-if="playingRecord.currentUserLiked" name="like" size="25px" color="#FF0000" @click="cancelLike(playingRecord.objectId, playingRecordIndex)"></van-icon>
                                <van-icon v-else name="like-o" size="25px" color="#767676" @click="like(playingRecord.objectId, playingRecordIndex)"></van-icon>
                            </div>
                            <div v-else style="width: 43px"></div>
                            <van-icon v-if="playing" name="pause-circle-o" size="50px" color="#2d5589" @click="pause"></van-icon>
                            <van-icon v-else name="play-circle-o" size="50px" color="#2d5589" @click="continuePlay"></van-icon>
                            <button
                                id="playerShare"
                                :data-url="playingRecord.file.url"
                                :data-duration="playingRecord.duration"
                                :data-colonDuration="playingRecord.colonDuration"
                                :data-avatar="playingRecord.user.avatarUrl"
                                class="record-share-btn"
                                open-type="share">
                                <van-icon name="share" size="25px" color="#767676"></van-icon>
                            </button>
                        </div>
                    </div>
                </van-popup>
                <div :class="['open-player', playing ? 'rotate' : '' ]" @click="openPlayer" v-if="recordListExist && playerShow && (!popupShow)">
                    <img class="record-img" src="../../../static/img/music.png">
                </div>
                <div class="author-tab" v-if="current === 'author'">
                    <div v-if="poet.desc">
                        <p class="poet-title">
                            <span>作者</span>
                            <span class="poet-more" @click="toPoet(poet.id)">
                                更多<van-icon name="arrow" custom-style="position: relative; top: 5rpx;"/>
                            </span>
                        </p>
                        <p class="poet-desc">{{poet.desc}}</p>
                    </div>
                    <no-data v-else name="暂无作者信息"></no-data>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// 存储服务
var AV = require('leancloud-storage')
import Toast from '../../../static/vant/toast/toast'
import Dialog from '../../../static/vant/dialog/dialog'
import Tabs from '../../components/tabs'
import NoData from '../../components/noData'
import noRecord from '../../components/noRecord'
import {ms2Minutes, symbolChange, getAudioTime} from '../../utils/timeUtils.js'
const innerAudioContext = wx.createInnerAudioContext()

export default {
    data() {
        return {
            verse: '',  // 诗句
            author: '',  // 作者
            poetry: {},
            poet: {},
            recordList: [],
            current: 'translate',
            loading: true,
            poetNotFound: false,
            recordListExist: false,
            isReciteBack: false,
            popupShow: false,
            audioCurrentTime: '00:00',
            audioDuration: '00:00',
            progressWidth: 0,
            // 正在播放状态
            playing: false,
            // 是否显示播放器
            playerShow: false,
            shareEnter: false,
            // playingSrc: '',
            // originalDuration: '',
            playingRecord: {
                file: {},
                user: {}
            },
            playingRecordIndex: '',
            playingAvatar: 'http://img2.imgtn.bdimg.com/it/u=1122649470,955539824&fm=26&gp=0.jpg',
            tabsArr: [
                {
                    title: '译注',
                    current: 'translate'
                },
                {
                    title: '赏析',
                    current: 'appreciate'
                },
                {
                    title: '背景',
                    current: 'about'
                },
                {
                    title: '朗诵',
                    current: 'recite'
                },
                {
                    title: '作者',
                    current: 'author'
                }
            ],
        }
    },

    components: {
        Tabs,
        NoData,
        noRecord
    },

    onLoad(option) {
        let that = this
        this.current = 'translate'
        if(option.shareEnter) {
            this.shareEnter = true
            if(option.recordUrl) {
                let record = {
                    duration: option.recordDuration,
                    colonDuration: option.recordColonDuration,
                    user: {
                        avatarUrl: option.recordAvatar
                    },
                    file: {
                        url: option.recordUrl,
                    }
                }
                this.playRecord(record, -1)
            }
        }
        if(option.id) {
            this.getOnePoetryById(option.id)
        } else {
            this.getOnePoetry(option.verse, option.author)
        }
    },

    onShow() {
        const isReciteBack = wx.getStorageSync('isReciteBack')
        if(isReciteBack) {
            this.getRecordList().then(() => {
                wx.setStorageSync('isReciteBack', false)
            })
        }
    },

    onHide() {
        console.log('hide')
        innerAudioContext.stop()
        this.playing = false
        this.popupShow = false
        this.playerShow = false
    },

    // 从当前页回到诗歌页
    onUnload() {
        console.log('unload')
        innerAudioContext.stop()
        this.playing = false
        this.popupShow = false
        this.playerShow = false
    },

    onShareAppMessage(res) {
        let that = this
        console.log(res.target)
        if((!res.target.id && res.from === 'button') || res.target.id === 'playerShare') {
            return {
                title: `我朗诵了${that.poetry.name}，来听听吧`,
                path: `/pages/poetryDetail/main?id=${that.poetry.objectId}&recordUrl=${res.target.dataset.url}&recordDuration=${res.target.dataset.duration}&recordColonDuration=${res.target.dataset.colonduration}&recordAvatar=${res.target.dataset.avatar}&shareEnter=${true}`,
            }
        } else {
            return {
                title: that.poetry.name,
                path: `/pages/poetryDetail/main?id=${that.poetry.objectId}&shareEnter=${true}`,
                success: (res) => {    // 成功后要做的事情
                    console.log(res)
                },
                fail: function (res) {
                    // 分享失败
                    console.log(res)
                }
            }
        }
    },

    methods: {
        getOnePoetryById(id) {
            this.loading = true
            const poetryQuery = new AV.Query('LCPoetry')
            poetryQuery.get(id).then(poetry => {
                if(poetry && poetry != undefined) {
                    // console.log('poetry: ', poetry.toJSON())
                    this.poetry = poetry.toJSON()
                    this.poetry.shangxi = poetry.attributes.shangxi ? poetry.attributes.shangxi.replace(/(赏析|鉴赏|评析|简析|其)[一|二|三]?\n\n/g, '赏析\n') : ''
                    this.poetry.about = poetry.attributes.about && poetry.attributes.about.replace(/背景?\n\n/g, '背景\n')
                    // 如果诗人存在
                    if(poetry.attributes.poet) {
                        let poetQuery = new AV.Query('LCPoet')
                        poetQuery.get(poetry.attributes.poet.id).then(poet => {
                            // console.log('poet: ', poet)
                            this.poet = poet.attributes
                            this.poet.id = poet.id
                        })
                    } else {
                        this.poet = {}
                    }
                    this.loading = false
                    this.getRecordList()
                } else {
                    Toast.fail('该诗句不存在');
                }
            }).catch(err => {
                console.log(err)
            })
        },

        getOnePoetry(verse, author) {
            this.loading = true
            const poetryQuery = new AV.Query('LCPoetry')
            poetryQuery.startsWith('author', author)
            poetryQuery.contains('content', verse)
            poetryQuery.addDescending('star')
            poetryQuery.first().then(poetry => {
                if(poetry && poetry != undefined) {
                    // console.log('poetry: ', poetry)
                    this.poetry = poetry.toJSON()
                    this.poetry.shangxi = poetry.attributes.shangxi && poetry.attributes.shangxi.replace(/(赏析|鉴赏|评析)[一|二|三]?\n\n/g, '赏析\n')
                    this.poetry.about = poetry.attributes.about && poetry.attributes.about.replace(/背景?\n\n/g, '背景\n')
                    // 如果诗人存在
                    if(poetry.attributes.poet) {
                        let poetQuery = new AV.Query('LCPoet')
                        poetQuery.get(poetry.attributes.poet.id).then(poet => {
                            // console.log('poet: ', poet)
                            this.poet = poet.attributes
                            this.poet.id = poet.id
                        })
                    } else {
                        this.poet = {}
                    }
                    this.loading = false
                    this.getRecordList()
                } else {
                    Toast.fail('该诗句不存在');
                }
            }).catch(err => {
                console.log(err)
                if(err.code === 124) {
                    Toast('网络超时')
                }
            })
        },

        // 获取朗诵列表
        getRecordList() {
            let that = this
            const currentUser = AV.User.current()
            // console.log(currentUser)
            const recordQuery = new AV.Query('LCRecord')
            const poetry = AV.Object.createWithoutData('LCPoetry', this.poetry.objectId)
            recordQuery.equalTo('poetry', poetry)
            // include:同时返回外键的详细信息
            recordQuery.include('user')
            recordQuery.include('file')
            recordQuery.descending('createdAt')
            return recordQuery.find().then(recordList => {
                if(recordList && recordList.length != 0) {
                    this.recordListExist = true
                     // console.log(recordList)
                    let arr = []
                    for(let record of recordList) {
                        let obj = record.toJSON()
                        console.log(record.toJSON())
                        obj.formatDuration = record.toJSON().duration ? ms2Minutes(record.toJSON().duration, false) : ''
                        obj.colonDuration = record.toJSON().duration ? ms2Minutes(record.toJSON().duration) : ''
                        obj.formatCreatedAt = that.formatCreatedAt(record.toJSON().createdAt)
                        if(record.toJSON().likedUsers && (record.toJSON().likedUsers.length > 0)) {
                            wx.checkSession({
                                success: function() {
                                    obj.currentUserLiked = record.toJSON().likedUsers.indexOf(currentUser.id) < 0 ? false : true
                                },
                                fail: function() {
                                    obj.currentUserLiked = false
                                }
                            })
                        } else {
                            obj.currentUserLiked = false
                        }
                        arr.push(obj)
                    }
                    this.recordList = arr
                    console.log('arr:', arr)
                } else {
                    this.recordListExist = false
                }
               
            }).catch(err => console.log(err))
        },

        like(recordId, index) {
            console.log(index)
            let that = this
            wx.checkSession({
                success: function() {
                    that.recordList[index].currentUserLiked = true
                    that.recordList[index].like++
                    const recordLikeMap = new AV.Object("RecordLikeMap");
                    const currentUser = AV.User.current();
                    const userId = currentUser.id;
                    // console.log(userId)
                    const record = AV.Object.createWithoutData("LCRecord", recordId);
                    recordLikeMap.set('user', currentUser);
                    recordLikeMap.set('record', record);
                    recordLikeMap.save().then(res => {
                        console.log('点赞成功')
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
                        message: '需要登录才能进进行操作哦'
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

        cancelLike(recordId, index) {
            console.log(recordId)
            let that = this
            that.recordList[index].currentUserLiked = false
            that.recordList[index].like--
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
                    console.log('删除一条点赞成功')
                }, function(err) {
                    console.log(err)
                })
                const record = AV.Object.createWithoutData("LCRecord", recordId)
                record.remove('likedUsers', userId)
                record.save().then(function(record) {
                    record.increment('like', -1)
                    return record.save({
                        fetchWhenSave: true
                    })
                }, function(err){
                    console.log(err)
                })
            }).catch(err => console.log(err))
        },

        switchTab(tab) {
            this.current = tab
        },

        onClose() {
            this.popupShow = false;
        },

        toRecite() {
            wx.navigateTo({
                url: `/pages/recite/main?poetryId=${this.poetry.objectId}`
            });
        },

        backHome() {
            let that = this
            console.log('回到首页')
            wx.switchTab({
                url: '/pages/home/main',
                success: function() {
                    that.shareEnter = false
                },
                fail: function(err) {
                    console.log(err)
                }
            });
        },

        openPlayer() {
            this.popupShow = true
        },

        closePlayer() {
            let that = this
            innerAudioContext.stop()
            that.popupShow = false
            that.playerShow = false
        },

        toPoet(id) {
            wx.redirectTo({
                url: `/pages/poet/main?id=${id}`
            })
        },

        playRecord(record, index) {
            let that = this
            that.playingRecordIndex = index
            that.playingAvatar = record.user.avatarUrl || 'http://img2.imgtn.bdimg.com/it/u=1122649470,955539824&fm=26&gp=0.jpg'
            // console.log(duration)
            that.playingRecord = record
            console.log(that.playingRecord)
            // that.originalDuration = duration
            // that.audioDuration = ms2Minutes(record.duration)
            // 这里好像无法判断点击的语音就是正在播放的语音
            // if(src === innerAudioContext.src) {
            //     console.log('safdas')
            //     that.popupShow = true
            //     return
            // }
            innerAudioContext.src = record.file.url
            // console.log(innerAudioContext.src)
            // that.playingSrc = src
            this.popupShow = true
            that.playing = true
            that.playerShow = true
            innerAudioContext.play()
            innerAudioContext.onPlay(() => {
                setTimeout(() => {
                    innerAudioContext.currentTime
                    innerAudioContext.onTimeUpdate(function () {
                        that.audioCurrentTime = getAudioTime(innerAudioContext.currentTime)
                        that.progressWidth = (innerAudioContext.currentTime * 1000 / record.duration) * 100 + '%'
                        // console.log(innerAudioContext.currentTime)
                    })
                }, 100)
                console.log("开始播放");
            });
            innerAudioContext.onEnded(() => {
                console.log("播放结束");
                this.playing = false
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
            // innerAudioContext.onPause(() => {
                this.playing = false
            // })
        },

        formatCreatedAt(createdAt) {
            return createdAt.split('T')[0]
        }
    } 
}
</script>

<style lang="less" scoped>
    // 深度作用选择器：未为了修改iView组件自带的样式。https://blog.csdn.net/zqian1994/article/details/83899919
    @deep: ~'>>>';
    @import url('../../theme.less');
    button::after {
        border: none;
    }
    .poetry-detail {
        .record-share-btn {
            display: inline-block;
            line-height: inherit;
            background: transparent;
            margin: 0;
            overflow: visible;
            padding: 0;
        }

        .record-item-share {
            margin-left: 20px;
        }
        .collect {
            width: 100%;
            height: 40px;
            display: flex;
            align-items: center;
            position: fixed;
            bottom: 0;
            left: 0;
            background: #ffffff;
            border-top: @list-border-bottom;
            padding: 2px 20px;
            z-index: 99;
            .to-record {
                margin: 0 30px;
                .record-img {
                    width: 30px;
                    height:30px;
                }
            }
            .share-btn {
                background: #ffffff;
                border-color: #ffffff;
                margin: 0;
                line-height: inherit;
                padding: 0;
                overflow: visible;
            }

            .back-home {
                display: flex;
                align-items: center;
                color: #8B8989;
                position: absolute;
                right: 60px;
            }
        }

        .title, .author {
            text-align: center;
        }
        .title {
            font-size: 23px;
            margin-bottom: 8px;
            padding: 0 5px;
        }

        .author {
            color: rgb(116, 115, 119);
            font-size: 18px;
        }

        .poetry-content {
            padding: 23px;
        }

        .content-wrapper {
            display: flex;
            justify-content: center;
            margin-top: -12px;
            .content {
                line-height: 28px;
                font-size: 20px;
            }
        }

        .translate {
            // @{deep} .translate-tabs {
            //     position: static;
            // }

            .tab-content {
                padding: 0 23px 50px 23px;
                // margin-bottom: 40px;
            }
            
            .about-tab {
                padding-bottom: 25px;
            }

            .recite-tab {
                position: relative;

                .record-list-wrapper {
                    padding: 20px 0;
                    position: relative;
                }
            }

            .open-player {
                width: 40px;
                height: 40px;
                position: fixed;
                left: 20px;
                bottom: 60px;
                border-radius: 50%;
                border: 1px solid @theme-blue;
                background-color: #ffffff;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 3;
                .record-img {
                    width: 70%;
                    height: 70%;
                }
            }

            .rotate {
                animation: round 6s linear infinite;
            }

            .author-tab {
                padding: 25px 0;

                .poet-title {
                    display: flex;
                    justify-content: space-between;
                    // margin-bottom: 15px;
                    .poet-more {
                        color: @theme-blue;
                    }
                }

                .poet-desc {
                    text-indent: 2em;
                }
            }
        }

        .load-more-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 8;
            background-color: #ffffff;
            padding-top: 50%;
        }

        .record-play {
            color: @theme-blue;
            border-bottom: 1px solid @border-grey;
            padding: 15px 0 5px 0;
            box-sizing: border-box;
            .popup-top {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                height: 40px;
                font-size: 18px;
                .cancel {
                    color: @second-grey;
                }
            }
        }

        .record-wrapper {
            width: 130px;
            height: 35px;
            padding: 0 15px;
            // padding-top: 13rpx;
            line-height: 35px;
            border-radius: 20px;
            border: 1px solid @theme-blue;
            box-sizing: border-box;
            margin-left: 20px;
            display: flex;
            justify-content: space-between;
            .duration-span {
                color: @second-grey;
                font-size: 14px;
            }
        }

        .record-share {
            margin-top: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .record-date {
                display: inline-block;
                margin-left: 10px;
                color: #8B8989;
                font-size: 14px;
            }
            // text-align: right;
            .record-like {
                color: #8B8989;
                margin-left: 3px;
                // margin-right: 20px;
                font-size: 14px;
                position:relative;
                bottom:5px;
            }

            .record-liked {
                color: #FF0000;
            }
        }

        .user-wrapper {
            padding: 0 5px;
            margin-bottom: 10px;
            .avatar-img {
                width: 30px;
                height: 30px;
                vertical-align: middle;
                border: 1rpx solid @second-grey;
                border-radius: 3px;
                margin-right: 10px;
            }

            .nickName-span {
                color: @theme-grey;
                font-size: 16px;
            }
        }

        .record-text {
            margin: 10px 0;
            color: #000;
            font-size: 16px;
            padding: 0 30px;
        }

        .play-wrapper {
            // width: 100%;
            height: 92%;
            padding: 10px 20px;
            background:hsla(0, 0%, 100%, .4);
            overflow: hidden;
            position: relative;
            &::before {
                content:'';
                position:absolute;
                top: 0;
                right: 0;
                left: 0;
                bottom: 0;
                // 滤镜
	            filter: blur(20px);
                background: url('https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1254538248,4136982084&fm=26&gp=0.jpg');
                // background: #ffffff;
                // background-color: rgba(141, 141, 141, 0.35);
                // background-blend-mode: darken;
                background-size: cover;
                z-index: -1;
            }

            .close-player {
                text-align: right;
            }

            .animation-pause {
                animation-play-state: paused;
            }

            // .playing {
            //     animation: round 10s linear infinite;
            //     animation-delay: 0.5s;
            // }

            @keyframes round {
                100% {
                    transform: rotate(1turn);
                }
            }

            .disc {
                margin: 0 auto;
                width: 130px;
                height: 130px;
                background-color: rgba(255, 255, 255, 0.2);
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 50%;
                padding: 1.5%;
                animation: round 10s linear infinite;
                animation-delay: 0.5s;
                .disc-img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                }
            }
        }

        .level_2, .level_3 {
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
            border-radius: 50%;
        }

        .level_2 {
            width: 99%;
            height: 99%;
            background-color: #262628;
            padding: 1.5%;
            background: linear-gradient(#101012, #272729, #101012);
        }

        .level_3 {
            width: 97%;
            height: 97%;
            border: 1px solid #131315;
            padding: 1%;
        }

        .level_4 {
            height: 92%;
            width: 92%;
            border: 5px solid #0b0708;
        }

        .level_5 {
            width: 100%;
            height: 100%;
            border: none;
            padding: 0;
        }

        .progress-wrapper {
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin-top: 10px;
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

        .play-operation {
            width: 240px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin: 15px auto 0 auto;
        }
    }
</style>
