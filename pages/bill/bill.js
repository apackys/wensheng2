var app = getApp();
var util = require('../../utils/util.js')
Page({
  data: {
    page: 1,
    total: 0.0,
    nownum: [],
    shopList: [],
    cont: 1,
    upstatus: false,
    remind: '加载中',
  },
  //页面加载完成函数 remind: '加载中',
  onReady: function () {
    var that = this;
  },
  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
    this.loadProductData();
    this.sum();
  },
  bindMinus: function (e) {
    var that = this;
    var index = parseInt(e.currentTarget.dataset.index);
    var num = that.data.shopList[index].num;
    var cart_id = e.currentTarget.dataset.cartid;
    // 如果只有1件了，就不允许再减了
    if (num > 1) {
      num--;
    }

    if (num < 1) {
      wx.showToast({
        title: '数量不能小于1!',
        icon: 'none',
        duration: 2000
      });
    } else {
      wx.request({
        url: app.d.ceshiUrl + '&action=product&m=up_cart',
        method: 'post',
        data: {
          user_id: that.data.user_id,
          num: num,
          cart_id: cart_id
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          var status = res.data.status;
          if (status == 1) {
            util.getUesrBgplus(that, app, false)
            // 只有大于一件的时候，才能normal状态，否则disable状态
            var minusStatus = num <= 1 ? 'disabled' : 'normal';
            // 购物车数据
            var shopList = that.data.shopList;
            shopList[index].num = num;
            // 按钮可用状态
            var minusStatuses = that.data.minusStatuses;
            minusStatuses[index] = minusStatus;
            // 将数值与状态写回
            that.setData({
              minusStatuses: minusStatuses
            });
            that.sum();
          }
        },
        fail: function () {
          // fail
          wx.showToast({
            title: '网络异常！',
            duration: 2000
          });
        }
      });
    }
  },
   
  //清空购物车
  delall: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '你确认清空全部吗?',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.d.ceshiUrl + '&action=product&m=delAll_cart',
            method: 'post',
            data: {
              user_id: that.data.user_id,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              var data = res.data;
              if (data.status == 1) {
                wx.showToast({
                  title: '操作成功！',
                  duration: 2500
                });
                that.loadProductData();
                util.getUesrBgplus(that, app, false)
              } else {
                wx.showToast({
                  title: '操作失败！',
                  duration: 2000
                });
              }
            },
          });
        }
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },
  //编辑完成
  ok: function () {
    var that = this;
    that.setData({
      upstatus: false
    });
  },
  //编辑购物车
  updata: function () {
    var that = this;
    
    that.setData({
      upstatus: true
    });
  },

  
   
//加
  bindPlus: function (e) {
    var that = this;
    var index = parseInt(e.currentTarget.dataset.index);
    var num = that.data.shopList[index].num;
    // 自增
    num++;
    var pnum = that.data.shopList[index].pnum;
    var cart_id = e.currentTarget.dataset.cartid;
    console.log(pnum)
    if (pnum > num) {
      wx.request({
        url: app.d.ceshiUrl + '&action=product&m=up_cart',
        method: 'post',
        data: {
          user_id: that.data.user_id,
          num: num,
          cart_id: cart_id
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          var status = res.data.status;
          if (status == 1) {
            util.getUesrBgplus(that, app, false)
            // 只有大于一件的时候，才能normal状态，否则disable状态
            var minusStatus = num <= 1 ? 'disabled' : 'normal';
            // 购物车数据
            var shopList = that.data.shopList;
            shopList[index].num = num;
            // 按钮可用状态
            var minusStatuses = that.data.minusStatuses;
            minusStatuses[index] = minusStatus;
            // 将数值与状态写回
            that.setData({
              minusStatuses: minusStatuses
            });
            that.sum();
          }
        },
        fail: function () {
          wx.showToast({
            title: '网络异常！',
            duration: 2000
          });
        }
      });
    } else {
      wx.showToast({
        title: '库存不足！',
        icon: 'none',
        duration: 2000
      });
    }

  },

   

   
  bindToastChange: function () {
    this.setData({
      toastHidden: true
    });
  },

  sum: function () {
    var that = this;
    var shopList = that.data.shopList;

    // 计算总金额
    var total = 0;
    var selected = 0;
    for (var i = 0; i < shopList.length; i++) {
      if (shopList[i].selected) {
        total += shopList[i].num * shopList[i].price;
        selected = ++selected;
      }
    }
    //判断全选
    if (shopList.length == selected && selected != 0) {
      that.setData({
        selectedAllStatus: true,
      });
    } else {
      that.setData({
        selectedAllStatus: false,
      });
    }
    // 写回经点击修改后的数组  .toFixed(2)取小数点2位
    this.setData({
      shopList: shopList,
      total: '¥ ' + total.toFixed(2)
    });
  },

  onLoad: function (options) {
    this.setData({
      bgcolor: app.d.bgcolor,
      user_id: app.globalData.userInfo.openid
    });
    wx.setNavigationBarColor({
      frontColor: app.d.frontColor,//
      backgroundColor: app.d.bgcolor //页面标题为路由参数
    });
    this.loadProductData();
    this.sum();
  },
  onShow: function () {
    // app.userlogin(true);
    var cont = this.data.cont;
    var shopList = this.data.shopList;
    var purchase = app.d.purchase;
    var that = this;
    if (cont > 1 && purchase == 1) {
      that.loadProductData();
    } else {
      that.setData({
        shopList: shopList,
        cont: cont + 1
      });
    }
  },
  removeShopCard: function (shopList) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '你确认移除吗',
      success: function (res) {
        
        res.confirm && wx.request({
          url: app.d.ceshiUrl + '&action=product&m=delcart',
          method: 'post',
          data: {
            shopList: shopList,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            util.getUesrBgplus(that, app, false)
            //--init data
            var data = res.data;
            if (data.status == 1) {
              that.loadProductData();
            
            } else {
              wx.showToast({
                title: '操作失败！',
                duration: 2000
              });
            }
          },
        });
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },

  // 数据加载
  loadProductData: function () {
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '&action=bill&m=bill_product',
      method: 'post',
      data: {
        user_id: app.globalData.userInfo.openid
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var shoplist = res.data.pro;
        that.setData({
          shopList: shoplist,
          total: '￥0.00',
          remind: ''
        });
      },
    });
  },
  bindManual: function (e) {  
    var num = e.detail.value;
    var carid = e.target.dataset.cartid;
    console.log(e);
    var shopList = this.data.shopList;
    var that = this;
    var index = parseInt(e.currentTarget.dataset.index);
    var cat_num = that.data.shopList[index].num;
    var cart_id = e.currentTarget.dataset.cartid;
    var pnum = that.data.shopList[index].num;
    console.log(index, cat_num, pnum)
    if (Number(num) > 0) {
      if (Number(num) <= Number(pnum)) {
        wx.request({
          url: app.d.ceshiUrl + '&action=product&m=up_cart',
          method: 'post',
          data: {
            user_id: that.data.user_id,
            num: num,
            cart_id: carid
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            var status = res.data.status;
            if (status == 1) {
              // 只有大于一件的时候，才能normal状态，否则disable状态
              var minusStatus = num <= 1 ? 'disabled' : 'normal';
              // 购物车数据
              var shopList = that.data.shopList;
              shopList[index].num = num;
              // 按钮可用状态
              var minusStatuses = that.data.minusStatuses;
              minusStatuses[index] = minusStatus;
              // 将数值与状态写回
              that.setData({
                minusStatuses: minusStatuses
              });
              that.sum();
            }
          },
          fail: function () {
            wx.showToast({
              title: '网络异常！',
              duration: 2000
            });
          }
        });
      } else {
        wx.showToast({
          title: '库存不足,请重新输入！',
          icon: 'none',
          duration: 2000
        });
        var shopList = that.data.shopList;
        that.setData({
          shopList: shopList
        });
        that.sum();
      }

    } else {
      wx.showToast({
        title: '数量不能小于1,请重新输入！',
        icon: 'none',
        duration: 2000
      });
      var shopList = that.data.shopList;
      that.setData({
        shopList: shopList
      });
      that.sum();
      
    };
  },
  bindCheckout: function () {
    // 初始化toastStr字符串
    var toastStr = '';
    // 遍历取出已勾选的cid
    for (var i = 0; i < this.data.shopList.length; i++) {
      if (this.data.shopList[i].selected) {
        toastStr += this.data.shopList[i].id;
        toastStr += ',';
      }
    }
    if (toastStr == '') {
      wx.showToast({
        title: '请选择要结算的商品！',
        duration: 2000
      });
      return false;
    }
    //存回data
    wx.navigateTo({
      url: '../order/pay?cartId=' + toastStr,
    })
  },

})