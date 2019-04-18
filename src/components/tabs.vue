<template>
    <div class="tabs">
        <div v-for="(tab, index) in tabsArr" :key="index" @click="switchTab(tab.current)">
            <p :class="[current === tab.current ? 'active-tab' : 'invisible-tab', 'tab']">{{tab.title}}</p>
            <!-- <p ></p> -->
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            current: this.currentTab
        }
    },

    props: {
        tabsArr: Array,
        currentTab: String
    },

    onLoad() {
        this.current = this.tabsArr[0].current
    },

    methods: {
        switchTab(currentTab) {
            this.current = currentTab
            this.$emit('listenToChildEvent', currentTab)
        }
    }
}
</script>

<style lang="less" scoped>
    @import url('../theme.less');
    .tabs {
        display: flex;
        justify-content: space-around;
        color: @theme-grey;
        font-size: 16px;

        .tab {
            padding-bottom: 7px;
        }

        .active-tab {
            color: @theme-blue;
            border-bottom: 2px solid @theme-blue;
        }
    }
</style>
