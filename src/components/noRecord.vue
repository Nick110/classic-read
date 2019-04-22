<template>
    <div class="no-record">
        <img class="no-record-img" src="../../static/img/no_record.png">
        <p class="no-record-title">暂无朗诵</p>
        <p class="no-record-title">闷发每吟诗引兴，兴来兼酌酒开颜。</p>
        <div class="record-wrapper" @click="record">
            <img class="record-img" src="../../static/img/record.png" alt="">
            <span class="record-text" @click="toRecite">去朗读</span>
        </div>
    </div>
</template>
<script>
export default {
  data() {
    return {};
  },

  props: {
    poetryId: String
  },

  methods: {
    toRecite() {
      wx.navigateTo({
        url: `/pages/recite/main?poetryId=${this.poetryId}`
      });
    }
  }
};
</script>

<style lang="less">
@import url("../theme.less");
.no-record {
  text-align: center;
  padding: 30px 0;
  .no-record-img {
    width: 104px;
    height: 90px;
    margin-bottom: 10px;
  }

  .no-record-title {
    color: #a7a7a7;
    line-height: 26px;
  }

  .record-wrapper {
    width: 110px;
    height: 35px;
    line-height: 35px;
    margin: 20px auto 0 auto;
    border: 1px solid @theme-blue;
    border-radius: 5px;
    .record-img {
      width: 23px;
      height: 23px;
      vertical-align: text-top;
    }

    .record-text {
      color: @theme-blue;
      font-size: 20px;
    }
  }
}
</style>
