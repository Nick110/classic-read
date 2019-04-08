<template>
    <div class="poetry-detail">
        <i-toast id="toast"/>
        <div class="poetry-content">
            <p class="title">{{poetry.name}}</p>
            <p class="author">{{'「'+ poet.dynasty + '」'}}<span>{{poet.name}}</span></p>
            <div class="content-wrapper">
                <text class="content">
                    {{poetry.content}}
                </text>
            </div>

            <i-spin custom fix size="large" v-if="loading">
                <view>加载中...</view>
            </i-spin>
        </div>
        <div class="translate">
            <!-- <i-tabs i-class="translate-tabs" :current="current" color="#00c25b" @change="handleChange">
                <i-tab key="translate" title="译注"></i-tab>
                <i-tab key="appreciate" title="赏析"></i-tab>
                <i-tab key="author" title="作者"></i-tab>
            </i-tabs> -->
            <Tabs :currentTab="currentTab" :tabsArr="tabsArr" @listenToChildEvent="switchTab"></Tabs>
            <div class="tab-content">
                <p v-if="current === 'translate'">
                    <text>
                        {{poetry.fanyi}}  
                    </text>
                </p>
                <p v-if="current === 'appreciate'">
                    <text>
                       {{poetry.shangxi}} 
                    </text>
                </p>
                <div class="author-tab" v-if="current === 'author'">
                    <p class="poet-title"><span>作者</span><span class="poet-more" @click="toPoet(poet.id)">更多<i-icon type="enter" size="18" /></span></p>
                    <p class="poet-desc">{{poet.desc}}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// 存储服务
var AV = require('leancloud-storage')
const { $Toast } = require("../../../static/iView/base/index")
import Tabs from '../../components/tabs'
export default {
    data() {
        return {
            verse: '',  // 诗句
            author: '',  // 作者
            poetry: {
                dynasty: ''
            },
            poet: {},
            current: 'translate',
            loading: true,
            tabsArr: [
                {
                    title: '译注',
                    current: 'translate'
                },
                {
                    title: '赏析',
                    current: 'appreciate'
                },
                {
                    title: '作者',
                    current: 'author'
                }
            ],
            currentTab: 'translate'
        }
    },

    components: {
        Tabs,
    },

    onLoad(option) {
        this.verse = option.verse
        this.author = option.author
        this.getOnePoetry(option.verse, option.author)
    },

    methods: {
       getOnePoetry(verse, author) {
            const poetryQuery = new AV.Query('LCPoetry')
            poetryQuery.startsWith('author', author)
            poetryQuery.contains('content', verse.slice(0, -1))
            poetryQuery.first().then(poetry => {
                if(poetry && poetry != undefined) {
                    console.log('poetry: ', poetry)
                    this.poetry = poetry.attributes
                    let poetQuery = new AV.Query('LCPoet')
                    poetQuery.get(poetry.attributes.poet.id).then(poet => {
                        console.log('poet: ', poet)
                        this.poet = poet.attributes
                        this.poet.id = poet.id
                    })
                } else {
                    $Toast({
                        content: "该诗句不存在！",
                        duration: 1,
                        type: "warning"
                    });
                }
            }).then(() => this.loading = false)
        },

        switchTab(tab) {
            this.current = tab
        },
        
        // handleChange (e) {
        //     this.current = e.target.key
        // },

        toPoet(id) {
            wx.navigateTo({
                url: `/pages/poet/main?id=${id}`
            })
        }
    }

    
}
</script>

<style lang="less" scoped>
    // 深度作用选择器：未为了修改iView组件自带的样式。https://blog.csdn.net/zqian1994/article/details/83899919
    @deep: ~'>>>';
    @import url('../../theme.less');
    .poetry-detail {
        .title, .author {
            text-align: center;
        }
        .title {
            font-size: 23px;
            margin-bottom: 8px;
            padding: 0 5px;
        }

        .author {
            color: rgb(116, 115, 119);
            font-size: 18px;
        }

        .poetry-content {
            padding: 23px;
        }

        .content-wrapper {
            display: flex;
            justify-content: center;
            margin-top: -12px;
            .content {
                text-indent: 2em;
                line-height: 28px;
            }
        }

        .translate {
            // @{deep} .translate-tabs {
            //     position: static;
            // }

            .tab-content {
                padding: 0 23px 10px 23px;
            }
            
            .author-tab {
                padding: 25px 0;

                .poet-title {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                    .poet-more {
                        color: @theme-green;
                    }
                }

                .poet-desc {
                    text-indent: 2em;
                }
            }
        }
    }
</style>
