var app = getApp()
Page({
  data: {
    imageurl: "../../images/logo.jpg",
    pop: null,
    statusvalid: wx.getStorageSync('userInfo').statusvalid,
    
  },
  onLoad: function () {
    console.log(app.globalData.userInfo)
    wx.setStorageSync('userInfo', app.globalData.userInfo);
    if (app.globalData.userInfo.openid) {
      wx.redirectTo({
        url: '../active/active'
      })
    }

  },
  onShow: function () {
    //隐藏返回首页按钮。微信7.0.7版本起，当用户打开的小程序最底层页面是非首页时，默认展示“返回首页”按钮，开发者可在页面 onShow 中调用 hideHomeButton 进行隐藏。
    wx.hideHomeButton({
      success: function () {
        console.log('hideHomeButton:suc');
      },
      fail: function () {
     
      },

    });
  },

  //页面加载完成函数
  onReady: function () {
    var that = this;
    this.pop = this.selectComponent("#pop")
    setTimeout(function () {
      that.setData({
        remind: ''
      });
    }, 1000);
    
  },

  jumpgo: function (event) {
    if (app.userlogin(1)) {
      this.pop.clickPup(this)
      return
    }

  },
  

})