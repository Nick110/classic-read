<template>
    <div class="poetry-detail">
        <i-toast id="toast"/>
        <div class="poetry-content">
            <p class="title">{{poetry.name}}</p>
            <p class="author">「{{poetry.dynasty}}」{{poet.name}}</p>
            <div class="content-wrapper">
                <text class="content">
                    {{poetry.content}}
                </text>
            </div>
        </div>
    </div>
</template>

<script>
// 存储服务
var AV = require('leancloud-storage')
const { $Toast } = require("../../../static/iView/base/index");
export default {

    data() {
        return {
            verse: '',  // 诗句
            author: '',  // 作者
            poetry: {},
            poet: {}
        }
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
                    console.log(poetry)
                    this.poetry = poetry.attributes
                    let poetQuery = new AV.Query('LCPoet')
                    poetQuery.get(poetry.attributes.poet.id).then(poet => {
                        this.poet = poet.attributes
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
    }

    
}
</script>

<style lang="less" scoped>
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
    }
</style>
