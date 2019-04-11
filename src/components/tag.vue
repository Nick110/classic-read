<template>
    <div class="tag-wrapper">
        <p class="title">{{'「 ' + title + ' 」'}}</p>
        <div class="content">
            <div class="set" v-for="(tag, index) in list" :key="index" @click="toTagDetail(tag.id)">
                <p class="tag-name">{{tag.name}}</p>
                <p class="tag-desc">{{tag.desc}}</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  props: {
    title: String,
    list: Array
  },

  methods: {
    toTagDetail(id) {
        wx.navigateTo({
            url: `/pages/tagDetail/main?id=${id}`
        })
    }
  }
};
</script>

<style lang="less" scoped>
@import url("../theme.less");
.tag-wrapper {
  .title {
    text-align: center;
    padding: 20px 0 30px 0;
    font-size: 24px;
  }

  .content {
    padding: 0 20px;
    display: flex;
    flex-wrap: wrap;
    .set {
      width: 138px;
      border-left: 3px solid #e2e2e2dc;
      margin-bottom: 15px;
      padding-left: 10px;
      .tag-name {
        font-size: 20px;
      }

      .tag-desc {
        color: @second-grey;
        font-size: 14px;
      }
    }

    .set:nth-child(odd) {
      margin-right: 30px;
    }
  }
}
</style>
