<template>
    <div class="library">
        <i-tabs :current="current" color="#00c25b" @change="handleChange">
            <i-tab key="type" title="分类"></i-tab>
            <i-tab key="author" title="作者"></i-tab>
        </i-tabs>
        <!-- <div class="anthology">
            <p class="title">
                「 选集 」
            </p>
            <div class="content">
                <div class="set" v-for="(tag, index) in anthologyList" :key="index">
                    <p class="tag-name">{{tag.name}}</p>
                    <p class="tag-desc">{{tag.desc}}</p>
                </div>
            </div>
        </div> -->

        <!-- <div class="textbook">
            <p class="title">
                「 教材 」
            </p>
            <div class="content">
                <div class="set" v-for="(tag, index) in textbookList" :key="index">
                    <p class="tag-name">{{tag.name}}</p>
                    <p class="tag-desc">{{tag.desc}}</p>
                </div>
            </div>
        </div> -->

        <Tag title="选集" :list="anthologyList"></Tag>
        <Tag title="教材" :list="textbookList"></Tag>
        <Tag title="主题" :list="themeList"></Tag>
        <Tag title="写景" :list="sceneryList"></Tag>
        <Tag title="节日" :list="festivalList"></Tag>
    </div>
</template>
<script>
// 存储服务
var AV = require('leancloud-storage')
import Tag from '../../components/tag'
export default {
    data() {
        return {
            current: 'type',
            anthologyList: [],
            sceneryList: [],
            textbookList: [],
            themeList: [],
            festivalList: []
        }
    },

    components: {
        Tag
    },

    onLoad() {
        this.getTags('选集', 'anthologyList')
        this.getTags('教材', 'textbookList')
        this.getTags('主题', 'themeList')
        this.getTags('写景', 'sceneryList')
        this.getTags('节日', 'festivalList')
    },

    methods: {
        getTags(type, listName) {
            const tagQuery = new AV.Query('LCTag')
            tagQuery.equalTo('type', type)
            tagQuery.select(['name', 'desc'])
            tagQuery.find().then(tags => {
                // console.log(tags)
                let arr = []
                for(let tag of tags) {
                    let obj = {
                        id: tag.id,
                        name: tag.attributes.name,
                        desc: tag.attributes.desc
                    }
                    arr.push(obj)
                }
                this[listName] = arr
            }).catch(err => {
                console.log(err)
            })
        },

        handleChange (e) {
            this.current = e.target.key
        },
    }
}
</script>

<style lang="less" scoped>
    // @import url('../../theme.less');
    .library {
        padding-bottom: 10px;
    }
</style>
