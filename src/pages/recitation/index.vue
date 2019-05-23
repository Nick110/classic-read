<template>
    <div class="recitation">
        <van-dialog id="van-dialog" />
        <div class="to-recite" @click=toRecite>
            <img class="recite-img" src="../../../static/img/recite.png" alt="我要朗诵">
        </div>
        <div class="tabs">
            <van-tabs :active="current" @change="onChange" swipeable color="#92130a">
                <van-tab title="最热"></van-tab>
                <van-tab title="最新"></van-tab>
            </van-tabs>
        </div>
        <div class="list-wrapper" v-if="current === 0">
            <div class="list-item" v-for="item in hotRecitations" :key="item.objectId">
                <div class="user-wrapper">
                    <img class="avatar-img" :src="item.user.avatarUrl">
                    <span class="nickName-span">{{item.user.nickName}}</span>
                </div>
                <div class="record-text">
                    {{item.text}}
                </div>
                <div class="record-wrapper" @click="toPlayer(item.objectId)">
                    <van-icon custom-style="margin-top: 7px" name="volume-o" color="#92130a" size="20"></van-icon>
                    <span class="duration-span" v-if="item.formatDuration">{{item.formatDuration}}</span>
                </div>
                <div class="poetry" @click="toPoetry(item.poetry.objectId)">
                    {{item.poetry.name}}
                </div>
                <div class="record-share">
                    <div>
                        <van-icon v-if="item.currentUserLiked" name="like" color="#FF0000" size="22px" @click="cancelLike(item.objectId, index, 1)"></van-icon>
                        <van-icon v-else name="like-o" color="#767676" size="22px" @click="like(item.objectId, index, 1)"></van-icon>
                        <span v-if="item.like > 0" class="record-like" :class="{'record-liked': item.currentUserLiked}">{{item.like}}</span>
                    </div>
                    <span class="record-date">{{item.formatCreatedAt}}</span>
                </div>
            </div>
        </div>

        <div class="list-wrapper" v-else>
            <div class="list-item" v-for="item in newRecitations" :key="item.objectId">
                <div class="user-wrapper">
                    <img class="avatar-img" :src="item.user.avatarUrl">
                    <span class="nickName-span">{{item.user.nickName}}</span>
                </div>
                <div class="record-text">
                    {{item.text}}
                </div>
                <div class="record-wrapper" @click="toPlayer(item.objectId)">
                    <van-icon custom-style="margin-top: 7px" name="volume-o" color="#92130a" size="20"></van-icon>
                    <span class="duration-span" v-if="item.formatDuration">{{item.formatDuration}}</span>
                </div>
                <div class="poetry">
                    {{item.poetry.name}}
                </div>
                <div class="record-share">
                    <div>
                        <van-icon v-if="item.currentUserLiked" name="like" color="#FF0000" size="22px" @click="cancelLike(item.objectId, index, 2)"></van-icon>
                        <van-icon v-else name="like-o" color="#767676" size="22px" @click="like(item.objectId, index, 2)"></van-icon>
                        <span v-if="item.like > 0" class="record-like" :class="{'record-liked': item.currentUserLiked}">{{item.like}}</span>
                    </div>
                    <span class="record-date">{{item.formatCreatedAt}}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
var AV = require("leancloud-storage");
import Dialog from '../../../static/vant/dialog/dialog';
import {ms2Minutes, symbolChange, getAudioTime} from '../../utils/timeUtils.js'
export default {
    data() {
        return {
            hotRecitations: [],
            newRecitations: [],
            current: 0,
            loginStatus: false,
            needRefresh: false
        }
    },

    onLoad() {
        this.getRecitations()
    },

    onShow() {
        let that = this
        console.log('show');
        wx.checkSession({
            success: function() {
                that.loginStatus = true;
            },
            fail: function() {
                that.loginStatus = false;
            }
        })
        const recitationNeedRefresh = wx.getStorageSync('recitationNeedRefresh');
        if(recitationNeedRefresh) {
            that.getRecitations();
            wx.setStorageSync('recitationNeedRefresh', false)
        }
    },

    onPullDownRefresh() {
        this.getRecitations();
    },

    methods: {
        getRecitations() {
            let that = this;
            const currentUser = AV.User.current()
            const query = new AV.Query('LCRecord');
            query.include('user');
            query.include('file');
            query.include('poetry');
            query.descending('like').find().then(list => {
                let arr = [];
                for(let item of list) {
                    let obj = item.toJSON();
                    obj.formatDuration = item.toJSON().duration ? ms2Minutes(item.toJSON().duration, false) : ''
                    obj.colonDuration = item.toJSON().duration ? ms2Minutes(item.toJSON().duration) : ''
                    obj.formatCreatedAt = item.toJSON().createdAt.split('T')[0]
                    if(item.toJSON().likedUsers && (item.toJSON().likedUsers.length > 0)) {
                        if(that.loginStatus) {
                            obj.currentUserLiked = item.toJSON().likedUsers.indexOf(currentUser.id) < 0 ? false : true
                        } else {
                            obj.currentUserLiked = false
                        }
                    } else {
                        obj.currentUserLiked = false
                    }
                    arr.push(obj)
                }
                that.hotRecitations = arr;
            }).catch(err => console.log(err)).then(() => {
                query.descending('createdAt').find().then(list => {
                    let arr = [];
                    for(let item of list) {
                        let obj = item.toJSON();
                        obj.formatDuration = item.toJSON().duration ? ms2Minutes(item.toJSON().duration, false) : ''
                        obj.colonDuration = item.toJSON().duration ? ms2Minutes(item.toJSON().duration) : ''
                        obj.formatCreatedAt = item.toJSON().createdAt.split('T')[0]
                        if(item.toJSON().likedUsers && (item.toJSON().likedUsers.length > 0)) {
                            if(that.loginStatus) {
                                obj.currentUserLiked = item.toJSON().likedUsers.indexOf(currentUser.id) < 0 ? false : true
                            } else {
                                obj.currentUserLiked = false
                            }
                        } else {
                            obj.currentUserLiked = false
                        }
                        arr.push(obj)
                    }
                    that.newRecitations = arr;
                }).catch(err => console.log(err))
            })
        },

        onChange(e) {
            this.current = e.mp.detail.index;
            if(this.needRefresh) {
                this.getRecitations()
                this.needRefresh = false
            }
            wx.pageScrollTo({
                scrollTop: 0
            })
        },

        like(recordId, index, listNo) {
            let that = this
            wx.checkSession({
                success: function() {
                    if(listNo === 1) {
                        that.hotRecitations[index].currentUserLiked = true
                        that.hotRecitations[index].like++
                    } else if (listNo === 2) {
                        that.newRecitations[index].currentUserLiked = true
                        that.newRecitations[index].like++
                    }
                    const recordLikeMap = new AV.Object("RecordLikeMap");
                    const currentUser = AV.User.current();
                    const userId = currentUser.id;
                    const record = AV.Object.createWithoutData("LCRecord", recordId);
                    recordLikeMap.set('user', currentUser);
                    recordLikeMap.set('record', record);
                    recordLikeMap.save().then(res => {
                        console.log('点赞成功')
                        that.needRefresh = true;
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

        cancelLike(recordId, index, listNo) {
            let that = this
            if(listNo === 1) {
                that.hotRecitations[index].currentUserLiked = false
                that.hotRecitations[index].like--
            } else if (listNo === 2) {
                that.newRecitations[index].currentUserLiked = false
                that.newRecitations[index].like--
            }
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
                    that.needRefresh = true;
                    console.log('删除一条点赞成功')
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

        toPoetry(poetryId) {
            wx.navigateTo({
                url: `/pages/poetryDetail/main?id=${poetryId}`
            })
        },

        toRecite() {
            Dialog.confirm({
                confirmButtonText: '去文库',
                title: '去朗诵',
                message: '朗诵需要选择诗词，现在去文库搜索吗？'
            }).then(() => {
                wx.switchTab({
                    url: `/pages/library/main?fromRecitation=${true}`
                })
            }).catch(() => {
                // on cancel
                console.log('取消')
            });
        },

        toPlayer(recordId) {
            wx.navigateTo({
                url: `/pages/player/main?recordId=${recordId}`
            })
        }
    }
}
</script>

<style lang="less" scoped>
@import url('../../theme.less');
    .recitation {
        .to-recite {
            width: 40px;
            height: 40px;
            border: 1px solid @theme-red;
            border-radius: 50%;
            position: fixed;
            bottom: 20px;
            right: 20px;
            color: @theme-red;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #ffffff;
            .recite-img {
                width: 80%;
                height: 80%;
            }
        }
        .tabs {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #ffffff;
            z-index: 3;
        }
        .list-wrapper {
            margin-top: 50px;
            padding: 0 20px;
        }
        .list-item {
            color: @theme-red;
            border-bottom: 1px solid @border-grey;
            padding: 15px 0;
            box-sizing: border-box;

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

            .record-wrapper {
                width: 130px;
                height: 35px;
                padding: 0 15px;
                line-height: 35px;
                border-radius: 20px;
                border: 1px solid @theme-red;
                box-sizing: border-box;
                margin-left: 20px;
                display: flex;
                justify-content: space-between;
                .duration-span {
                    color: @second-grey;
                    font-size: 14px;
                }
            }

            .poetry {
                max-width: 340px;
                margin-left: 20px;
                color: @second-grey;
                font-size: 14px;
                margin-top: 10px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap
            }

            .record-share {
                margin-top: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-left: 15px;
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
        }
    }
</style>
