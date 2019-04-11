<template>
    <div class="poetry-detail">
        <i-toast id="toast"/>
        <div class="poetry-content">
            <p class="title">{{poetry.name}}</p>
            <p class="author" v-if="!poetNotFound">{{'「'+ poet.dynasty + '」'}}<span>{{poet.name}}</span></p>
            <div class="content-wrapper">
                <text class="content">
                    {{poetry.content}}
                </text>
            </div>
            <!-- <i-spin i-class="loading" custom fix size="large" v-if="loading">
                <i-icon type="refresh" size="30" i-class="icon-load"></i-icon>
                <view class="loading-view">加载中...</view>
            </i-spin> -->
            <div class="load-more-wrapper" v-if="loading">
                <i-load-more i-class="load-more"/>
            </div>
        </div>
        <div class="translate">
            <Tabs :currentTab="current" :tabsArr="tabsArr" @listenToChildEvent="switchTab"></Tabs>
            <div class="tab-content">
                <p v-if="current === 'translate'">
                    <text v-if="poetry.fanyi">
                        {{poetry.fanyi}}
                    </text>
                    <no-data v-else name="暂无译注"></no-data>
                </p>
                <p v-if="current === 'appreciate'">
                    <text v-if="poetry.shangxi">
                       {{poetry.shangxi}} 
                    </text>
                    <no-data v-else name="暂无赏析"></no-data>
                </p>
                <p v-if="current === 'about'">
                    <text v-if="poetry.about">
                        {{poetry.about}}
                    </text>
                    <no-data v-else name="暂无背景"></no-data>
                </p>
                <div class="author-tab" v-if="current === 'author'">
                    <p class="poet-title" v-if="!poetNotFound"><span>作者</span><span class="poet-more" @click="toPoet(poet.id)">更多<i-icon type="enter" size="18" /></span></p>
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
import NoData from '../../components/noData'
export default {
    data() {
        return {
            verse: '',  // 诗句
            author: '',  // 作者
            poetry: {},
            poet: {
                name: '',
                dynasty: ''
            },
            current: 'translate',
            loading: true,
            poetNotFound: false,
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
                    title: '背景',
                    current: 'about'
                },
                {
                    title: '作者',
                    current: 'author'
                }
            ],
        }
    },

    components: {
        Tabs,
        NoData
    },

    onLoad(option) {
        if(option.id) {
            this.getOnePoetryById(option.id)
        } else {
            this.getOnePoetry(option.verse, option.author)
        }
        this.current = 'translate'
    },

    methods: {
        getOnePoetryById(id) {
            const poetryQuery = new AV.Query('LCPoetry')
            poetryQuery.get(id).then(poetry => {
                if(poetry && poetry != undefined) {
                    console.log('poetry: ', poetry)
                    this.poetry = poetry.attributes
                    this.poetry.shangxi = poetry.attributes.shangxi.replace(/(赏析|鉴赏|评析|简析|其)[一|二|三]?\n\n/g, '赏析\n')
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
            })
        },

        getOnePoetry(verse, author) {
            this.loading = true
            const poetryQuery = new AV.Query('LCPoetry')
            poetryQuery.startsWith('author', author)
            poetryQuery.contains('content', verse.slice(0, -1))
            poetryQuery.addDescending('star')
            poetryQuery.first().then(poetry => {
                if(poetry && poetry != undefined) {
                    console.log('poetry: ', poetry)
                    this.poetry = poetry.attributes
                    this.poetry.shangxi = poetry.attributes.shangxi.replace(/(赏析|鉴赏|评析)[一|二|三]?\n\n/g, '赏析\n')
                    this.poetry.about = poetry.attributes.about.replace(/创作背景?\n\n/g, '创作背景\n')
                    // 如果诗人存在
                    if(poetry.attributes.poet.id) {
                        let poetQuery = new AV.Query('LCPoet')
                        poetQuery.get(poetry.attributes.poet.id).then(poet => {
                            console.log('poet: ', poet)
                            this.poet = poet.attributes
                            this.poet.id = poet.id
                        })
                    } else {
                        this.poetNotFound = true
                    }
                    this.loading = false 
                } else {
                    $Toast({
                        content: "该诗句不存在！",
                        duration: 1,
                        type: "warning"
                    });
                }
            })
        },

        switchTab(tab) {
            this.current = tab
        },
        
        // handleChange (e) {
        //     this.current = e.target.key
        // },

        toPoet(id) {
            wx.redirectTo({
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
                font-size: 20px;
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
                    // margin-bottom: 15px;
                    .poet-more {
                        color: @theme-green;
                    }
                }

                .poet-desc {
                    text-indent: 2em;
                }
            }
        }

        .load-more-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 8;
            background-color: #ffffff;
            padding-top: 50%;
        }
    }
</style>
