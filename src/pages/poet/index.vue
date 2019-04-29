<template>
    <div class="poet">
        <div class="desc-wrapper">
            <div class="poet-desc">
                <div class="avatar">
                    <img class="avatar-img" :src="poet.image ? poet.image : '/static/img/default_avatar.png'">
                </div>
                <div>
                    <p class="poet-name">{{poet.name}}
                        <span class="poet-dynasty">{{'[' + poet.dynasty + ']'}}</span>
                    </p>
                    <p class="poet-dynasty">
                        <span>{{'获得' + poet.star + '赞'}}</span><br/>
                        <span v-if="count">{{'创作' + count + '余首作品'}}</span>
                    </p>
                </div>
                <div class="poet-praise">
                    <van-icon v-if="liked" @click="cancelLike(poet.id)" size="60px" name="thumb-circle-o" color="#92130a"/>
                    <van-icon v-else @click="likePoet(poet.id)" size="60px" name="thumb-circle-o" color="#8B8989"/>
                </div>
            </div>

            <div class="desc-text">
                <van-icon size="18px" name="user-o" color="#2d5589"/>
                <span class="title-span">简介</span>
                <p class="desc-p">
                    {{poet.desc}}
                </p>
            </div>
        </div>

        <div class="hot">
            <p class="hot-title">
                <van-icon size="18px" name="fire-o" color="#92130a"/>
                <span class="title-span">经典作品</span>
            </p>
            <div class="hot-list-wrapper">
                <div class="hot-list" v-for="(poetry, index) in hotTen" :key="index" @click="toPoetry(poetry.id)">
                    <p class="hot-name">{{poetry.name}}</p>
                    <p class="hot-sentence">{{poetry.sentence}}</p>
                </div>
            </div>
            <div class="more" v-if="hotTen.length >= 10" @click="seeMore(poet.id)">
                查看更多>>
            </div>
        </div>
        <div class="poet-intro">
            <p class="intro-title">
                <van-icon size="18px" name="user-o" color="#104E8B"/>
                <span class="title-span">人物事迹</span>
            </p>
            <div class="intro-content">
                <text :class="['content-text', foldObj.fold && textLength > 300 ? 'fold-content-text' : '']" v-if="poet.content != ''">
                    {{poet.content}}
                </text>
                <no-data v-else></no-data>
                <p :class="['unfold', foldObj.fold ? 'padding-fold' : '']" v-if="poet.content != '' && textLength > 300" @click="unfold">{{foldObj.foldText}}&nbsp;<van-icon :name="foldObj.iconName"></van-icon></p>
            </div>
        </div>
    </div>
</template>

<script>
// 存储服务
var AV = require('leancloud-storage')
import NoData from '../../components/noData'
import {formatSentence} from '../../utils/index.js'
import Dialog from '../../../static/vant/dialog/dialog'

export default {
    data() {
        return {
            poet: {
                name: '',
                dynasty: ''
            },
            // 经典作品
            hotTen: [],
            count: 0,
            foldObj: {
                // 是否展开人物事迹
                fold: true,
                foldText: '展开全文',
                iconName: 'arrow-down'
            },
            textLength: '',
            // 点赞
            liked: false
        }
    },

    components: {
        NoData
    },

    onLoad(option) {
        this.foldObj = {
            // 是否展开人物事迹
            fold: true,
            foldText: '展开全文',
            iconName: 'arrow-down'
        }
        
        this.getPoetInfo(option.id)
        this.poetIsLiked(option.id)
        this.getHotPoetry(option.id)
    },

    methods: {
        // 获取元素高度
        getDomHeight(className) {
            var query = wx.createSelectorQuery()
            query.select(className).boundingClientRect(function (rect) {
                console.log(rect.height)
                this.textHeight = rect.height
            }).exec()
        },

        getPoetInfo(id) {
            const poetQuery = new AV.Query('LCPoet')
            poetQuery.get(id).then(poet => {
                // console.log(poet.toJSON())
                this.poet = poet.toJSON()
                this.poet.content = poet.attributes.content ? poet.attributes.content.slice(0, -1) : ''
                this.poet.id = poet.toJSON().objectId
                wx.setNavigationBarTitle({
                    title: poet.attributes.name
                })
                this.textLength = this.poet.content.length || 0
            }).catch(err => {
                console.log(err)
            })
        },

        getHotPoetry(id) {
            const poetryQuery = new AV.Query('LCPoetry')
            var poet = AV.Object.createWithoutData('LCPoet', id);
            poetryQuery.equalTo('poet', poet)
            poetryQuery.count().then(count => {
                // console.log(count)
                this.count = count
            }).catch(err => {
                console.log(err)
            })
            poetryQuery.addDescending('star')
            poetryQuery.limit(10)
            poetryQuery.select(['name', 'content'])
            poetryQuery.find().then(poetry => {
                let tempArr = []
                for(var item of poetry) {
                    let itemObj = {
                        id: item.id,
                        name: item.attributes.name,
                        sentence: formatSentence(item.attributes.content)
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
        },

        seeMore(poetId) {
            wx.navigateTo({
                url: `/pages/allPoetryOfPoet/main?poetId=${poetId}`
            })
        },

        unfold() {
            // 已折叠
            if(this.foldObj.fold) {
                this.foldObj = {
                    fold: false,
                    foldText: '收起',
                    iconName: 'arrow-up'
                }
            } else {
                this.foldObj = {
                    fold: true,
                    foldText: '展开全文',
                    iconName: 'arrow-down'
                }
            }
        },

        // 当前诗人是否已被点赞
        poetIsLiked(poetId) {
            let that = this;
            that.liked = false;
            wx.checkSession({
                success: function() {
                    const currentUser = AV.User.current();
                    const firstQuery = new AV.Query('PoetLikeMap');
                    firstQuery.equalTo('user', currentUser);
                    const secondQuery = new AV.Query('PoetLikeMap');
                    const currentPoet = AV.Object.createWithoutData('LCPoet', poetId);
                    secondQuery.equalTo('poet', currentPoet);
                    const query = AV.Query.and(firstQuery, secondQuery);
                    query.find().then((res) => {
                        if(res.length > 0) {
                            that.liked = true
                        }
                    }).catch(err => console.log(err))
                }, 
                fail: function() {
                    that.liked = false
                }
            })
        },

        likePoet(poetId) {
            let that = this
            wx.checkSession({
                success: function() {
                    const currentPoet = AV.Object.createWithoutData('LCPoet', poetId);
                    const currentUser = AV.User.current();
                    const poetLikeMap = new AV.Object('PoetLikeMap');
                    poetLikeMap.set('user', currentUser);
                    poetLikeMap.set('poet', currentPoet);
                    poetLikeMap.save().then(res => {
                        console.log('点赞诗人成功')
                        that.liked = true;
                        currentPoet.increment('star', 1).save().then(() => {
                            that.poet.star++;
                            console.log('诗人star + 1')
                        });
                    }).catch(err => console.log(err))
                },
                fail: function() {
                    Dialog.confirm({
                        title: '登录',
                        message: '需要登录才能进行操作哦'
                    }).then(() => {
                        // on confirm
                        wx.switchTab({
                            url: '/pages/my/main'
                        })
                    }).catch(() => {
                        // on cancel
                    });
                }
            })
        },

        cancelLike(poetId) {
            let that = this;
            const currentUser = AV.User.current();
            const firstQuery = new AV.Query('PoetLikeMap');
            firstQuery.equalTo('user', currentUser);
            const secondQuery = new AV.Query('PoetLikeMap');
            const currentPoet = AV.Object.createWithoutData('LCPoet', poetId);
            secondQuery.equalTo('poet', currentPoet);
            const query = AV.Query.and(firstQuery, secondQuery);
            query.first().then(res => {
                res.destroy().then(() => {
                    console.log('取消点赞成功');
                    that.liked = false;
                    currentPoet.increment('star', -1).save().then(() => {
                        console.log('诗人star - 1')
                        that.poet.star--;
                    })
                }).catch(err => console.log(err));
            })
        }
    }
}
</script>

<style lang="less" scoped>
    @deep: ~'>>>';
    @import url('../../theme.less');
    .poet {
        padding: 15px 0;
        background-color: #f0eff4ab;

        .desc-wrapper {
            width: 350px;
            padding: 20px;
            box-sizing: border-box;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 2px 2px 2px 2px #ebebeb;
        }

        .poet-desc {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            .avatar {
                width: 60px;
                height: 90px;
                .avatar-img {
                    width: 60px;
                    height: 90px;
                    border-radius: 6px;
                }
            }

            .poet-name {
                font-size: 26px;
            }

            .poet-dynasty {
                font-size: 14px;
                color: @second-grey;
            }
        }

        .desc-text {
            .title-span {
                font-size: 18px;
                color: #2d5589;
                display: inline-block;
                margin-bottom: 10px;
                margin-left: 10px;
            }

            .desc-p {
                font-size: 14px;
                text-indent: 2em;
            }
        }

        .poet-intro {
            margin: 0 16px;
            font-size: 14px;
            overflow: hidden;
            position: relative;
            // background: #fff;
            // border: 1rpx solid #dddee1;
            // border-radius: 5px;
            margin-bottom: 15px;
            .intro-title {
                // padding: 10px 16px;
                font-size: 18px;
                // border-bottom: 1rpx solid #dddee1;
                .title-span {
                    font-size: 18px;
                    display: inline-block;
                    margin-bottom: 10px;
                    margin-left: 10px;
                    color: @link-blue;
                }
            }

            .intro-content {
                // padding: 10px 16px;
                color: rgb(85, 89, 104);
                .fold-content-text {
                    display: block;
                    height: 200px;
                    overflow-y: hidden;
                }
            }

            .unfold {
                text-align: center;
                color: @link-blue;
            }

            .padding-fold {
                margin-top: 20px;
            }
        }

        .hot {
            font-size: 14px;
            padding: 16px;
            padding-right: 0;
            margin-bottom: 10px;
            .hot-title {
                .title-span {
                    .desc-text > .title-span;
                    color: #92130a;
                }
            }
            .hot-list-wrapper {
                .hot-list {
                    height: 46px;
                    padding: 8px 0;
                    border-bottom: 1rpx solid @border-grey;
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

            .more {
                text-align: center;
                margin-top: 10px;
                color: 	#3A5FCD;
            }
        }   
    }
</style>
