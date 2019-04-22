<template>
    <div class="tag-detail">
        <div class="title">{{tag.name}}</div>
        <div class="tag-subtitle">{{tag.subtitle || tag.desc}}</div>
        <div class="poetry-list">
            <div class="poetry-item" v-for="(poetry, index) in poetryList" :key="index" @click="toPoetryDetail(poetry.id)">
                <div class="poetry-top">
                    <p class="poetry-name">{{poetry.name}}</p>
                    <p class="poet">{{'[' + poetry.dynasty + ']'}} {{poetry.author}}</p>
                </div>
                <div class="poetry-bottom">{{poetry.sentence}}</div>
            </div>
        </div>
        <i-load-more :tip="tip" :loading="loadingBottom" />
    </div>
</template>

<script>
// 存储服务
var AV = require("leancloud-storage");
import {formatSentence} from '../../utils/index.js'
export default {
    data() {
        return {
            tag: {},
            poetryList: [],
            loadingBottom: false,
            currentPage: 1,
            pageSize: 20,
            tagId: '',
            tip: ''
        };
    },

    onLoad(option) {
        this.tagId = option.id
        this.currentPage = 1
        this.tip = ''
        this.getTagInfo(option.id)
        this.getTagPoetry(option.id, [], this.currentPage, this.pageSize)
    },

    // 监听用户上拉触底事件
    onReachBottom() {
        if(this.tip !== '没有更多了'){
            this.loadingBottom = true
        }
        this.getTagPoetry(this.tagId, this.poetryList, this.currentPage, this.pageSize).then((res) => {
            this.loadingBottom = false
            if(res == 'nomore') {
                this.tip = '没有更多了'
            }
        })
    },

    methods: {
        getTagInfo(id) {
            const tagQuery = new AV.Query("LCTag")
            tagQuery.get(id).then(tag => {
                // console.log(tag)
                this.tag = tag.toJSON()
            })
        },

        getTagPoetry(id, poetryArr, currentPage, pageSize) {
            const poetryQuery = new AV.Query("LCPoetry")
            var tagPointer = AV.Object.createWithoutData('LCTag', id)
            poetryQuery.equalTo('tags', tagPointer)
            // 降序
            poetryQuery.addDescending('star')
            // 分页操作
            poetryQuery.limit(pageSize)
            poetryQuery.skip((currentPage - 1) * pageSize)
            poetryQuery.select(['name', 'content', 'dynasty', 'author'])
            return poetryQuery.find().then(poetryList => {
                console.log(poetryList)
                if(poetryList.length == 0 || poetryList == []) {
                    return 'nomore'
                }
                let tempArr = poetryArr
                try {
                    for(var item of poetryList) {
                        let itemObj = {
                            name: item.attributes.name,
                            dynasty: item.attributes.dynasty,
                            sentence: formatSentence(item.attributes.content),
                            // 匹配作者中文开头（姓名）
                            author: item.attributes.author ? item.attributes.author.match(/^[\u4e00-\u9fa5]+/) : '',
                            id: item.id
                        }
                        tempArr.push(itemObj)
                    }
                    this.poetryList = tempArr
                } catch(e) {
                    console.log(e)
                }
                this.currentPage ++
            }).catch(err => {
                console.log(err)
            })
        },

        toPoetryDetail(id) {
            wx.navigateTo({
                url: `/pages/poetryDetail/main?id=${id}`
            })
        }
    }
};
</script>

<style lang="less" scoped>
    @import url('../../theme.less');
    .tag-detail {
        .title {
            font-size: 24px;
            margin-top: 20px;
            text-align: center;
        }

        .tag-subtitle {
            padding: 10px 0 15px 0;
            text-align: center;
            color: @second-grey;
            border-bottom: 1rpx solid @border-grey;
            font-size: 16px;
        }

        .poetry-list {
            padding-bottom: 10px;
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
    }
</style>
