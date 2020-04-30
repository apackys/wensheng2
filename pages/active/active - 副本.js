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
    islogin: false,
    remind: '',
    company_name: '',
    company_id: '',
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
      complete: function () {
        console.log('hideHomeButton:complete');
      },
    });
  }, 
 

  /**
  * 生命周期函数--监听页面加载
  */

  onLoad: function () {
    console.log(app.globalData)
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
            mobile: data.mobile,
            company_name: data.company_name,
            company_id: data.company_id,
            region: region,
            date: date,
            wx_id: data.wechat_id,
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
  
  // 获取信息
  perfect: function (res) {
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
    }else if (res.detail.value.mobile.length <= 10) {
      wx.showToast({
        title: '手机号不正确!',
        icon: 'loading',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
    } else if (res.detail.value.company_name.length == 0) {
      wx.showToast({
        title: '公司名称不得为空!',
        icon: 'loading',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
    } else if (res.detail.value.company_id.length == 0) {
      wx.showToast({
        title: '公司信用代码不得为空!',
        icon: 'loading',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
    } else {

      wx.request({
        url: app.d.ceshiUrl + '&action=user&m=perfect',
        method: 'post',
        data: {
          user_id: app.globalData.userInfo.user_id,
          name: res.detail.value.name,
          mobile: that.data.mobile,
          province: province,
          city: city,
          county: county,
          wx_id: res.detail.value.wx_id,
          company_name: res.detail.value.company_name,
          company_id: res.detail.value.company_id,
          date: that.data.date,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          var status = res.data.status;
          if (status == 1) {
            wx.showToast({
              title:'提交申请成功',
              icon: 'success',
              duration: 3000
            });
            wx.redirectTo({
              url: '../about/about'
            })

          } else {
            wx.showToast({
              title: '操作失败，请重新申请！',
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