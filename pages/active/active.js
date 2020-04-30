var app = getApp();
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    iv: '',
    encryptedData: '',
    remind: '',
    user_password:'',
    mobile:'',
    date: '2020-04-01',
    time: '12:01',
    region: ['四川省', '绵阳市', '游仙区'],
    customItem: '全部',
    shenqing:'申请会员须知',
    huiyuan:'以下信息请申请组织请务必认真填写以确保成功激活，账号注册并成功激活之才能使用本商城',
    

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
 
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },
  /**
  * 生命周期函数--监听页面加载
  */

  onLoad: function () {
    wx.checkSession({
      success: function (e) {
        console.log(e)
        console.log('session_key 未过期' + app.globalData.userInfo.session_key)
        //session_key 未过期，并且在本生命周期一直有效
        app.globalData.userInfo['session_key'] = app.globalData.userInfo.session_key;
      },
      fail: function () {
        // session_key 已经失效，需要重新执行登录流程
        wx.login({
          success: function (res) {
            var code = res.code;
            that.globalData.code = res.code;
            //取出本地存储用户信息，解决需要每次进入小程序弹框获取用户信息
            var userinfo = wx.getStorageSync('userInfo');
            that.globalData.userInfo = userinfo;
            app.getUserSessionKey(code, cb);
          }
        }); //重新登录
      }
    });

    var date = getNowFormatDate();
    this.setData({
      bgcolor: app.d.bgcolor,
      date: date
    });
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '&action=user&m=perfect_index',
      method: 'post',
      data: {
        user_id: app.globalData.userInfo.user_id
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res)
        var status = res.data.status;
        if (status == 1) {
          var data = res.data.data;

          if (data.province) {
            var region = [data.province, data.city, data.county];
          } else {
            var region = that.data.region;
          }
          that.setData({
            name: data.name,
            user_password: data.user_password,
            mobile: data.mobile,
            region: region,
            date: date,
            remind: ''
          });
        }
      },
      error: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },
  todeng: function () {
    wx.redirectTo({
      url: '../denglu/denglu'
    })
  },
  // 获取信息
  shenqing: function (res) {
    console.log(res)
    var that = this;
    var region = this.data.region;
    console.log(region)
    for (var i = 0; i < region.length; i++) {
      if (region[i] == '全部') {
        wx.showToast({
          title: '请完善地址!',
          icon: 'none',
          duration: 1500
        })
        return false;
        break;
      }
    }

    var province = region[0], city = region[1], county = region[2];
    if (res.detail.value.name.length == 0) {
      wx.showToast({
        title: '姓名不得为空!',
        icon: 'loading',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
    } else if (res.detail.value.user_password.length < 6) {
      wx.showToast({
        title: '密码太短!',
        icon: 'loading',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
    } else if (res.detail.value.mobile.length <= 10) {
      wx.showToast({
        title: '手机号不正确!',
        icon: 'loading',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
    } else {

      wx.request({
        url: app.d.ceshiUrl + '&action=user&m=shenqing',
        method: 'post',
        data: {
          user_id: app.globalData.userInfo.user_id,
          name: res.detail.value.name,
          user_password: res.detail.value.user_password,
          mobile: res.detail.value.mobile,
          province: province,
          city: city,
          county: county,
          date: that.data.date,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          var status = res.data.status;
          if (status == 1) {

            wx.showModal({
              title: '提交申请成功',
              content: '您已经提交申请，请耐心等待审核',
              showCancel:false,
              success(res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: '../denglu/denglu',
                  });
                } else if (res.cancel) {
                  console.log(1);
                }
              }
            })
        

          } else {
            wx.showToast({
              title: '操作失败，请不要反复申请！',
              icon: 'none',
              duration: 1500
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