<template>
    <div class="search">
        <div class="search-wrapper">
            <van-search :value="searchValue" placeholder="搜索诗词、作者" shape="round" @change="search" @search="search"/>
        </div>
        <div class="result">
            <div class="poet-result">
                <div class="title">
                    作者：
                </div>
                <div class="no-result" v-if="noPoet">
                    无此作者，换个关键词吧。
                </div>
                <div class="poet-list" v-else>
                    <div class="poet-item" v-for="(poet, index) in poetList" :key="index" @click="toPoet(poet.id)">
                        {{poet.name}}
                    </div>
                </div>
                
            </div>
            <div class="poetry-result">
                <div class="title">
                    诗词：
                </div>
                <div class="no-result" v-if="noPoetry">
                    没有这个诗词，换个关键词吧。
                </div>
                <div class="poetry-list" v-else>
                    <div class="poetry-item" v-for="(poetry, index) in poetryList" :key="index" @click="toPoetry(poetry.id)">
                        <div v-if="poetry.highlightName" class="poetry-name">
                            <div class="poetry-title">
                                {{poetry.highlightName[0]}}<span class="highlight">{{poetry.highlightName[1]}}</span>{{poetry.highlightName[2]}}
                            </div>
                            <span class="author">{{poetry.formatAuthor + '/' + poetry.dynasty}}</span>
                        </div>
                        <p v-else class="poetry-name">
                            <span class="poetry-title">{{poetry.name}}</span>
                            <span class="author">{{poetry.formatAuthor + (poetry.formatAuthor ? '/' : '') + poetry.dynasty}}</span>
                        </p>
                        <p v-if="poetry.highlightContent" class="poetry-content">
                            {{poetry.highlightContent[0]}}<span class="highlight">{{poetry.highlightContent[1]}}</span>{{poetry.highlightContent[2]}}
                        </p>
                        <p v-else class="poetry-content">
                            {{poetry.formatContent}}
                        </p>
                    </div>
                </div>
                <i-load-more :tip="tip" :loading="loadingBottom" />
            </div>
        </div>
    </div>
</template>

<script>
// 存储服务
var AV = require('leancloud-storage')
import {formatSentence} from '../../utils/index.js'
export default {
    data() {
        return {
            poetList: [],
            poetryList: [],
            loadingBottom: false,
            currentPage: 1,
            pageSize: 20,
            tip: '',
            noPoet: false,
            noPoetry: false,
        }
    },

    onLoad(option) {
        this.keyword = option.keyword
        this.currentPage = 1
        this.tip = ''
        this.searchPoet(option.keyword)
        this.searchPoetry(option.keyword, [], this.currentPage, this.pageSize)
    },

    // 监听用户上拉触底事件
    onReachBottom() {
        if(this.tip !== '没有更多了'){
            this.loadingBottom = true
            this.searchPoetry(this.keyword, this.poetryList, this.currentPage, this.pageSize).then((res) => {
                this.loadingBottom = false
                if(res == 'nomore') {
                    this.tip = '没有更多了'
                }
            })
        }
    },

    methods: {
        searchPoet(keyword) {
            const poetQuery = new AV.Query('LCPoet')
            poetQuery.contains('name', keyword)
            poetQuery.descending('star')
            poetQuery.limit(5)
            poetQuery.find().then(poets => {
                if(poets && poets.length > 0) {
                    this.noPoet = false
                    let arr = []
                    for(let poet of poets) {
                        let obj = {
                            id: poet.toJSON().objectId,
                            name: poet.toJSON().name
                        }
                        arr.push(obj)
                    }
                    this.poetList = arr
                    console.log(this.poetList)
                } else {
                    this.noPoet = true
                } 
            })
        },

        searchPoetry(keyword, poetryArr, currentPage, pageSize) {
            let that = this
            const poetryNameQuery = new AV.Query('LCPoetry')
            const poetryContentQuery = new AV.Query('LCPoetry')
            poetryNameQuery.contains('name', keyword)
            poetryContentQuery.contains('content', keyword)
            const query = AV.Query.or(poetryNameQuery, poetryContentQuery)
            query.descending('star')
            // 分页
            query.limit(pageSize)
            query.skip((currentPage - 1) * pageSize)
            return query.find().then(poetryList => {
                if(poetryList && poetryList.length > 0) {
                    this.noPoetry = false
                    let arr = poetryArr
                    for(let poetry of poetryList) {
                        let obj = {
                            id: poetry.toJSON().objectId,
                            name: poetry.toJSON().name,
                            // 匹配作者中文开头（姓名）
                            formatAuthor: poetry.toJSON().author ? poetry.toJSON().author.match(/^[\u4e00-\u9fa5]+/)[0] : '',
                            dynasty: poetry.toJSON().dynasty,
                            highlightName: that.highlight(keyword, poetry.toJSON().name),
                            formatContent: formatSentence(poetry.toJSON().content),
                            highlightContent: that.highlight(keyword, poetry.toJSON().content)
                        }
                        arr.push(obj)
                    }
                    this.poetryList = arr
                    console.log(this.poetryList)
                    this.currentPage ++
                } else {
                    if(currentPage === 1) {
                        this.noPoetry = true
                    }
                    return 'nomore'
                }
            }).catch(err => console.log(err))
        },

        search(e) {
            if(!e.mp.detail) {
                return false
            }
            this.currentPage = 1
            this.searchPoet(e.mp.detail)
            this.searchPoetry(e.mp.detail, [], this.currentPage, this.pageSize)
        },

        // 高亮搜索关键字
        highlight(keyword, string) {
            let length = keyword.length
            let index = string.indexOf(keyword)
            if(index === -1) {
                return false
            }
            let start = (index - 6) > 0 ? (index - 6) : 0
            let frontStr = string.substring(start, index)
            let highlightStr = string.substr(index, length)
            let backStr = string.substring(index + length, index + length + 6)
            return [frontStr, highlightStr, backStr]
        },

        toPoet(poetId) {
            wx.navigateTo({
                url: `/pages/poet/main?id=${poetId}`
            })
        },

        toPoetry(poetryId) {
            wx.navigateTo({
                url: `/pages/poetryDetail/main?id=${poetryId}`
            })
        }
    }
}
</script>

<style lang="less" scoped>
    @import url('../../theme.less');
    .search {
        .result {
            .title {
                height: 40px;
                line-height: 40px;
                background: #f0f0f0d2;
                padding: 0 20px;
            }
            .poet-list {
                padding: 0 20px;
                .poet-item {
                    height: 45px;
                    line-height: 45px;
                    color: #474747;
                }

                .poet-item:not(:last-child) {
                    border-bottom: 1rpx solid #e9e9e9;
                }
            }

            .poetry-list {
                padding: 0 20px;
            }

            .poetry-item {
                height: 60px;
                padding: 6px 0;
                .highlight {
                    color: #ff0000;
                }

                .poetry-content {
                    margin-top: 10px;
                    color: #474747;
                    font-size: 14px;
                }

                .poetry-name {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .poetry-title {
                    width: 220px;
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .author {
                    color: #474747;
                    font-size: 14px;
                    width: 120px;
                    text-align: right;
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
            .poetry-item:not(:last-child) {
                border-bottom: 1rpx solid #e9e9e9;
            }

            .no-result {
                height: 60px;
                line-height: 60px;
                text-align: center;
                color: #474747;
                font-size: 16px;
            }
        }
    }
</style>
