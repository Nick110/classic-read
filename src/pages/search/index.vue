<template>
    <div class="search">
        <div class="search-wrapper">
            <van-search :value="searchValue" placeholder="搜索诗词、作者" shape="round" />
        </div>
        <div class="result">
            <div class="poet-result">
                <div class="title">
                    作者：
                </div>
                <div class="poet-list">
                    <div class="poet-item" v-for="(poet, index) in poetList" :key="index">
                        {{poet.name}}
                    </div>
                </div>
            </div>
            <div class="poetry-result">
                <div class="title">
                    诗词：
                </div>
                <div class="poetry-list">
                    <div class="poetry-item" v-for="(poetry, index) in poetryList" :key="index">
                        {{poetry.name}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// 存储服务
var AV = require('leancloud-storage')
export default {
    data() {
        return {
            poetList: [],
            poetryList: []
        }
    },

    onLoad(option) {
        // console.log(option.keyword)
        this.searchPoet('白')
        this.searchPoetry('白')
    },

    methods: {
        searchPoet(keyword) {
            console.log(keyword)
            const poetQuery = new AV.Query('LCPoet')
            poetQuery.contains('name', keyword)
            poetQuery.descending('star')
            poetQuery.limit(5)
            poetQuery.find().then(poets => {
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
            })
        },

        searchPoetry(keyword) {
            const poetryNameQuery = new AV.Query('LCPoetry')
            const poetryContentQuery = new AV.Query('LCPoetry')
            poetryNameQuery.contains('name', keyword)
            poetryContentQuery.contains('content', keyword)
            const query = AV.Query.or(poetryNameQuery, poetryContentQuery)
            query.descending('star')
            query.limit(10)
            query.find().then(poetryList => {
                let arr = []
                for(let poetry of poetryList) {
                    let obj = {
                        id: poetry.toJSON().objectId,
                        name: poetry.toJSON().name
                    }
                    arr.push(obj)
                }
                this.poetryList = arr
                console.log(this.poetryList)
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
                .poet-list > .poet-item;
                height: 60px;
            }
            .poetry-item:not(:last-child) {
                border-bottom: 1rpx solid #e9e9e9;
            }
        }
        
    }
</style>
