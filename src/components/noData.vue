<template>
    <div class="no-data">
        <img class="no-data-img" src="../../static/img/no_data_grey.png">
        <p class="text">{{name || '暂无数据'}}</p>
    </div>
</template>

<script>
export default {
    props: {
        name: String
    }
}
</script>

<style lang="less" scoped>
    .no-data {
        text-align: center;
        padding: 30px 0;
        min-height: 100px;
        .no-data-img {
            width: 98px;
            height: 64px;
        }
        .text {
            color: #767676;
            font-family: 'Microsoft YaHei';
            font-size: 14px;
        }
    }
</style>
