<template>
    <div class="poet">
        <i-card i-class="desc-card" :title="poet.name + '「' + poet.dynasty + '」'" :thumb="poet.image">
            <view slot="content" class="desc">
                <p class="desc-title">简介</p>
                {{poet.desc}}
            </view>
            <!-- <view slot="footer">尾部内容</view> -->
        </i-card>
        <div class="hot">
            <p class="hot-title">经典作品</p>
            <div class="hot-list-wrapper">
                <div class="hot-list" v-for="(poetry, index) in hotTen" :key="index" @click="toPoetry(poetry.id)">
                    <p class="hot-name">{{poetry.name}}</p>
                    <p class="hot-sentence">{{poetry.sentence}}</p>
                </div>
            </div>
        </div>
        <div class="poet-intro">
            <p class="intro-title">人物事迹</p>
            <div class="intro-content">
                <text v-if="poet.content != ''">
                    {{poet.content}}
                </text>
                <no-data v-else></no-data>
            </div>
        </div>
    </div>
</template>

<script>
// 存储服务
var AV = require('leancloud-storage')
import NoData from '../../components/noData'

export default {
    data() {
        return {
            poet: {
                name: '',
                dynasty: ''
            },
            // 经典作品
            hotTen: []
        }
    },

    components: {
        NoData
    },

    onLoad(option) {
        this.getPoetInfo(option.id)
        this.getHotPoetry(option.id)
    },

    methods: {
        getPoetInfo(id) {
            const poetQuery = new AV.Query('LCPoet')
            poetQuery.get(id).then(poet => {
                this.poet = poet.attributes
                this.poet.content = poet.attributes.content ? poet.attributes.content.slice(0, -1) : ''
                wx.setNavigationBarTitle({
                    title: poet.attributes.name
                })
                // console.log(this.poet)
            }).catch(err => {
                console.log(err)
            })
        },

        getHotPoetry(id) {
            const poetryQuery = new AV.Query('LCPoetry')
            var poet = AV.Object.createWithoutData('LCPoet', id);
            poetryQuery.equalTo('poet', poet)
            poetryQuery.addDescending('star')
            poetryQuery.limit(10)
            poetryQuery.select(['name', 'content'])
            poetryQuery.find().then(poetry => {
                let tempArr = []
                for(var item of poetry) {
                    let itemObj = {
                        id: item.id,
                        name: item.attributes.name,
                        sentence: item.attributes.content.split('\n')[0]
                    }
                    tempArr.push(itemObj)
                }
                // console.log(tempArr)
                this.hotTen = tempArr
            })
        },

        toPoetry(id) {
            wx.navigateTo({
                url: `/pages/poetryDetail/main?id=${id}`
            })
        }
    }
}
</script>

<style lang="less" scoped>
    @deep: ~'>>>';
    .poet {
        padding: 15px 0;

        // @{deep} .desc-card:first-child {
        //     margin-bottom: 15px;
        // }

        .desc-title {
            font-size: 18px;
            margin-bottom: 6px;
        }

        .poet-intro {
            margin: 0 16px;
            font-size: 14px;
            overflow: hidden;
            position: relative;
            background: #fff;
            border: 1rpx solid #dddee1;
            border-radius: 5px;
            margin-bottom: 15px;
            .intro-title {
                padding: 10px 16px;
                font-size: 18px;
                border-bottom: 1rpx solid #dddee1;
            }

            .intro-content {
                padding: 10px 16px;
                color: rgb(85, 89, 104);
            }
        }

        .hot {
            font-size: 14px;
            padding: 16px;
            padding-right: 0;
            margin-bottom: 10px;
            .hot-title {
                .poet-intro > .intro-title;
                padding-left: 0;
            }
            .hot-list-wrapper {
                .hot-list {
                    height: 46px;
                    padding: 8px 0;
                    border-bottom: 1rpx solid #dddee1;
                    color: rgb(85, 89, 104);
                    .hot-name {
                        color: #000;
                        font-size: 16px;
                        margin-bottom: 5px;
                        .hot-sentence;
                    }

                    .hot-sentence {
                        width: 250px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }
            }
        }
        
        
    }
</style>
