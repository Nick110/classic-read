<template>
    <div class="my-creation">
        <van-dialog id="van-dialog" />
        <van-toast id="van-toast" />
        <div>
            <no-data v-if="creationEmpty" name="暂无原创作品，快去创作吧"></no-data>
            <van-swipe-cell
                :right-width="65"
                v-for="creation in myCreations"
                :key="creation.objectId">
                <van-cell
                    :title="creation.title"
                    :label="creation.sentence"
                    size="large" 
                    label-class="cell-label"
                    is-link
                    @click="toDetail(creation.objectId)"
                />
                <view slot="right" class="delete" @click="deleteCreation(creation.objectId)">删除</view>
            </van-swipe-cell>
        </div>
    </div>
</template>

<script>
    const AV = require('leancloud-storage');
    import {formatSentence} from '../../utils/index.js';
    import Dialog from '../../../static/vant/dialog/dialog';
    import Toast from '../../../static/vant/toast/toast';
    import NoData from '../../components/noData'
    export default {
        data() {
            return {
                myCreations: [],
                creationEmpty: false,
            }
        },

        components: {
            NoData
        },

        onLoad() {
            this.getCreations()
        },

        methods: {
            getCreations() {
                let that = this;
                const user = AV.User.current();
                const query = new AV.Query('LCCreation');
                query.equalTo('user', user);
                query.descending('createdAt');
                query.find().then(list => {
                    if(list.length <= 0) {
                        that.creationEmpty = true;
                        return false;
                    }
                    let arr =[];
                    for(let creation of list) {
                        let obj = creation.toJSON();
                        obj.sentence = formatSentence(creation.toJSON().content);
                        arr.push(obj);
                    }
                    that.myCreations = arr;
                    that.creationEmpty = false;
                }).catch(err => console.log(err));
            },

            toDetail(id) {
                wx.navigateTo({
                    url: `/pages/creationDetail/main?creationId=${id}&focus=${false}`,
                })
            },

            deleteCreation(creationId) {
                let that = this;
                Dialog.confirm({
                    title: '删除',
                    message: '确认删除这此项内容？'
                }).then(() => {
                    // on confirm
                    var creation = AV.Object.createWithoutData('LCCreation', creationId);
                    creation.destroy().then(function(success) {
                        that.getCreations();
                        Toast.success('删除成功');
                        wx.setStorageSync('creationLogin', true);
                    }, function(err) {
                        console.log(err);
                    })
                }).catch(() => {
                    // on cancel
                    console.log('取消删除');
                });
            }
        }
    }
</script>

<style lang="less">
    .my-creation {
        .cell-label {
            width: 220px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .delete {
            width: 65px;
            height: 100%;
            text-align: center;
            background-color: #FF0000;
            color: #ffffff;
            line-height: 70px;
        }
    }
</style>
