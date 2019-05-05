<template>
    <div class="creation-detail">
        <van-toast id="van-toast" />
        <van-dialog id="van-dialog" />
        <div class="post">
            <div class="post-top">
                <div class="avatar">
                    <img class="avatar-img" :src="creation.user.avatarUrl">
                </div>
                <div class="publisher-name">{{creation.user.nickName}}</div>
                <div class="publish">发布</div>
            </div>
            <div class="post-title">{{creation.title}}</div>
            <div class="post-content">
                <text>{{creation.content}}</text>
            </div>
            <div class="post-img-wrapper" v-if="creation.image">
                <image class="post-img"
                    :src="creation.image"
                    @load="imageLoad"
                    :style="{width: image.width + 'px', height: image.height + 'px'}"/>
            </div>
            <div class="publish-time">
                <p class="date">{{creation.formatTime}}</p>
                <div>
                    <img v-if="currentUserPraised" @click="cancelPraise(creation.objectId)" class="operation-img" src="../../../static/img/praise_red.png">
                    <img v-else @click="praise(creation.objectId)" class="operation-img" src="../../../static/img/praise.png">
                    <span v-if="creation.praise > 0" class="praise-number" :class="currentUserPraised ? 'praised' : ''">{{creation.praise}}</span>
                    <button id="postShare"
                        open-type="share"
                        class="share-btn"
                        :data-userName="creation.user.nickName"
                        :data-id="creation.objectId">
                        <van-icon name="share" color="#8B8989" size="25px"></van-icon>
                    </button>
                </div>
                
            </div>
        </div>

        <div class="comment">
            <p class="comment-title">评论</p>
            <div class="comment-wrapper" v-if="commentsExisted">
                <div class="comment-item" v-for="comment in comments" :key="comment.objectId">
                    <img class="comment-avatar" :src="comment.user.avatarUrl">
                    <span class="comment-user">{{comment.user.nickName}}</span>
                    <span v-if="comment.replyUser"> 回复 </span>
                    <span v-if="comment.replyUser">{{comment.replyUser.nickName}}</span>
                    <span class="comment-user">：</span>

                    <div class="comment-content">
                        {{comment.content}}
                    </div>
                </div>
            </div>
            <no-data v-else name="暂无评论"></no-data>
        </div>

        <div class="publish-comment">
            <van-field v-if="replying"
                :value="replyContent"
                center
                :focus="replyFoucs"
                clearable
                :placeholder="placeholder"
                use-button-slot
                @change="replyChange"
                maxLength="140"
            >
                <van-button slot="button" size="small" type="primary" @click="addComment">发布</van-button>
            </van-field>

            <van-field v-else
                :value="commentContent"
                center
                :focus="isFocus"
                clearable
                placeholder="我也说几句"
                use-button-slot
                @change="commentChange"
                maxLength="140"
            >
                <van-button slot="button" size="small" type="primary" @click="addComment">发布</van-button>
            </van-field>
        </div>
    </div>
</template>

<script>
const AV = require("leancloud-storage");
import Dialog from '../../../static/vant/dialog/dialog';
import Toast from '../../../static/vant/toast/toast';
import NoData from '../../components/noData'
export default {
    data() {
        return {
            creation: {
                user: {}
            },
            currentUserPraised: false,
            image: {},
            comments: [],
            isFocus: false,
            placeholder: '回复',
            replying: false,
            replyUser: {},
            replyFoucs: false,
            commentContent: '',
            commentsExisted: true,
        }
    },

    components: {
        NoData
    },

    onLoad(option) {
        console.log('load');
        // this.isFocus = option.focus;
        this.getCreationDetail(option.creationId);
        this.getComments(option.creationId);
    },

    onShareAppMessage(res) {
         if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target);
            if(res.target.id == 'postShare') {
                return {
                    title: `${res.target.dataset.username}  创作了一首诗词，一起来看看吧`,
                    path: `/pages/creationDetail/main?creationId=${res.target.dataset.id}`
                }
            }
        }
    },

    methods: {
        getCreationDetail(id) {
            let that = this;
            const creationQuery = new AV.Query('LCCreation');
            const currentUser = AV.User.current();
            creationQuery.include('user');
            creationQuery.get(id).then(res => {
                that.creation = res.toJSON();
                that.creation.formatTime = res.toJSON().createdAt.replace('T', ' ').split('.')[0];
                wx.checkSession({
                    success: function() {
                        that.currentUserPraised = res.toJSON().praisedUsers.indexOf(currentUser.id) < 0 ? false : true;
                    },
                    fail: function() {
                        that.currentUserPraised = false;
                    }
                })
                
                console.log(res.toJSON());
            })
        },

        getComments(creationId) {
            let that = this;
            const commentQuery = new AV.Query('CreationComment');
            const creation = AV.Object.createWithoutData('creation', creationId);
            commentQuery.equalTo('creation', creation);
            commentQuery.descending('createdAt');
            commentQuery.include('user');
            commentQuery.include('replyUser');
            commentQuery.find().then(list => {
                if(list.length > 0) {
                    that.commentsExisted = true;
                    let arr = [];
                    for(let comment of list) {
                        let obj = comment.toJSON();
                        arr.push(obj)
                    }
                    that.comments = arr;
                } else {
                    that.commentsExisted = false;
                }
            }).catch(err => console.log(err));
        },

        addComment() {
            let that = this;
            wx.checkSession({
                success: function() {
                    if(that.commentContent) {
                        const currentUser = AV.User.current();
                        const creation = AV.Object.createWithoutData('LCCreation', that.creation.objectId);
                        const comment = new AV.Object('CreationComment');
                        comment.set('user', currentUser).set('creation', creation).set('content', that.commentContent);
                        comment.save().then(res => {
                            console.log('评论发表成功');
                            console.log(res.id);
                            that.commentContent = '';
                            that.getComments(that.creation.objectId);
                        }).catch(err => {
                            console.log('发表评论错误');
                            console.log(err);
                        });
                    } else {
                        Toast('请输入评论内容！');
                    } 
                },
                fail: function() {
                    Toast('需要登录才能发表评论哦~')
                }
            })
        },

         praise(creationId) {
            let that = this;
            wx.checkSession({
                success: function() {
                    that.currentUserPraised = true;
                    that.creation.praise++;
                    debugger;
                    const creationPraiseMap = new AV.Object("CreationPraiseMap");
                    const currentUser = AV.User.current();
                    const userId = currentUser.id;
                    const creation = AV.Object.createWithoutData("LCCreation", creationId);
                    creationPraiseMap.set('user', currentUser);
                    creationPraiseMap.set('creation', creation);
                    creationPraiseMap.save().then(res => {
                        console.log('点赞成功')
                        creation.addUnique('praisedUsers', [userId])
                        creation.save().then(function (post) {
                            creation.increment('praise', 1).save().then(() => {
                                console.log('新增一个点赞用户')
                                wx.setStorageSync('creationLogin', true);
                            });
                        }, function (error) {
                            // 异常处理
                            console.error(error);
                        });
                    })
                },
                fail: function() {
                    Dialog.confirm({
                        title: '登录',
                        message: '需要登录才能进行操作哦'
                    }).then(() => {
                        // on confirm
                        wx.setStorage({
                            key: 'creationLogin',
                            data: true,
                            success: function() {
                                wx.switchTab({
                                    url: '/pages/my/main'
                                })
                            },
                            fail: function() {
                                console.log('设置缓存失败');
                            }
                        })
                    }).catch(() => {
                        // on cancel
                    });
                }
            });
        },

        cancelPraise(creationId) {
            let that = this
            that.currentUserPraised = false;
            that.creation.praise--;
            debugger;
            const firstQuery = new AV.Query("CreationPraiseMap");
            const secondQuery = new AV.Query("CreationPraiseMap");
            const currentUser = AV.User.current();
            const creation = AV.Object.createWithoutData("LCCreation", creationId);
            firstQuery.equalTo('user', currentUser);
            secondQuery.equalTo('creation', creation);
            const query = AV.Query.and(firstQuery, secondQuery);
            query.first().then(res => {
                var praise = AV.Object.createWithoutData('CreationPraiseMap', res.id);
                praise.destroy().then(function() {
                    console.log('删除一条点赞成功')
                }, function(err) {
                    console.log(err)
                })
                creation.remove('praisedUsers', currentUser.id);
                creation.save().then(function(res) {
                    res.increment('praise', -1)
                    return res.save().then(() => {
                        console.log('取消点赞成功')
                        wx.setStorageSync('creationLogin', true);
                    }).catch(err => console.log(err))
                }, function(err){
                    console.log(err)
                })
            }).catch(err => console.log(err));
        },

        commentChange(e) {
            this.commentContent = e.mp.detail;
        },

        replyChange(e) {
            this.replyContent = e.mp.detail;
        },

        imageLoad(e) {
            // console.log(e.mp.detail.width)
            var width = e.mp.detail.width,    //获取图片真实宽度
                height = e.mp.detail.height,
                ratio = width / height;    //图片的真实宽高比例
            var viewWidth = width > 250 ? 250 : width,           //设置图片显示宽度
                viewHeight = viewWidth / ratio;    //计算的高度值
            //将图片的datadata-index作为image对象的key,然后存储图片的宽高值
            this.image = {
                width: viewWidth,
                height: viewHeight
            }
        },
    }
}
</script>

<style lang="less" scoped>
    @import url('../../theme.less');
    button::after {
        border: none;
    }

    button {
        display: inline-block;
        background: transparent;
        padding: 0;
        overflow: visible;
        line-height: normal;
        top: 3px;
    }
    .creation-detail {
        .post {
            padding: 10px 30px;
            margin-top: 10px;
            border-bottom: @list-border-bottom;
            position: relative;
        }
        .post-top {
            display: flex;
            align-items: flex-end;
            margin-bottom: 20px;
            .publisher-name {
                margin-left: 10px;
                font-size: 16px;
            }
            .publish {
                margin-left: 10px;
                font-size: 14px;
                color: @second-grey;
            }
        }

        .post-title {
            padding-left: 20px;
            font-size: 22px;
            margin-bottom: 10px;
        }

        .post-content {
            margin-bottom: 10px;
        }

        .post-img-wrapper {
            margin-bottom: 10px;
        }

        .avatar {
            width: 35px;
            height: 35px;
            border-radius: 5px;
            .avatar-img {
                width: 100%;
                height: 100%;
                border-radius: 5px;
            }
        }

        .publish-time {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .date {
                color: @second-grey;
                font-size: 16px;
            }

            .operation-img {
                width: 25px;
                height: 25px;
            }

            .share-btn {
                margin-left: 10px;
            }     
            
            .praise-number {
                display: inline-block;
                margin-left: 5px;
                color: #767676;
                position: relative;
                bottom: 4px;
            }

            .praised {
                color: #d81e06;
            }
        }

        .comment {
            padding: 10px 20px;
            .comment-title {
                color: @theme-blue;
                font-size: 20px;
                margin-bottom: 10px;
            }
        }

        .comment {
            min-height: 180px;
        }
        .comment-wrapper {
            margin-bottom: 50px;
            .comment-item {
                font-size: 16px;
                padding: 10px;
                padding-left: 0;
                border-bottom: 1rpx solid #dfdfdf;
                .comment-avatar {
                    width: 30px;
                    height: 30px;
                    vertical-align: middle;
                    border-radius: 5px;
                    margin-right: 10px;
                }

                .comment-user {
                    color: @second-grey;
                }
            }
            .comment-content {
                margin-top: 3px;
                margin-left: 40px;
                padding: 10px 0;
            }
        }

        .publish-comment {
            width: 100%;
            height: 50px;
            position: fixed;
            bottom: 0;
            left: 0;
            z-index: 3;
            background-color: @page-bg-grey;
        }
    }
</style>
