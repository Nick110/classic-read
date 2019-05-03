<template>
    <div class="creation">
        <van-notify id="custom-selector" />
        <van-toast id="van-toast" />
        <van-dialog id="van-dialog" />
        <div class="posts-wrapper">
            <div class="post" v-for="(post, index) in posts" :key="post.objectId">
                <div @click="toDetail(post.objectId)">
                    <div class="post-top">
                        <div class="avatar">
                            <img class="avatar-img" :src="post.user.avatarUrl">
                        </div>
                        <div class="publisher-name">{{post.user.nickName}}</div>
                        <div class="publish">发布</div>
                    </div>
                    <div class="post-title">{{post.title}}</div>
                    <div class="post-content">
                        <text>{{post.content}}</text>
                    </div>
                    <div class="post-img-wrapper" v-if="post.image">
                        <image class="post-img"
                            :src="post.image"
                            @load="imageLoad"
                            mode="widthFix"
                            :style="{width: image.width + 'px', height: image.height + 'px'}"/>
                    </div>
                </div>
                <div class="publish-time">
                    <p class="date">{{post.formatTime}}</p>
                    <div class="operation">
                        <img v-if="post.currentUserPraised" @click="cancelPraise(post.objectId, index)" class="operation-img" src="../../../static/img/praise_red.png">
                        <img v-else @click="praise(post.objectId, index)" class="operation-img" src="../../../static/img/praise.png">
                        <span class="praise-number" :class="post.currentUserPraised ? 'praised' : ''">{{post.praise}}</span>
                        <img class="operation-img" src="../../../static/img/comment.png" style="margin-right: 15px;" @click="toDetail(post.objectId, true)">
                        <button id="postShare"
                            open-type="share"
                            class="share-btn"
                            :data-userName="post.user.nickName"
                            :data-id="post.objectId">
                            <van-icon name="share" color="#8B8989" size="21px"></van-icon>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="new">
            <img class="create-img" src="../../../static/img/quill_pen.png" @click="openEditor">
        </div>
        <van-popup :show="popupShow"
            custom-style="width: 100%; height:100%;"
            position="right"
            @close="onClose"
        >
            <div class="edit-top">
                <van-icon name="cross" size="24px" color="#ffffff" @click="onClose"></van-icon>
                <p class="submit" @click="submit">提交</p>
            </div>

            <div class="edit-wrapper">
                <van-field
                    :value="title"
                    placeholder="标题"
                    :border="false"
                    @change="titleChange"
                    clearable
                    maxlength="14"
                />
                <div class="content-wrapper">
                    <textarea
                        :value="content"
                        class="content-textarea"
                        placeholder="内容"
                        :border="false"
                        @change="contentChange"
                        size="large"
                        autosize
                        maxlength="140"
                        fixed="true"
                        placeholder-style="color: #767676; font-size: 14px;"
                    />
                </div>

                <div v-if="imgChoosen" class="img-choosen" @click="chooseImg">
                    <image :src="imgSrc"
                        @load="imageLoad"
                        :style="{width: image.width + 'px', height: image.height + 'px'}" />
                </div>
                <div v-else class="upload-img" @click="chooseImg">
                    <van-icon name="plus" size="30px" color="#767676"></van-icon>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<script>
const AV = require("leancloud-storage");
import Dialog from '../../../static/vant/dialog/dialog';
import Notify from '../../../static/vant/notify/notify';
import Toast from '../../../static/vant/toast/toast';
export default {
    data() {
        return {
            loginStatus: false,
            popupShow: false,
            title: '',
            content: '',
            contentFocus: false,
            imgSrc: '',
            imgChoosen: false,
            image: {},
            posts: [],
            pageSize: 30,
        }
    },

    onLoad() {
        this.getPosts();
    },

    onShow() {
        const creationLogin = wx.getStorageSync('creationLogin');
        if(creationLogin) {
            this.getPosts();
            wx.setStorageSync('creationLogin', false);
        }
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
        onClose() {
            this.popupShow = false;
        },

        getPosts() {
            let that = this;
            const query = new AV.Query('LCCreation');
            query.limit(that.pageSize);
            query.include('user');
            query.descending('createdAt');
            query.find().then(list => {
                let arr = [];
                for(let post of list) {
                    let obj = post.toJSON();
                    obj.formatTime = post.toJSON().createdAt.split('T')[0];
                    if(post.toJSON().praisedUsers) {
                        wx.checkSession({
                            success: function() {
                                const currentUser = AV.User.current();
                                obj.currentUserPraised = post.toJSON().praisedUsers.indexOf(currentUser.id) < 0 ? false : true
                            },
                            fail: function() {
                                obj.currentUserPraised = false;
                            },
                            complete: function() {
                                arr.push(obj);
                            }
                        })
                    } else {
                        obj.currentUserPraised = false;
                        arr.push(obj);
                    }
                }
                that.posts = arr;
                console.log(that.posts);
            }).catch(err => console.log(err));
        },

        praise(postId, index) {
            let that = this;
            wx.checkSession({
                success: function() {
                    that.posts[index].currentUserPraised = true;
                    that.posts[index].praise++;
                    const creationPraiseMap = new AV.Object("CreationPraiseMap");
                    const currentUser = AV.User.current();
                    const userId = currentUser.id;
                    const post = AV.Object.createWithoutData("LCCreation", postId);
                    creationPraiseMap.set('user', currentUser);
                    creationPraiseMap.set('creation', post);
                    creationPraiseMap.save().then(res => {
                        console.log('点赞成功')
                        post.addUnique('praisedUsers', [userId])
                        post.save().then(function (post) {
                            post.increment('praise', 1).save().then(() => console.log('新增一个点赞用户'));
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

        cancelPraise(postId, index) {
            let that = this
            that.posts[index].currentUserPraised = false;
            that.posts[index].praise--;
            const firstQuery = new AV.Query("CreationPraiseMap");
            const secondQuery = new AV.Query("CreationPraiseMap");
            const currentUser = AV.User.current();
            const creation = AV.Object.createWithoutData("LCCreation", postId);
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
                    return res.save().then(() => console.log('取消点赞成功')).catch(err => console.log(err))
                }, function(err){
                    console.log(err)
                })
            }).catch(err => console.log(err));
        },

        openEditor() {
            let that = this
            wx.checkSession({
                success: function() {
                    that.popupShow = true;
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

        titleChange(e) {
            this.title = e.mp.detail;
        },

        contentChange(e) {
            this.content = e.mp.detail.value;
        },

        chooseImg() {
            let that = this
            wx.chooseImage({
                count: 1,
                sizeType: ['original', 'compressed'],
                sourceType: ['album', 'camera'],
                success(res) {
                    // 如果图片太大
                    if(res.tempFiles[0].size > 1048576) {
                        Notify({
                            text: '图片最大为1MB',
                            duration: 1000,
                            selector: '#custom-selector',
                            backgroundColor: '#FF0000'
                        })
                        return false;
                    }
                    // tempFilePath可以作为img标签的src属性显示图片
                    console.log(res)
                    that.imgSrc = res.tempFilePaths[0];
                    that.imgChoosen = true;
                },
                fail(res) {
                    console.log('未选择图片');
                }
            })
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

        // 判断帖子是否有图
        imgExisted() {
            let that = this;
            const currentUser = AV.User.current().toJSON();
            // 如果该贴有图片
            if(that.imgSrc) {
                return new AV.File(`${that.title}-${currentUser.nickName}`, {
                    blob: {
                        uri: that.imgSrc,
                    },
                }).save().then(file => {
                    console.log(file.url());
                    return file.url();
                }).catch(console.error);
            } else {
                return new Promise((resolve, reject) => {
                    resolve(false);
                });
            }
        },

        submit() {
            let that = this;
            if(!that.title) {
                Toast('请输入标题！');
            } else if(!that.content) {
                Toast('请输入创作内容！');
            } else {
                that.imgExisted().then(res => {
                    const currentUser = AV.User.current().toJSON();
                    const creation = new AV.Object('LCCreation');
                    if(res) {
                        creation.set('image', res);
                    }
                    creation.set('title', that.title);
                    creation.set('content', that.content);
                    creation.set('user', currentUser);
                    creation.save().then(res => {
                        Notify({
                            text: "提交成功",
                            duration: 1000,
                            selector: "#custom-selector",
                            backgroundColor: "#1989fa"
                        });
                        // 清空表单
                        that.title = '';
                        that.content = '';
                        that.imgChoosen = false;
                        that.imgSrc = '';
                        that.image = {};
                        // 返回帖子页
                        that.popupShow = false;
                        that.getPosts();
                    }).catch(error => {
                        console.error(error);
                        Notify({
                            text: "提交错误",
                            duration: 1000,
                            selector: "#custom-selector",
                            backgroundColor: "#FF0000"
                        });
                    });
                })
            }
        },

        toDetail(id, focus = false) {
            wx.navigateTo({
                url: `/pages/creationDetail/main?creationId=${id}&focus=${focus}`
            })
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
    .creation {
        .posts-wrapper {
            margin: 20px 0;
            .post {
                padding: 10px 30px;
                border-bottom: 5px solid #ddddddee;
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
        }
        .new {
            width: 40px;
            height: 40px;
            position: fixed;
            bottom: 5px;
            left: 50%;
            transform: translate(-50%, 0);
            border: 1px solid @theme-blue;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #ffffff;
            .create-img {
                width: 70%;
                height: 70%;
            }
        }

        .edit-top {
            width: 100%;
            height: 40px;
            padding: 0 13px;
            box-sizing: border-box;
            position: fixed;
            top: 0;
            left: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid @border-grey;
            background-color: @theme-blue;
            .submit {
                color: #ffffff;
            }
        }

        .edit-wrapper {
            margin-top: 40px;
        }

        .content-wrapper {
            height: 200px;
            border-top: 1px solid @border-grey;
            .content-textarea {
                padding: 10px 13px;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
            }
        }

        .publish-time {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            .date {
                color: @second-grey;
                font-size: 16px;
            }
        }

        .upload-img {
            width: 100px;
            height: 100px;
            line-height: 110px;
            text-align: center;
            border: 1rpx dashed #767676;
            margin-left: 30px;
        }

        .img-choosen {
            max-width: 150px;
            height: auto;
            // line-height: 100px;
            text-align: center;
            margin-left: 30px;
            margin-bottom: 10px;
        }

        .operation-img {
            width: 20px;
            height: 20px;
        }

        .praise-number {
            display: inline-block;
            margin-left: 5px;
            margin-right: 15px;
            color: #767676;
            position: relative;
            bottom: 3px;
        }

        .praised {
            color: #d81e06;
        }
    }
</style>
