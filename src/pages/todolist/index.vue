<template>
    <div class="todo-list">
        <i-toast id="toast"/>
        <div class="avatar">
            <i-avatar @click="editAvatar" v-bind:src="avatarUrl">头像</i-avatar>
        </div>
        <div class="position">您当前所在的位置：
            <br>
            {{country + ' ' + province + ' ' + city + ' ' + district}}
        </div>
        <div class="top">
            <input class="todo-input" type="text" v-model="itemName" placeholder="请输入待办事项">
            <i-button type="success" shape="circle" size="small" inline @click="addTodo">添加</i-button>
        </div>
        <div class="list-wrapper">
            <div
                class="list"
                v-for="(item, index) in todoList"
                :key="index"
                @click="complete(item)"
            >
                <i-icon
                    v-bind:type="item.completed ? 'success_fill' : 'time'"
                    color="grey"
                    size="25"
                />
                <span :class="item.completed ? 'checked' : 'check'">{{item.name}}</span>
            </div>
        </div>
    </div>
</template>

<script>
const { $Toast } = require("../../../static/iView/base/index");

export default {
  data() {
    return {
      avatarUrl: "",
      itemName: "",
      country: "",
      province: "",
      city: "",
      district: "",
      todoList: [
        {
          name: "吃饭",
          completed: false
        },
        {
          name: "睡觉",
          completed: false
        }
      ]
    };
  },

  // 所有页面的created函数会在项目加载的时候被一起调用，而且进入页面的时候不会在被调用，
  // 所以这个函数基本就不能使用了，用小程序的onLoad钩子代替吧

  // mounted：你如果从页面B返回页面A，页面A的mounted钩子不会被触发，因为页面没有被重新加载，
  // 如果有需要每次页面展示都要调用的逻辑，使用小程序的onShow代替吧

  mouted() {
    this.getLocations();
  },

  methods: {
    editAvatar() {
      wx.chooseImage({
        success: res => {
          console.log(res);
        }
      });
    },

    goTo(url) {
      this.$router.push(url);
    },

    addTodo() {
      if (this.itemName.trim()) {
        let newItem = {
          name: this.itemName,
          completed: false
        };
        this.todoList.push(newItem);
        $Toast({
          content: `成功添加待办：${this.itemName}`,
          duration: 1,
          type: "success"
        });
        // Toast(`成功添加待办：${this.itemName}`, {duration: 1000})
        this.itemName = "";
      } else {
        $Toast({
          content: "不得为空！",
          duration: 1,
          type: "warning"
        });
      }
    },

    complete(item) {
      if (!item.completed) {
        item.completed = true;
      } else {
        return;
      }
    },

    getLocations() {
      let _this = this;
      wx.getSetting({
        success(res) {
          // debugger
          // 判断用户是否授权过，
          // 未授权过
          if (!res.authSetting["scope.userLocation"]) {
            console.log("未授权");
            wx.authorize({
              scope: "scope.userLocation",
              success(res) {
                // 用户允许 查看自己的位置
                console.log(res);
                _this.wxGetLocation();
              },
              fail(err) {
                console.log(err);
                // 当用户拒绝 查看自己的位置的时候  统计数据
                // 统计数据  地理位置为空
                _this.count();
              }
            });
          } else {
            // 授权过
            console.log("已授权");
            _this.wxGetLocation();
          }
        },
        fail(err) {
          console.log(err);
        }
      });
    },

    wxGetLocation() {
      let _this = this;
      wx.getLocation({
        // type: 'wgs84',
        success: function(res) {
          let latitude, longitude;
          latitude = res.latitude.toString();
          longitude = res.longitude.toString();
          wx.request({
            header: {
              "Content-Type": "application/text"
            },
            url:
              "http://apis.map.qq.com/ws/geocoder/v1/?location=" +
              latitude +
              "," +
              longitude +
              "&key=MVGBZ-R2U3U-W5CVY-2PQID-AT4VZ-PDF35",
            success: function(res) {
              _this.country = res.data.result.address_component.nation;
              _this.province = res.data.result.address_component.province;
              _this.city = res.data.result.address_component.city;
              _this.district = res.data.result.address_component.district;
              //_this.count()
              console.log(
                res.data.result.address_component.nation,
                res.data.result.address_component.province,
                res.data.result.address_component.city,
                res.data.result.address_component.district
              );
            }
          });
        },
        fail: function(err) {
          console.log(err);
          console.log(112);
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.todo-list {
  padding: 10px 0;
  .avatar {
    text-align: center;
    margin-bottom: 10px;
  }
  .position {
    font-size: 14px;
    text-align: center;
  }
  .top {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
  }

  .todo-input {
    border-bottom: 1px solid #f3f4f8;
    margin-right: 10px;
  }

  .list-wrapper {
    text-align: center;
    margin-top: 10px;

    .list {
      margin-bottom: 10px;
      span {
        margin-left: 5px;
      }

      .checked {
        color: grey;
        text-decoration: line-through;
      }
    }
  }
}
</style>
