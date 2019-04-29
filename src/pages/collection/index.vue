<template>
    <div class="collection">
        <div class="tabs">
            <van-tabs :active="current" @change="onChange" color="#2d5589">
                <van-tab title="收藏诗词"></van-tab>
                <van-tab title="赞过的作者"></van-tab>
            </van-tabs>
        </div>
        
        <swiper style="height: 550px; margin-top: 45px;" :current="current" @change="switchTab">
            <block>
                <swiper-item class="swiper-item">
                    <no-data v-if="poetryEmpty" name="暂无收藏的诗词"></no-data>
                    <div v-else class="poetry-list">
                        <div class="poetry-item" v-for="(poetry, index) in collectedPoetryList" :key="index" @click="toPoetryDetail(poetry.id)">
                            <div class="poetry-top">
                                <p class="poetry-name">{{poetry.name}}</p>
                                <p class="poet">{{'[' + poetry.dynasty + ']'}} {{poetry.formatAuthor}}</p>
                            </div>
                            <div class="poetry-bottom">{{poetry.sentence}}</div>
                        </div>
                    </div>
                </swiper-item>
                <swiper-item class="swiper-item">
                    <no-data v-if="poetEmpty" name="暂无赞过的作者"></no-data>
                    <div v-else class="poet-list">
                        <div class="poet-item" v-for="(poet, index) in likedPoetList" :key="index" @click="toPoet(poet.objectId)">
                            <img class="poet-img" :src="poet.image" />
                            <div class="poet-name">{{poet.name}}</div>
                        </div>
                    </div>
                </swiper-item>
            </block>
        </swiper>
        
    </div>
</template>

<script>
var AV = require("leancloud-storage");
import {formatSentence} from '../../utils/index.js';
import NoData from '../../components/noData';
export default {
    data() {
        return {
            collectedPoetryList: [],
            likedPoetList: [],
            poetryEmpty: false,
            poetEmpty: false,
            current: 0,
        }
    },

    components: {
        NoData
    },

    onLoad() {
        this.getCollectedPoetry();
        this.getLikedPoets();
    },

    methods: {
        getCollectedPoetry() {
            let that = this;
            const user = AV.User.current();
            const collectQuery = new AV.Query('PoetryCollectMap');
            collectQuery.equalTo('user', user);
            collectQuery.include('poetry');
            collectQuery.descending('createdAt');
            collectQuery.find().then(list => {
                if(list.length > 0) {
                    that.poetryEmpty = false;
                    let arr = [];
                    for(let item of list) {
                        let poetry = item.toJSON().poetry
                        let obj = {
                            id: poetry.objectId,
                            name: poetry.name,
                            dynasty: poetry.dynasty,
                            formatAuthor: poetry.author ? poetry.author.match(/^[\u4e00-\u9fa5]+/) : '',
                            sentence: formatSentence(poetry.content),
                        };
                        arr.push(obj);
                        that.collectedPoetryList = arr;
                    }
                } else {
                    that.poetryEmpty = true;
                } 
            }).catch(err => console.log(err));
        },

        getLikedPoets() {
            let that = this;
            const user = AV.User.current();
            const likeQuery = new AV.Query('PoetLikeMap');
            likeQuery.equalTo('user', user);
            likeQuery.include('poet');
            likeQuery.descending('createdAt');
            likeQuery.find().then(list => {
                if(list.length > 0) {
                    that.poetEmpty = false;
                    let arr = [];
                    for(let item of list) {
                        let poet = item.toJSON().poet;
                        arr.push(poet);
                        that.likedPoetList = arr;
                    }
                } else {
                    that.poetEmpty = true;
                }
            }).catch(err => console.log(err));
        },

        switchTab(e) {
            this.current = e.mp.detail.current;
        },

        onChange(e) {
            this.current = e.mp.detail.index;
        },

        toPoet(id) {
            wx.navigateTo({
                url: `/pages/poet/main?id=${id}`
            })
        },

        toPoetryDetail(poetryId) {
            wx.navigateTo({
                url: `/pages/poetryDetail/main?id=${poetryId}`
            })
        }
    },

}
</script>

<style lang="less" scoped>
    @import url('../../theme.less');
    .collection {
        .tabs {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #ffffff;
            z-index: 3;
        }

        .poetry-list {
            padding: 10px 0;
        }

        .poetry-item {
            border-bottom: 1rpx solid @border-grey;
            padding: 8px 20px;
            .poetry-top {
                display: flex;
                justify-content: space-between;
                font-size: 18px;
                margin-bottom: 5px;
                .poetry-name {
                    width: 220px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }

            .poet {
                color: @second-grey;
                font-size: 14px;
                width: 120px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                text-align: right;
            }

            .poetry-bottom {
                color: @second-grey;
                font-size: 14px;
                width: 250px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .swiper-item {
            overflow: scroll;
        }

        .poet-list {
            padding: 10px 20px;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            .poet-item {
                border: 1px solid #000000;
                border-radius: 5px;
                font-size: 0;
                margin: 10px 5px;
            }

            .poet-img {
                width: 62px;
                height: 90px;
                border-radius:5px;
            }

            .poet-name {
                background-color: @theme-blue;
                text-align: center;
                margin: 0;
                font-size: 16px;
                color: #ffffff;
            }
        }
        
    }
</style>
