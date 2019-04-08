<template>
    <div class="poet">
        <!-- <div>
            <p>简介</p>
            <text>{{poet.desc}}</text>
        </div> -->
        <i-card i-class="desc-card" :title="poet.name + '「' + poet.dynasty + '」'" :thumb="poet.image">
            <view slot="content" class="desc">
                <p class="desc-title">简介</p>
                {{poet.desc}}
            </view>
            <!-- <view slot="footer">尾部内容</view> -->
        </i-card>


        <i-card :title="poet.name + '「' + poet.dynasty + '」'">
            <view slot="content" class="desc">
                <text>
                    {{poet.content}}
                </text>
            </view>
        </i-card>
    </div>
</template>

<script>
// 存储服务
var AV = require('leancloud-storage')

export default {
    data() {
        return {
            poet: {}
        }
    },

    onLoad(option) {
        this.getPoetInfo(option.id)
    },

    methods: {
        getPoetInfo(id) {
            const poetQuery = new AV.Query('LCPoet')
            poetQuery.get('5a7aa71b7a1ff97e530fb554').then(poet => {
                this.poet = poet.attributes
                this.poet.content = poet.attributes.content.slice(0, -2)
                wx.setNavigationBarTitle({
                    title: poet.attributes.name
                })
                console.log(this.poet)
            }).catch(err => {
                console.log(err)
            })
        },

    }
}
</script>

<style lang="less" scoped>
    @deep: ~'>>>';
    .poet {
        padding: 15px 0;

        @{deep} .desc-card:first-child {
            margin-bottom: 15px;
        }

        .desc-title {
            font-size: 18px;
            margin-bottom: 6px;
        }

    }
</style>
