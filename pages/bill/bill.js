var app = getApp();
var util = require('../../utils/util.js')
Page({
  data: {
    page: 1,
    total: 0.0,
    shopList: [],
    cont: 1,
    cart_id:[],
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
              user_id: app.globalData.userInfo.openid,
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
        var shopList = res.data.pro;
        for (let i = 0 ;i<shopList.length;i++){
          that.data.cart_id.push(shopList[i].cart_id);
        }
        console.log(that.data.cart_id)
        // 计算总金额
        that.setData({
          shopList: shopList, 
          total: '￥0.00',
          remind: ''
        });
        that.sum();
      },
    });
  },

  bindManual: function (e) {  
    var index = parseInt(e.currentTarget.dataset.index);
    var that = this;
    var num = e.detail.value;
    var pnum = that.data.shopList[index].num;
    var pid = that.data.shopList[index].id;
    var sizeid = that.data.shopList[index].sizeid;
    that.data.shopList[index].Goods_num = num;
    console.log(e, app.globalData.userInfo.openid, pid, sizeid, num)
    if (Number(num) > 0) {
      if (Number(num) <= Number(pnum)) {
        wx.request({
          url: app.d.ceshiUrl + '&action=bill&m=add_cart',
          method: 'post',
          data: {
            uid: app.globalData.userInfo.openid,
            pid: pid,
            num: num,
            sizeid: sizeid
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            //设置购物车刷新
            app.d.purchase = 1;
            var data = res.data;
            if (data.status == 1) { 
                let cart_id = data.cart_id; 
              if (that.data.cart_id[index] == ""){
                that.data.cart_id[index] = cart_id;
              }
              console.log(that.data.cart_id)
                that.sum();
            }
          },
          fail: function () {
            wx.showToast({
              title: '网络异常！',
              duration: 2000
            });
            var shopList = that.data.shopList;
            that.setData({
              shopList: shopList
            });
            that.sum();
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

    } else if (Number(num) == 0 || num ==''){
      wx.request({
        url: app.d.ceshiUrl + '&action=product&m=delcart',
        method: 'post',
        data: {
          carts: that.data.shopList[index].cart_id,
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
    } else {
      wx.showToast({
        title: '数量不能小于0,请重新输入！',
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
    // 计算总金额
  
    var total = 0;
    for (var i = 0; i < shopList.length; i++) {
      if (shopList[i].Goods_num>0) {
        total += shopList[i].Goods_num * shopList[i].price;
      }
    }
    // 写回经点击修改后的数组  .toFixed(2)取小数点2位
    this.setData({
      shopList: shopList,
      total: '¥ ' + total.toFixed(2)
    });
  },
  bindCheckout: function () {
    var that = this;
    // 初始化toastStr字符串
    var toastStr = '';
    // 遍历取出已勾选的cid
    for (var i = 0; i < that.data.shopList.length; i++) {
      if (that.data.shopList[i].Goods_num> 0) {
        toastStr += that.data.cart_id[i];
        toastStr += ',';
      }
    }
    console.log(toastStr);
    if (toastStr == '') {
      wx.showToast({
        title: '请输入商品数量！',
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