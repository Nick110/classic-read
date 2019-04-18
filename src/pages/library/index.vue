<template>
    <div class="library">
        <div class="top-wrapper">
            <van-search :value="searchValue" placeholder="搜索诗词、作者" shape="round" />
            <i-tabs :current="current" color="#2d5589" @change="handleChange">
                <i-tab key="type" title="分类"></i-tab>
                <i-tab key="author" title="作者"></i-tab>
            </i-tabs>
        </div>
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
        <div class="tags-wrapper" v-if="current==='type'">
            <Tag title="选集" :list="anthologyList"></Tag>
            <Tag title="教材" :list="textbookList"></Tag>
            <Tag title="主题" :list="themeList"></Tag>
            <Tag title="写景" :list="sceneryList"></Tag>
            <Tag title="节日" :list="festivalList"></Tag>
        </div>

        <div class="author-wrapper" v-else>
            <div class="author-item" v-for="(poet, index) in famousPoetList" :key=index @click="toPoet(poet.id)">
                <img :src="poet.image" class="poet-img">
                <p class="poet-name">{{poet.name}}</p>
                <van-icon size="30px" name="thumb-circle-o" color="#92130a" :info="poet.star"/>
            </div>
            <p class="no-more" v-show="isBottom">——当前显示最著名的100位诗人，使用最上方的搜索吧——</p>
        </div>
        
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
            festivalList: [],
            searchValue: '',
            famousPoetList: [],
            isBottom: false
        }
    },

    components: {
        Tag
    },

    onLoad() {
        this.current = 'type'
        this.isBottom = false
        this.getTags('选集', 'anthologyList')
        this.getTags('教材', 'textbookList')
        this.getTags('主题', 'themeList')
        this.getTags('写景', 'sceneryList')
        this.getTags('节日', 'festivalList')
        this.getFamousPoetList()
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

        getFamousPoetList() {
            const poetQuery = new AV.Query('LCPoet')
            poetQuery.addDescending('star')
            poetQuery.find().then(poetList => {
                let arr = []
                poetList.forEach(item => {
                    let obj = {
                        name: item.attributes.name,
                        star: item.attributes.star,
                        image: item.attributes.image ? item.attributes.image : "/static/img/default_avatar.png",
                        id: item.id
                    }
                    arr.push(obj)
                })
                this.famousPoetList = arr
                this.isBottom = true
                console.log(this.famousPoetList)
            }).catch(err => {
                console.log(err)
            })
        },

        toPoet(id) {
            wx.navigateTo({
                url: `/pages/poet/main?id=${id}`
            })
        }
    }
}
</script>

<style lang="less" scoped>
    @import url('../../theme.less');
    @deep: ~'>>>';
    .library {
        padding-bottom: 10px;
        .top-wrapper {
            width: 100%;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 9;
            box-shadow: 0 2px 2px #d8d8d8;
        }
        .author-wrapper, .tags-wrapper {
            margin-top: 96px;
        }
        .author-wrapper {
            display: flex;
            flex-wrap: wrap;
            padding: 20px;
            padding-bottom: 5px;
            .author-item {
                width: 82px;
                text-align: center;
                padding-bottom: 10px;
                .poet-name {
                    font-size: 14px;
                    margin-bottom: 5px;
                }
            }
            .poet-img {
                width: 62px;
                height: 90px;
            }

            .no-more {
                width: 100%;
                text-align: center;
                font-size: 12px;
                color: @second-grey;
            }
        }
    }
</style>
