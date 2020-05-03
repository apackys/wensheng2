var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageurl: "../../images/logo.jpg",
    statusvalid: '',
    mobile: '',
    user_password: '',    

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  onShow: function () {
    //隐藏返回首页按钮。微信7.0.7版本起，当用户打开的小程序最底层页面是非首页时，默认展示“返回首页”按钮，开发者可在页面 onShow 中调用 hideHomeButton 进行隐藏。
    wx.hideHomeButton({
      success: function () {
        console.log('hideHomeButton:suc');
      },
      fail: function () {
        console.log('hideHomeButton:fail');
      },

    });
  }, 

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
 
  wxlogin: function (res) {
    var that = this;
    var mobile = res.detail.value.mobile;
    var user_password = res.detail.value.user_password;
    if (res.detail.value.mobile.length <= 10) {
      wx.showToast({
        title: '手机号码不正确!',
        icon: 'loading',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
    } else if (res.detail.value.user_password.length <= 5) {
      wx.showToast({
        title: '密码不正确!',
        icon: 'loading',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
    } else {
      wx.request({
        url: app.d.ceshiUrl + '&action=user&m=denglu',
        method: 'post',
        data: {
          mobile: res.detail.value.mobile,
          user_password: res.detail.value.user_password
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res);
          var status = res.data.status;
          if (status == 1) {
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 3000
            });
            wx.switchTab({
              url: '../index/index',
            });


          } else {
            wx.showModal({
              title: '登录失败',
              content: res.data.err,
              showCancel: false,
              success(res) {
                if (res.confirm) {
                   console.log(2);
                } else if (res.cancel) {
                  console.log(1);
                }
              }
            });
          }
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 2000);
        },
        error: function (e) {
          wx.showToast({
            title: '网络异常！',
            duration: 2000
          });
        }

      });


    }
  }, 
})