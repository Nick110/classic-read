<template>
    <div class="all-poetry">
        <div class="poet-title">
            {{poetName}}作品
        </div>
        <div class="poetry-list">
            <div class="poetry-item" v-for="(poetry, index) in poetryList" :key="index" @click="toPoetryDetail(poetry.id)">
                <div class="poetry-top">
                    <p class="poetry-name">{{poetry.name}}</p>
                </div>
                <div class="poetry-bottom">{{poetry.sentence}}</div>
            </div>
        </div>
        <i-load-more :tip="tip" :loading="loadingBottom" />
    </div>
</template>

<script>
var AV = require('leancloud-storage')
import {formatSentence} from '../../utils/index.js'
export default {
    data() {
        return {
            poetId: '',
            poetName: '',
            poetryList: [],
            currentPage: 1,
            pageSize: 30,
            loadingBottom: false,
            tip: ''
        }
    },

    onLoad(option) {
        this.poetId = option.poetId
        this.currentPage = 1
        this.tip = ''
        this.getPoetInfo(option.poetId)
        this.getPoetry(option.poetId, [], this.currentPage, this.pageSize)
    },

    // 监听用户上拉触底事件
    onReachBottom() {
        if(this.tip !== '没有更多了'){
            this.loadingBottom = true
            this.getPoetry(this.poetId, this.poetryList, this.currentPage, this.pageSize).then((res) => {
                this.loadingBottom = false
                if(res == 'nomore') {
                    this.tip = '没有更多了'
                }
            })
        }
        
    },

    methods: {
        getPoetInfo(poetId) {
            const poetQuery = new AV.Query('LCPoet')
            poetQuery.get(poetId).then(poet => {
                // console.log('poet: ', poet)
                this.poetName = poet.attributes.name
                // console.log(this.poetName)
            })
        },

        getPoetry(poetId, poetryArr, currentPage, pageSize) {
            const poetryQuery = new AV.Query('LCPoetry')
            var poet = AV.Object.createWithoutData('LCPoet', poetId)
            poetryQuery.equalTo('poet', poet)
            // 降序
            poetryQuery.addDescending('star')
            // 分页操作
            poetryQuery.limit(pageSize)
            poetryQuery.skip((currentPage - 1) * pageSize)
            poetryQuery.select(['name', 'content'])
            return poetryQuery.find().then(poetryList => {
                if(poetryList.length == 0 || poetryList == []) {
                    return 'nomore'
                }
                let tempArr = poetryArr
                try {
                    for(var item of poetryList) {
                        let itemObj = {
                            name: item.attributes.name,
                            sentence: formatSentence(item.attributes.content),
                            id: item.id
                        }
                        tempArr.push(itemObj)
                    }
                    this.poetryList = tempArr
                } catch(e) {
                    console.log(e)
                }
                this.currentPage ++
                if(poetryList.length < this.pageSize) {
                    this.tip = '没有更多了'
                }
            }).catch(err => {
                console.log(err)
            })
        },

        toPoetryDetail(id) {
            wx.navigateTo({
                url: `/pages/poetryDetail/main?id=${id}`
            })
        },
    }
}
</script>

<style lang="less" scoped>
    @import url('../../theme.less');
    .all-poetry {
        .poet-title {
            font-size: 24px;
            text-align: center;
            height: 60px;
            line-height: 60px;
            border-bottom: 1rpx solid #000000;
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
