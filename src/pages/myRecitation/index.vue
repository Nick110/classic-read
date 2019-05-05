<template>
    <div class="my-recitation">
        <van-dialog id="van-dialog" />
        <van-toast id="van-toast" />
        <div>
            <no-data v-if="recitationEmpty" name="暂无朗诵，快去读一首吧"></no-data>
            <van-swipe-cell
                :left-width="65"
                :right-width="65"
                v-for="recitation in myRecitations"
                :key="recitation.objectId">
                <view slot="left" class="play" @click="play(recitation)">播放</view>
                <van-cell
                    :title="recitation.poetry.name"
                    :value="recitation.formatDuration"
                    :label="recitation.createTime"
                    is-link
                    size="large" 
                    label-class="cell-label"
                    @click="toDetail(recitation.poetry.objectId)"
                >
                </van-cell>
                <view slot="right" class="delete" @click="deletRecitation(recitation.objectId)">删除</view>
            </van-swipe-cell>
        </div>

        <div class="pause" v-if="playing">
            <van-icon name="pause-circle-o" size="40px" color="#2d5589" @click="pause"></van-icon>
        </div>
    </div>
</template>

<script>
const AV = require('leancloud-storage');
import {ms2Minutes} from '../../utils/timeUtils.js';
import NoData from '../../components/noData'
import Dialog from '../../../static/vant/dialog/dialog';
import Toast from '../../../static/vant/toast/toast';
const innerAudioContext = wx.createInnerAudioContext();

export default {
    data() {
        return {
            myRecitations: [],
            recitationEmpty: false,
            playing: false,
        }
    },

    components: {
        NoData,
    },

    onUnload() {
        innerAudioContext.stop();
    },

    onHide() {
        innerAudioContext.stop();
    },

    onLoad() {
        this.getRecitations();
    },

    methods: {
        getRecitations() {
            let that = this;
            const user = AV.User.current();
            const query = new AV.Query('LCRecord');
            query.equalTo('user', user);
            query.include('poetry');
            query.include('file');
            query.descending('createdAt');
            query.find().then(list => {
                if(list.length > 0) {
                    that.recitationEmpty = false;
                    let arr = [];
                    for(let recitation of list) {
                        let obj = recitation.toJSON();
                        obj.formatDuration = ms2Minutes(recitation.toJSON().duration, false);
                        obj.createTime = recitation.toJSON().createdAt.replace('T', ' ').split('.')[0];
                        arr.push(obj);
                    }
                    that.myRecitations = arr;
                } else {
                    that.recitationEmpty = true;
                }
            }).catch(err => console.log(err));
        },

        play(recitation) {
            innerAudioContext.src = recitation.file.url;
            innerAudioContext.play();
            this.playing = true;
        },

        pause() {
            innerAudioContext.stop();
            this.playing = false;
        },

        toDetail(id) {
            wx.navigateTo({
                url: `/pages/poetryDetail/main?id=${id}`,
            })
        },

        deletRecitation(id) {
            let that = this;
            Dialog.confirm({
                title: '删除',
                message: '确认删除这此项内容？'
            }).then(() => {
                // on confirm
                // 删除File的权限是被关闭的，所以先不删除文件
                // var query = new AV.Query('LCRecord');
                // query.include('file').get(id).then(res => {
                //     let file = AV.File.createWithoutData(res.attributes.file.id);
                //     file.destroy().then(function (success) {
                        var record = AV.Object.createWithoutData('LCRecord', id);
                        record.destroy().then(function(res) {
                            that.getRecitations();
                            Toast.success('删除成功');
                        }, function(err) {
                            console.log(err);
                        }) 
                //     }, function (error) {
                //         console.log(err);
                //     });
                // }).catch(err => console.log(err))
            }).catch(() => {
                // on cancel
                console.log('取消删除');
            });
        },
    }
}
</script>

<style lang="less" scoped>
    .my-recitation {
        .play {
            width: 65px;
            height: 100%;
            text-align: center;
            background-color: rgb(27, 209, 73);
            color: #ffffff;
            line-height: 70px;
        }
        .delete {
            width: 65px;
            height: 100%;
            text-align: center;
            background-color: #FF0000;
            color: #ffffff;
            line-height: 70px;
        }

        .pause {
            position: fixed;
            bottom: 20px;
            right: 100px;
        }
    }
</style>
