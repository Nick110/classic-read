<template>
    <div class="creation">
        <div class="new">
            <img class="create-img" src="../../../static/img/quill_pen.png" @click="openEditor">
        </div>
        <van-popup :show="popupShow"
            custom-style="width: 100%; height:100%;"
            position="right"
            @close="onClose"
        >
            <div class="edit-top">
                <van-icon name="cross" size="24px" color="#767676" @click="onClose"></van-icon>
                <p class="submit">提交</p>
            </div>
        </van-popup>
    </div>
</template>

<script>
export default {
    data() {
        return {
            popupShow: false
        }
    },

    methods: {
        onClose() {
            this.popupShow = false;
        },
        openEditor() {
            this.popupShow = true;
        }
    }
}
</script>

<style lang="less" scoped>
    @import url('../../theme.less');
    .creation {
        
        .new {
            width: 100%;
            position: fixed;
            bottom: 0;
            left: 0;
            text-align: center;
            .create-img {
                width: 40px;
                height: 40px;
            }
        }

        .edit-top {
            padding: 8px 13px;
            display: flex;
            justify-content: space-between;
            .submit {
                color: @link-blue;
            }
        }
    }
</style>
