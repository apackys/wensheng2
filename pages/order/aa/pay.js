var app = getApp();
var util = require('../../utils/util.js')
Page({
  data: {
    ispayOrder: false,
    pays: [],
    itemData: {},
    userId: 0,
    paytype: 'wxPay', //支付方式
    cartId: 0,
    addrId: 0, //收货地址//测试--
    btnDisabled: false,
    productData: [],
    address: {},
    total: 0,
    yuan: 0, //临时储存先前的总价格
    d_yuan: 0, //抵扣余额显示
    vprice: 0,
    vid: 0,
    paswnum: 0,
    reduce_money: 0, //优惠金额
    addemt: 1, //加入次数
    vou: [],
    checked: false,
    score: 0, //用户积分
    allowscore: 0, //当前订单可用积分
    checked01: false,
    allow: 0,
    pass_num: 4,
    remind: true,
    title: '请输入支付密码',
    xsmoney: true, //控制显示金额
    money: false,
    pay_xs: true,
    pages_sx: true,
    dz_stu: false,
  },

  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    setTimeout(function () {
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
    this.Settlement();
  },
  

  onLoad: function (options) {
    console.log(app.globalData)
    console.log(options)
    var that = this;
    that.get_plug();
    wx.setNavigationBarColor({
      frontColor: app.d.frontColor, //
      backgroundColor: app.d.bgcolor //设置页面参数
    })

    var uid = app.globalData.userInfo.openid; // 微信id

    this.setData({
      cartId: options.cartId, // 购物车id
      num1: options.num,
      type: options.type ? options.type : 0, //(1.直接结算 0购物车结算)
      bgcolor: '#FF6347', // 背景颜色
      userId: uid, // 微信id

    });
    this.Settlement();


  },
  //页面加载完成函数
  onReady: function () {

  },
  onUnload() {//onUnload监听页面卸载
    var that = this;
    // console.log(that)
    util.getUesrBgplus(that, app, true)//刷新显示购物车数量
    util.getUesrBgplus(that, app, false)//刷新显示购物车数量
    var cartid = that.data.cartId
    var type = that.data.type
    if (type == 1) { //直接结算离开页面清除购物车数量
      wx.request({
        url: app.d.ceshiUrl + '&action=product&m=delcart',
        method: 'post',
        data: {
          carts: that.data.cartId, // 购物车id
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          var status = res.data.status;
          if (status == 1) {
            that.setData({});
            setTimeout(function () {
              that.setData({
                remind: false
              });
            }, 1000);
          } else {
            that.setData({
              remind: true
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
    }
    // console.log('onUnload监听页面卸载');
  },

  onShow: function () {
    var that = this;
    console.log(that.data.dz_stu)
    if (that.data.dz_stu) {
      that.setData({
        dz_stu: false,
      });
      util.getUesrBgplus(that, app, false)
      wx.navigateTo({
        url: '../order/pay?cartId=' + that.data.cartId,
      })
    }

    if (that.data.pages_sx) {
      setTimeout(function () {
        that.Settlement();
      }, 500);
    }

  },
  // 进入结算页面
  Settlement: function () {
    var that = this;
    console.log(that)
    wx.request({
      url: app.d.ceshiUrl + '&action=bill&m=Settlement',
      method: 'post',
      data: {
        cart_id: that.data.cartId, // 购物车id
        uid: that.data.userId, // 微信id
        num1: that.data.num1, //数量
        type: that.data.type, //(1.直接结算 0购物车结算)
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status == 1) {
          console.log(res.data);
          console.log('res.data.arr');
          that.setData({
            productData: res.data.arr.pro, // 商品信息
            total: res.data.arr.price, // 总价        
          });

          setTimeout(function () {
            that.setData({
              remind: false
            });
          }, 1000);
        } else {
          that.setData({
            remind: true
          });
          wx.showToast({
            title: res.data.err,
            icon: 'none',
            duration: 2000,
          });
          if (status == 0) {
            setTimeout(function () {
              util.getUesrBgplus(that, app, false)
              wx.navigateBack({
                delta: 1
              })
            }, 2000);

          } else {
            setTimeout(function () {
              util.getUesrBgplus(that, app, false)
              wx.navigateBack({
                delta: 1
              })
            }, 2000);
          }
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
 
   

  
  // 确认订单
  createProductOrder: function () {

    var that = this;
    console.log(that)
    console.log('***************')

    this.setData({
      btnDisabledbtnDisabled: false,
      pages_sx: false
    })

    var paytype = that.data.paytype;
    var type1 = that.data.type1;
    app.d.purchase = 1; //设置购物车刷新

    wx.request({
      url: app.d.ceshiUrl + '&action=product&m=payment',
      method: 'post',
      data: {
        uid: that.data.userId, // 微信id
        cart_id: that.data.cartId, // 购物车id
        type: paytype, // 支付方式
        total: that.data.coupon_money, // 付款金额
        coupon_id: that.data.coupon_id, // 优惠券ID
        allow: that.data.allow, // 用户使用消费金
        name: that.data.name, // 满减金额名称
        reduce_money: that.data.reduce_money, // 满减金额
        dkyuan: that.data.d_yuan,
        freight: that.data.freight,
        num: that.data.num1 ? that.data.num1 : 0, //直接购买数量
        typee: that.data.type ? that.data.type : 0, //购买类型1直接购买，0从购物车买
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var data = res.data;
        console.log(res)
        if (data.status == 1) {
          // 余额支付
          if (data.arr.pay_type == 'wallet_Pay') {

            that.wallet_pay(data.arr);

          }
          if (data.arr.pay_type == 'wxPay') {
            // 微信支付
            wx.showLoading({
              title: '加载中',
            })

            that.wxpay(data.arr);
          }
        } else {

          wx.showToast({
            title: res.data.err,
            icon: 'none',
            duration: 2500
          });

        }
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！err:createProductOrder',
          duration: 2000
        });
      }
    });
    // }
  },

  promiss: function (callback, referee_openid, openid) {
    return new Promise((s, l) => {
      callback(referee_openid, openid)
      s()
    })
  },
  
  //修改订单
  up_order: function (order) {
    console.log(order)
    var that = this;
    var type1 = that.data.type1;
    var d_yuan = that.data.d_yuan;
    var cmoney = order.coupon_money;
    if (that.data.trade_no) {
      var trade_no = that.data.trade_no
    } else {
      var trade_no = ''
    }
    if (d_yuan) {
      cmoney = cmoney - d_yuan;
    }
    wx.request({
      url: app.d.ceshiUrl + '&action=product&m=up_order',
      method: 'post',
      data: {
        coupon_money: order.coupon_money, // 付款金额
        order_id: order.sNo, // 订单号
        user_id: app.globalData.userInfo.openid, // 微信id
        d_yuan: d_yuan,
        trade_no: trade_no,
        pay: that.data.paytype,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (!res.data.status) {
          wx.showToast({
            title: res.data.err,
            icon: 'none',
            duration: 2000
          });
        }
        var orderId = res.data.sNo; // 订单号
        var oid = res.data.id; // 订单id
        var f_pname = res.data.pname; // 拼接的商品名称
        var f_coupon_money = res.data.coupon_money; // 订单价格
        var time = res.data.time; // 当前时间
        var form_id = that.data.form_id;
        var user_id = app.globalData.userInfo.openid; // 微信id
        //控制首页刷新

        app.d.indexchase = true;
        // 调用信息发送
        console.log('信息发送', order.order_id)
        that.notice(orderId, order.order_id, f_coupon_money, user_id, form_id, f_pname);

        wx.showModal({
          content: "下单成功！",
          showCancel: false,
          confirmText: "确定",
          success: function (res) {
            console.log('下单成功！', order.order_id)
            wx.redirectTo({
              url: '../order/detail?orderId=' + order.order_id + '&&type1=22',
              success:function(){
                that.setData({
                  ispayOrder: false
                })
              }
            })

          }
        });
      }
    })

  },
   

 



  //获取插件
  get_plug: function (e) {
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '&action=app&m=get_plug',
      method: 'post',
      data: {
        userid: app.globalData.userInfo.openid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var plug_ins = res.data;
        that.setData({
          plug_coupon: plug_ins.coupon,
          plug_wallet: plug_ins.wallet,
          plug_integral: plug_ins.integral,
          pays: plug_ins.pays,
          red_packet: plug_ins.red_packet
        });
      }
    })
  },
  //发送数据到客户微信上
  notice: function (order_id, order_sn, price, user_id, form_id, f_pname) {
    wx.request({
      url: app.d.ceshiUrl + '&action=getcode&m=Send_Prompt',
      method: 'post',
      data: {
        page: 'pages/order/detail?orderId=' + order_sn,
        order_sn: order_id,
        price: price + '元',
        user_id: user_id,
        form_id: form_id,
        f_pname: f_pname
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(form_id)
      }
    })
  },

  // 弹窗
  setModalStatus: function (e) {
    var taht = this;
    var showModalStatus = that.data.showModalStatus;
    if (showModalStatus) {
      // 点击旁白 无需响应
    } else {
      taht.my_coupon();
    }
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    //定义点击的类型
    taht.animation = animation
    animation.translateY(300).step();
    taht.setData({
      animationData: animation.export()
    })
    if (e.currentTarget.dataset.status == 1) {
      taht.setData({
        showModalStatus: true
      });
    }
    setTimeout(function () {
      animation.translateY(0).step()
      taht.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        taht.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200);

  },
  up_out_trade_no: function (order, out_trade_no) {
    var that = this;
    var sNo = order.sNo;
    var d_yuan = that.data.d_yuan;
    var cmoney = order.coupon_money;
    if (d_yuan) {
      cmoney = cmoney - d_yuan;
    }
    wx.request({
      url: app.d.ceshiUrl + '&action=order&m=up_out_trade_no',
      method: 'post',
      data: {
        coupon_id: order.coupon_id, // 优惠券id
        allow: that.data.allow, // 使用积分
        coupon_money: order.coupon_money, // 付款金额
        order_id: order.sNo, // 订单号
        user_id: app.globalData.userInfo.openid, // 微信id
        d_yuan: d_yuan,
        trade_no: out_trade_no,
        pay: that.data.paytype,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res)
      }
    })
  },
});