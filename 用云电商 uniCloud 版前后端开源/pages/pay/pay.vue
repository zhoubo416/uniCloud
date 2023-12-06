<template>
	<view class="app w-full">
		<view class="price-box dflex-c dflex-flow-c">
			<view>支付金额</view>
			<view class="price fs-xxxl margin-top-sm">{{money}}</view>
		</view>

		<view class="pay-type-list">
			<!-- #ifdef MP-WEIXIN -->
			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('微信支付')">
				<text class="iconfont iconweixin"></text>
				<view class="item flex1">
					<text class="tit">微信支付</text>
					<text>推荐使用</text>
				</view>
				<label class="radio">
					<radio value="" color="#FF6A6C" :checked="pay_way == '微信支付'" :disabled="money <= 0" />
					</radio>
				</label>
			</view>
			<!-- #endif -->
			
			<!-- #ifdef MP-ALIPAY -->
			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('支付宝')">
				<text class="iconfont iconalipay"></text>
				<view class="item flex1">
					<text class="tit">支付宝支付</text>
					<text>推荐使用</text>
				</view>
				<label class="radio">
					<radio value="" color="#FF6A6C" :checked="pay_way == '支付宝'" :disabled="money <= 0" />
					</radio>
				</label>
			</view>
			<!-- #endif -->

			<!-- #ifdef MP-BAIDU -->
			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('百度钱包')">
				<text class="iconfont iconbaidu"></text>
				<view class="item flex1">
					<text class="tit">百度钱包</text>
					<text>推荐使用</text>
				</view>
				<label class="radio">
					<radio value="" color="#FF6A6C" :checked="pay_way == '百度钱包'" :disabled="money <= 0" />
					</radio>
				</label>
			</view>
			<!-- #endif -->

			<!-- #ifdef MP-QQ -->
			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('QQ钱包')">
				<text class="iconfont iconqq"></text>
				<view class="item flex1">
					<text class="tit">QQ钱包</text>
					<text>推荐使用</text>
				</view>
				<label class="radio">
					<radio value="" color="#FF6A6C" :checked="pay_way == 'QQ钱包'" :disabled="money <= 0" />
					</radio>
				</label>
			</view>
			<!-- #endif -->

			<!-- #ifdef MP-TOUTIAO -->
			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('头条支付', '微信支付', 'MWEB')">
				<text class="iconfont icontoutiao"></text>
				<view class="item flex1">
					<text class="tit">收银台</text>
					<text>推荐使用</text>
				</view>
				<label class="radio">
					<radio value="wxpay" color="#ff6a6c" colors="#ff6a6c" :checked="pay_way == '头条支付' && pay_trade_type == 'MWEB'"
					 :disabled="money <= 0" />
					</radio>
				</label>
			</view>
			<!-- #endif -->

			<!-- #ifdef H5 || MP-360 -->
			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('微信支付', '微信支付', 'NATIVE')">
				<text class="iconfont iconweixin"></text>
				<view class="item flex1">
					<text class="tit">微信支付</text>
					<text>推荐使用 扫一扫 微信支付二维码</text>
				</view>
				<label class="radio">
					<radio value="wxpay" color="#ff6a6c" colors="#ff6a6c" :checked="pay_way == '微信支付' && pay_trade_type == 'NATIVE'" :disabled="money <= 0" /></radio>
				</label>
			</view>
			<view class="qrcode tac padding-tb">
				<use-qrcode
					:onval="true"
					:val="qrcode"
					qrsize="200"
					@result="qrcode_rs"
				></use-qrcode>
			</view>
			
			<view v-if="time_remaining" class="dflex-c">
				<use-count-down :show-days="false" separator="zh" separator-color="#333" color="#fff" bg-color="#333" font-size="24" :timestamp="time_remaining" @end="ontimeend"></use-count-down>
			</view>
			<!-- #endif -->
		</view>

		<view class="padding w-full margin-top-big pos-a" style="bottom: 30rpx;">
			<view class="dflex-b border-radius-big">
				<!-- #ifndef H5 || MP-360 -->
				<view class="tac padding-tb-sm flex1 bg-base" :class="is_submit === 1 ? 'bg-disabled' : ''" @click="confirm">{{pay_tip}}</view>
				<!-- #endif -->
				
				<!-- #ifdef H5 || MP-360 -->
				<view class="tac padding-tb-sm flex1 bg-base" :class="is_submit === 1 ? 'bg-disabled' : ''" @click="check">{{pay_tip}}</view>
				<!-- #endif -->
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				money: 0,
				is_submit: 1,
				// 平台支付方式
				pay_way: '微信支付',
				// 原始支付方式 微信支付 支付宝支付
				pay_original: '',
				// JSAPI，NATIVE，APP，H5支付固定传 MWEB
				pay_trade_type: '',
				pay_tip: '确认支付',
				
				qrcode: '',
				time_remaining: 0,
			};
		},
		computed: {

		},
		onLoad(options) {
			this.money = options.money / 100 || 0;
			this.order_id = options.order_id;

			// #ifdef MP-WEIXIN 
			this.pay_way = '微信支付';
			this.pay_original = '微信支付';
			this.pay_trade_type = 'JSAPI';
			// #endif
			// #ifdef MP-ALIPAY 
			this.pay_way = '支付宝';
			this.pay_original = '支付宝支付';
			this.pay_trade_type = '';
			// #endif
			// #ifdef MP-BAIDU 
			this.pay_way = '百度钱包';
			// #endif
			// #ifdef MP-QQ
			this.pay_way = 'QQ钱包';
			// #endif
			// #ifdef MP-TOUTIAO
			this.$api.timerout(() => {
				this.pay_way = '头条支付';
				this.pay_original = '微信支付';
				this.pay_trade_type = 'MWEB';
			}, 0)
			// #endif
			// #ifdef H5 || MP-360
			this.$api.timerout(() => {
				this.pay_way = '微信支付';
				this.pay_original = '微信支付';
				this.pay_trade_type = 'NATIVE';
			}, 0)
			
			this.pay_tip = '已完成支付';
			// #endif

			this.loadData();
		},

		methods: {
			qrcode_rs(res) {
			},
			loadData() {
				let _this = this;
				_this.$func.usemall.call('order/detail', {
					order_id: _this.order_id
				}).then(res => {
					if (res.code == 200) {
						if (res.datas.order.state === '待付款') {
							_this.is_submit = 0;
						} else {
							_this.pay_tip = _this.order_id + ' 订单' + res.datas.order.state;
						}
					
						_this.money = res.datas.order.order_actural_paid / 100;
						if (_this.money <= 0) {
							uni.redirectTo({
								url: `/pages/pay/success?order_id=${_this.order_id}`
							});
							return;
							// _this.pay_way = '微信支付';
						}
						
						// #ifdef H5 || MP-360
						// 获取微信支付二维码
						_this.loadQRCode();
						// #endif
						return;
					}
					_this.$api.msg(res.msg);
				});
			},
			
			//选择支付方式
			changePayType(type, original, trade_type) {
				if (this.money <= 0) return;

				this.pay_way = type;
				if (original) this.pay_original = original;
				if (trade_type) this.pay_trade_type = trade_type;
				
				if(this.pay_trade_type == 'NATIVE') {
					this.loadQRCode();
				}
			},
			//确认支付
			confirm() {
				if (this.is_submit) return;

				this.is_submit = 1;

				let _this = this;
				uni.login({
					success(loginRes) {
						console.log('loginRes', loginRes);
						if (loginRes.code) {

							let obj = {
								code: loginRes.code,
								order_id: _this.order_id,
								pay_way: _this.pay_way,
								pay_original: _this.pay_original,
								pay_trade_type: _this.pay_trade_type,
							};
							_this.$func.usemall.call('order/pay', obj).then(res => {
								console.log('支付接口', obj, res);
								
								if (res.code === 200) {
									if (res.datas) {
										let pay_datas = {};
								
										//#ifdef MP-WEIXIN
										pay_datas = {
											timeStamp: res.datas.timeStamp,
											nonceStr: res.datas.nonceStr,
											package: res.datas.package,
											signType: res.datas.signType,
											paySign: res.datas.paySign
										};
										//#endif
										
										// #ifdef MP-ALIPAY
										pay_datas = {
											tradeNO: res.datas.trade_no
										};
										// #endif
								
										//#ifdef MP-BAIDU
										pay_datas = {
											orderInfo: res.datas.pay
										};
										//#endif
								
										//#ifdef MP-QQ
										pay_datas = {
											bargainor_id: res.datas.pay.bargainor_id,
											package: res.datas.pay.package
										};
										//#endif
								
										// #ifdef MP-TOUTIAO
										pay_datas = {
											orderInfo: res.datas.pay,
											service: 1,
											payChannel: {
												// wx || alipay
												default_pay_channel: "wx",
											},
											getOrderStatus: function(res) {
												let {
													out_order_no
												} = res;
												console.log('toutiao getOrderStatus out_order_no', out_order_no);
								
												return new Promise(function(resolve, reject) {
													// 商户前端根据 out_order_no 请求商户后端查询微信支付订单状态
													_this.$func.usemall.call("order/paystate", {
														order_id: out_order_no
													}).then(res => {
														// 商户后端查询的微信支付状态，通知收银台支付结果
														/*
														  0：支付成功
														  1：支付超时
														  2：支付失败
														  3：支付关闭
														  9：订单状态未知/未支付
														*/
														if (res.code == 200) {
															let code = 9;
															let trade_state = res.datas.trade_state || "";
																				
															if (res.datas.pay_state == '已付款') {
																code = 0
															} else if (trade_state == 'SUCCESS') {
																code = 0;
															} else if (trade_state == 'NOTPAY' || trade_state == 'PAYERROR') {
																code = 2;
															} else if (trade_state == 'CLOSED') {
																code = 3;
															}
															resolve({ code: code });
															return;
														}
														resolve({ code: 9 });
													}).catch(err => {
														reject(err);
													});
												});
											}
										};
										// #endif
								
										// 检查当前 session 是否有效
										if(uni.canIUse('checkSession')){
											uni.checkSession({
												success() {
													// 调用支付
													_this.topayment(pay_datas, res.datas.order_id);
												},
												fail() {
													// 当前 session 无效，调用 uni.login 获取数据
													uni.login({
														success() {
															// 调用支付
															_this.topayment(pay_datas, res.datas.order_id);
														},
														fail() {
											
														}
													})
												},
											})
										} else {
											// 调用支付
											_this.topayment(pay_datas, res.datas.order_id);
										}
								
									} else {
										uni.setStorage({
											key: '__order_state',
											data: '待付款',
											success(res) {
												console.log(res);
											},
											complete() {
												_this.$api.toorder();
											}
										});
									}
								
									return;
								}
								
								_this.$api.timerout(() => {
									if (typeof res.msg === 'object') {
										res.msg = res.msg.errorMessage;
									}
									_this.$api.msg(res.msg, 5000);
									_this.is_submit = 0;
								}, 800);
							});
						}
					},
					fail(err) {
						_this.$api.msg(err);
						_this.is_submit = 0;
					}
				})
			},
			topayment(pay_datas, order_id) {
				let _this = this;

				uni.requestPayment({
					...pay_datas,
					success: function(pres) {
						console.log('requestPayment success:', pres);
						// #ifdef MP-TOUTIAO
						if (pres.code !== 0) {
							_this.is_submit = 0;
							switch (pres.code) {
								case 1:
									_this.$api.msg('支付超时，请重新支付');
									break;
								case 2:
									_this.$api.msg('已取消，请重新支付');
									break;
								case 3:
									_this.$api.msg('支付关闭，请重新支付');
									break;
								case 4:
									_this.$api.msg('支付取消，请重新支付');
									break;
								case 9:
								default:
									_this.$api.msg('支付失败，请重新支付');
									break;
							}
							return;
						}
						// #endif

						uni.redirectTo({
							url: `/pages/pay/success?order_id=${order_id}`
						});
						return;
					},
					fail: function(err) {
						console.log('requestPayment fail:', err);

						uni.setStorage({
							key: '__order_state',
							data: '待付款',
							success(res) {
								console.log(res);
							},
							complete() {
								_this.$api.toorder();
							}
						});
					}
				});
			},
			// 检测订单支付状态
			check(){
				let _this = this;
				
				_this.$func.usemall.call("order/paystate", {
					order_id: _this.order_id
				}).then(res => {
					// 商户后端查询的微信支付状态，通知收银台支付结果
					/*
					  0：支付成功
					  1：支付超时
					  2：支付失败
					  3：支付关闭
					  9：订单状态未知/未支付
					*/
					if (res.code == 200) {
						let code = 9;
						let trade_state = res.datas.trade_state || "";
			
						if (res.datas.pay_state == '已付款') {
							code = 0
						} else if (trade_state == 'SUCCESS') {
							code = 0;
						} else if (trade_state == 'NOTPAY' || trade_state == 'PAYERROR') {
							code = 2;
						} else if (trade_state == 'CLOSED') {
							code = 3;
						}
						
						switch (code) {
							case 0:
								uni.redirectTo({
									url: `/pages/pay/success?order_id=${_this.order_id}`
								});
								break;
							case 1:
								_this.$api.msg('支付超时，请重新支付', 3500);
								break;
							case 2:
								_this.$api.msg('已取消，请重新支付', 3500);
								break;
							case 3:
								_this.$api.msg('支付关闭，请重新支付', 3500);
								break;
							case 4:
								_this.$api.msg('支付取消，请重新支付', 3500);
								break;
							case 9:
							default:
								_this.$api.msg('支付失败，请重新支付', 3500);
								break;
						}
						return;
					}
					
				}).catch(err => {
					
				});
			},
			// #ifdef H5 || MP-360
			loadQRCode(){
				let _this = this;
				let obj = {
					order_id: _this.order_id,
					pay_way: _this.pay_way,
					pay_original: _this.pay_original,
					pay_trade_type: _this.pay_trade_type,
				};
				uni.showLoading({
					title: '请求中'
				})
				// this.$api.alert('二维码支付开发中');
				_this.$func.usemall.call('order/pay', obj).then(res => {
					console.log('支付接口', obj);
					uni.hideLoading();
					
					if (res.code === 200) {
						if (res.datas) {
							_this.qrcode = res.datas.codeUrl;
							_this.time_remaining = res.datas.time_remaining;
						} else {
							uni.setStorage({
								key: '__order_state',
								data: '待付款',
								success(res) {
									console.log(res);
								},
								complete() {
									_this.$api.toorder();
								}
							});
						}
									
						return;
					}
					
					_this.$api.timerout(() => {
						_this.$api.msg(res.msg, 5000);
						_this.is_submit = 0;
					}, 800);
				});
			},
			ontimeend(){
				let _this = this;
				uni.showModal({
				    title: '提示',
				    content: '支付二维码已过期',
					confirmText: '重新生成',
				    success: function (res) {
				        if (res.confirm) {
				            _this.loadQRCode();
				        } else if (res.cancel) {
				            console.log('用户点击取消');
				        }
				    }
				});
			},
			// #endif

		}
	}
</script>

<style lang='scss'>
	.app { }

	.price-box {
		height: 266rpx;
		font-size: 28rpx;
		color: #909399;
	}

	.pay-type-list {
		padding-left: 60rpx;
		padding-right: 60rpx;

		.type-item {
			height: 120rpx;
			font-size: 30rpx;
		}

		.iconfont {
			width: 100rpx;
			font-size: 52rpx;
		}

		.iconhuiyuan {
			color: #fe8e2e;
		}

		.iconweixin {
			color: #36cb59;
		}

		.iconalipay {
			color: #01aaef;
		}

		.iconqq {
			color: #13c6fe;
		}

		.iconbaidu {
			color: #306cff;
		}

		.icontoutiao {
			color: #f85959;
		}

		.tit {
			font-size: $font-lg;
			color: $font-color-dark;
			margin-bottom: 4rpx;
		}

		.item {
			display: flex;
			flex-direction: column;
			font-size: $font-sm;
			color: $font-color-light;
		}
	}
</style>
