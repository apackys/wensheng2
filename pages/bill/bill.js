var app = getApp();
var util = require('../../utils/util.js')
Page({
  data: {
    page: 1,
    total: 0.0,
    buynum: [],
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

  
   
   
  bindToastChange: function () {
    this.setData({
      toastHidden: true
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
        var list = [];
        for (let i = 0; i < shoplist.length; i++) {
          list.push(0);
        }
        console.log(list)
        that.setData({
          shopList: shoplist,
          total: '￥0.00',
          buynum :list,
          remind: ''
        });
      },
    });
  },

  bindManual: function (e) {  
    var index = parseInt(e.currentTarget.dataset.index);
    var nownum = e.detail.value;
    var that = this;
    var pnum = this.data.shopList[index].num;
    if (nownum > 0){
      this.data.buynum[index] = nownum;
    }else {
      this.data.buynum[index] = 0;
    }
    console.log(index, nownum, this.data.buynum)
    if (Number(nownum) >= 0) {
      if (Number(nownum) <= Number(pnum)) {
        that.setData({
          buynum: this.data.buynum
        });
        that.sum();
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
  sum: function () {
    var that = this;
    var shopList = that.data.shopList;
    var buynum = that.data.buynum;
    // 计算总金额
    var total = 0;
    for (var i = 0; i < shopList.length; i++) {
      if (buynum[i]>0) {
        total += buynum[i] * shopList[i].price;
      }
    }
 
    // 写回经点击修改后的数组  .toFixed(2)取小数点2位
    this.setData({
      shopList: shopList,
      total: '¥ ' + total.toFixed(2)
    });
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