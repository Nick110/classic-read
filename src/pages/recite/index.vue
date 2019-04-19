<template>
    <div class="recite">
        <movable-area style="height: 600px; width: 375px; background: red;">
            <movable-view
                v-if="cardOneVisible"
                class="top-z"
                style="height: 200px; width: 100px; background: blue;"
                :x="x"
                :y="y"
                inertia="true"
                direction="all"
                @change="onChangeOne"
                out-of-bounds="true"
                friction="10"
            >
            <div>
                11111
            </div>
            </movable-view>
            <movable-view
                v-if="cardTwoVisible"
                style="height: 200px; width: 100px; background: grey;"
                :x="x2"
                :y="y2"
                inertia="true"
                direction="all"
                @change="onChangeTwo"
            >
            <div>
                222
            </div>
            </movable-view>
        </movable-area>
    </div>
</template>

<script>
export default {
    data() {
        return {
            x: 100,
            y: 50,
            x2: 100,
            y2: 55,
            cardOneVisible: true,
            cardTwoVisible: true
        }
    },

    methods: {
        onChangeOne(e) {
            const that = this
            // this.$mp.page.setData({
            //     x: 100,
            //     y: 55
            // })
            console.log(e.mp.detail)
            if(e.mp.detail.source === 'out-of-bounds') {
                console.log('超出范围')
                // this.cardOneVisible = false
                setTimeout(function() {
                    that.$mp.page.setData({
                        x: 100,
                        y: 55
                    })
                }, 300)
                
            }
            
        },

        onChangeTwo(e) {
            
            this.x = 100
            this.y = 50
            this.cardOneVisible = true
            console.log(e.mp.detail)
            
            if(e.mp.detail.source === 'out-of-bounds') {
                console.log('超出范围')
                this.cardTwoVisible = false
            }
        }
    }
};
</script>

<style lang="less" scoped>
    .top-z {
        z-index: 3;
    }

    .top-z-2 {
        z-index: 2;
    }
</style>
