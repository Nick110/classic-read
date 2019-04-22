<template>
    <div class="poetry-detail">
        <van-toast id="van-toast" />
        <div class="poetry-content">
            <p class="title">{{poetry.name}}</p>
            <p class="author">{{'「'+ poetry.dynasty + '」'}}<span v-if="poet.desc">{{poet.name}}</span></p>
            <div class="content-wrapper">
                <text class="content">
                    {{poetry.content}}
                </text>
            </div>
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
                <p class="about-tab" v-if="current === 'about'">
                    <text v-if="poetry.about">
                        {{poetry.about}}
                    </text>
                    <no-data v-else name="暂无背景"></no-data>
                </p>
                <!-- 朗诵 -->
                <div class="recite-tab" v-if="current === 'recite'">
                    <div class="record-play">
                        <div class="record-wrapper" @click="playRecord('wxfile://tmp_d6cbbb9706dba3a3b4993f7c7dad0e95.mp3')">
                            <van-icon name="volume-o" color="#2d5589"></van-icon>
                        </div>
                    </div>
                    <no-record :poetryId="poetry.objectId"></no-record>
                </div>
                <div class="author-tab" v-if="current === 'author'">
                    <div v-if="poet.desc">
                        <p class="poet-title">
                            <span>作者</span>
                            <span class="poet-more" @click="toPoet(poet.id)">
                                更多<van-icon name="arrow" custom-style="position: relative; top: 5rpx;"/>
                            </span>
                        </p>
                        <p class="poet-desc">{{poet.desc}}</p>
                    </div>
                    <no-data v-else name="暂无作者信息"></no-data>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// 存储服务
var AV = require('leancloud-storage')
import Toast from '../../../static/vant/toast/toast'
import Tabs from '../../components/tabs'
import NoData from '../../components/noData'
import noRecord from '../../components/noRecord'
const innerAudioContext = wx.createInnerAudioContext()

export default {
    data() {
        return {
            verse: '',  // 诗句
            author: '',  // 作者
            poetry: {},
            poet: {},
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
                    title: '朗诵',
                    current: 'recite'
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
        NoData,
        noRecord
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
            this.loading = true
            const poetryQuery = new AV.Query('LCPoetry')
            poetryQuery.get(id).then(poetry => {
                if(poetry && poetry != undefined) {
                    console.log('poetry: ', poetry)
                    this.poetry = poetry.toJSON()
                    this.poetry.shangxi = poetry.attributes.shangxi ? poetry.attributes.shangxi.replace(/(赏析|鉴赏|评析|简析|其)[一|二|三]?\n\n/g, '赏析\n') : ''
                    this.poetry.about = poetry.attributes.about && poetry.attributes.about.replace(/背景?\n\n/g, '背景\n')
                    // 如果诗人存在
                    if(poetry.attributes.poet) {
                        let poetQuery = new AV.Query('LCPoet')
                        poetQuery.get(poetry.attributes.poet.id).then(poet => {
                            console.log('poet: ', poet)
                            this.poet = poet.attributes
                            this.poet.id = poet.id
                        })
                    } else {
                        this.poet = {}
                    }
                    this.loading = false 
                } else {
                    Toast.fail('该诗句不存在');
                }
            }).catch(err => {
                console.log(err)
            })
        },

        getOnePoetry(verse, author) {
            this.loading = true
            const poetryQuery = new AV.Query('LCPoetry')
            poetryQuery.startsWith('author', author)
            poetryQuery.contains('content', verse)
            poetryQuery.addDescending('star')
            poetryQuery.first().then(poetry => {
                if(poetry && poetry != undefined) {
                    console.log('poetry: ', poetry)
                    this.poetry = poetry.toJSON()
                    this.poetry.shangxi = poetry.attributes.shangxi && poetry.attributes.shangxi.replace(/(赏析|鉴赏|评析)[一|二|三]?\n\n/g, '赏析\n')
                    this.poetry.about = poetry.attributes.about && poetry.attributes.about.replace(/背景?\n\n/g, '背景\n')
                    // 如果诗人存在
                    if(poetry.attributes.poet) {
                        let poetQuery = new AV.Query('LCPoet')
                        poetQuery.get(poetry.attributes.poet.id).then(poet => {
                            console.log('poet: ', poet)
                            this.poet = poet.attributes
                            this.poet.id = poet.id
                        })
                    } else {
                        this.poet = {}
                    }
                    this.loading = false 
                } else {
                    Toast.fail('该诗句不存在');
                }
            }).catch(err => {
                console.log(err)
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
        },

        playRecord(src) {
            innerAudioContext.src = src;
            innerAudioContext.play()
            innerAudioContext.onPlay(() => {
                console.log("开始播放");
            });
            innerAudioContext.onEnded(() => {
                console.log("播放结束");
            })
            innerAudioContext.onError((res) => {
                console.log(res);
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
            
            .about-tab {
                padding-bottom: 25px;
            }

            .author-tab {
                padding: 25px 0;

                .poet-title {
                    display: flex;
                    justify-content: space-between;
                    // margin-bottom: 15px;
                    .poet-more {
                        color: @theme-blue;
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

        .record-play {
            padding: 0 20px 20px 20px;
            color: @theme-blue;
            .popup-top {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                height: 40px;
                font-size: 18px;
                .cancel {
                color: @second-grey;
                }
            }
        }

        .record-wrapper {
            width: 110px;
            height: 35px;
            padding-left: 15px;
            padding-top: 7px;
            border-radius: 20px;
            border: 1rpx solid @theme-blue;
            box-sizing: border-box;
        }
    }
</style>
