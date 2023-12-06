<template>
	<view class="order-detail">
		<!-- 订单状态 -->
		<view class="state-area padding-lr margin-tb-sm">
			<view class="padding border-radius bg-base">

				<view v-if="order_data.state == '待付款'">
					<view class="dflex-c fs-lg">
						<text class="iconfont icondaifukuan- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">订单待支付</text>
					</view>
					<view class="dflex-c">
						剩余时间：
						<use-count-down :show-days="false" separator="zh" separator-color="#fff" font-size="24"
							:timestamp="time_remaining"></use-count-down>
					</view>
				</view>

				<view v-if="order_data.state == '待发货'">
					<view class="dflex-c fs-lg">
						<text class="iconfont icondaifahuo- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">订单备货中</text>
					</view>
					<view class="dflex-c">预计1天后发货</view>
				</view>

				<view v-if="order_data.state == '待收货'">
					<view class="dflex-c fs-lg">
						<text class="iconfont icondaishouhuo- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">订单已发货</text>
					</view>
					<view class="dflex-c">还剩5天10时自动确认</view>
				</view>

				<view v-if="order_data.state == '待评价'">
					<view class="dflex-c fs-lg">
						<text class="iconfont iconyiwancheng- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">订单已收货</text>
					</view>
					<view class="dflex-c">感谢您的支持，评价送积分</view>
				</view>
				
				<view v-if="order_data.state == '已完成'">
					<view class="dflex-c fs-lg">
						<text class="iconfont iconyiwancheng- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">订单已完成</text>
					</view>
					<view class="dflex-c">感谢您的支持，期待下次购买</view>
				</view>

				<view v-if="order_data.state == '已取消'">
					<view class="dflex-c fs-lg">
						<text class="iconfont icondaifukuan- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">订单已关闭</text>
					</view>
					<view class="dflex-c">感谢您的支持</view>
				</view>
				
				<view v-if="order_data.state == '售后中'">
					<view class="dflex-c fs-lg">
						<text class="iconfont icondaifukuan- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">已申请售后</text>
					</view>
					<view class="dflex-c">请耐心等待工作人员处理</view>
				</view>
				<view v-if="order_data.state == '售后结束'">
					<view class="dflex-c fs-lg">
						<text class="iconfont iconyiwancheng- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">{{order_data.order_refund_state}}</text>
					</view>
					<view class="dflex-c">感谢您的支持</view>
				</view>
			</view>
		</view>

		<!-- 收货人 -->
		<view class="address-area padding-lr margin-tb-sm" v-if="order_data.order_consignee">
			<view class="dflex padding border-radius bg-main">
				<view class="iconfont icondizhi- margin-right ft-main"></view>
				<view class="flex1">
					<view class="w-full dflex-wrap-w">
						<view class="margin-bottom-xs desc">
							<text>{{ order_data.order_consignee_addr }}
								{{ order_data.order_consignee_addr_detail }}</text>
						</view>
						<view>
							<text>{{ order_data.order_consignee }}</text>
							<text class="margin-left">{{ order_data.order_consignee_tel }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 订单商品明细 -->
		<view class="padding margin-lr margin-tb-sm bg-main border-radius">
			<view class="goods-area" :class="{ 'margin-top': index > 0 }" v-for="(item, index) in order_detail"
				:key="index">
				<view class="dflex">
					<view class="img">
						<image :src="item.goods_img"></image>
					</view>
					<view class="margin-left-sm">
						<text class="clamp-2">{{ item.goods_name }} {{ item.goods_name_pw }}</text>
						<view class="ft-dark fs-xs padding-top-xs">
							<text class="margin-right">× {{item.goods_num}}</text>
							{{ item.goods_sku_name || '&nbsp;&nbsp;' }}
						</view>
						<view class="margin-top-sm">
							<text class="price">{{ item.goods_price / 100 }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 订单数据 -->
		<view class="order-area padding margin-lr margin-tb-sm bg-main border-radius">
			<view class="item">
				<text>订单编号：</text>
				<text class="">{{ order_data.order_id }}</text>
				<text class="copy" @click="copy">复制</text>
			</view>
			<view class="item">
				<text>下单时间：</text>
				<text class="">{{ order_data.create_time }}</text>
			</view>
			<view class="item">
				<text>支付方式：</text>
				<text class="">{{ order_data.order_pay_way }}</text>
			</view>
			<view class="item">
				<text>支付编号：</text>
				<text class="">{{ order_data.order_pay_no }}</text>
			</view>
		</view>

		<!-- 退款数据 -->
		<view class="order-area padding margin-lr margin-tb-sm bg-main border-radius"
			v-if="order_data.order_refund_state">
			<view class="item">
				<text>退款原因：</text>
				<text class="">{{ order_data.order_refund_reason }}</text>
			</view>
			<view class="item">
				<text>退款说明：</text>
				<text class="">{{ order_data.order_refund_desc }}</text>
			</view>
			<view class="item">
				<text>退款状态：</text>
				<text>{{ order_data.order_refund_state }}</text>
			</view>
			<view class="item">
				<text>退款情况：</text>
				<text>{{ order_data.order_refund_remark || '' }}</text>
			</view>
		</view>

		<!-- 统计数据 -->
		<view class="total-area padding margin-lr margin-tb-sm bg-main border-radius">
			<view class="ft-dark">
				<view class="item dflex-b">
					<text>{{ goods_price_tip}}</text>
					<text class="">￥{{ order_data.order_total_money / 100 }}</text>
				</view>
				<view class="item dflex-b">
					<text>优惠</text>
					<text class="">￥{{ order_data.order_coupon_price || 0}}</text>
				</view>
				<view class="item dflex-b">
					<text>运费</text>
					<text class="">￥0</text>
				</view>
			</view>
			<view class="item dflex-b">
				<text>实付款</text>
				<text class="price">{{ order_data.order_actural_paid / 100 }}</text>
			</view>
		</view>
		<view style="height: 100rpx;"></view>

		<!-- 底部操作区 -->
		<view class="oper-area dflex-b padding-right padding-left-sm">
			<view class="dflex">
				<view class="btn-area dflex dflex-flow-c" @click="tohome">
					<text class="iconfont iconshouye-1"></text>
					<text>首页</text>
				</view>
				<!-- #ifndef H5 || MP-360 || MP-ALIPAY -->
				<button class="btn no-border" open-type="contact">
					<view class="btn-area dflex dflex-flow-c">
						<text class="iconfont iconkefu-01"></text>
						<text>客服</text>
					</view>
				</button>
				<!-- #endif -->
			</view>

			<view class="dflex-e">
				<view class="dflex" v-if="order_data.state == '待付款'">
					<button class="action-btn" @click="cancelOrder">取消订单</button>
					<button v-if="order_data.order_pay_state == '待付款'" class="action-btn main-btn"
						@click="payment">立即支付</button>
					<button v-if="order_data.order_pay_state == '待核实'" class="action-btn main-btn"
						@click="payment">待核实</button>
				</view>
				<view class="dflex" v-if="order_data.state == '待发货'">
					<button v-if="!order_data.order_refund_state" class="action-btn border-radius-big bg-main"
						@click="refund">申请退款</button>
				</view>
				<button v-if="!order_data.order_refund_state && 
					['待收货', '待评价', '已完成'].includes(order_data.state)" class="action-btn" @click="toexpress">查看物流</button>
				<view class="dflex" v-if="order_data.state == '待收货'">
					<button v-if="!order_data.order_refund_state" class="action-btn main-btn" @click="toreceipt">确认收货</button>
				</view>
				<view class="dflex" v-if="order_data.state == '待评价'">
					<button class="action-btn main-btn" @click="evaluate">我要评价</button>
				</view>
				<view v-if="order_data.state == '已完成' || order_data.state == '已取消'"><button @click="delorder" class="action-btn main-btn">删除订单</button></view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		components: {
			// share
		},
		data() {
			return {
				// 商品数据
				order_detail: [],
				// 订单数据
				order_data: {},
				addressData: [],
				sharekefuList: [],
				shareEmptyList: [],
				order_id: '',
				goods_price_tip: '产品总计',
				time_remaining: 0,
			};
		},
		onUnload() {
			uni.$emit('__event_order', 'refresh');
		},
		onLoad(options) {

			this.order_id = options.order_id;

			this.loadData();
		},
		onShow() {
			this.loadData();
		},
		methods: {
			tohome() {
				this.$api.tohome();
			},
			async loadData() {
				let _this = this;
				await this.$func.usemall.call('order/detail', {
					order_id: _this.order_id
				}).then(res => {
					if (res.code === 200) {
						res.datas.order.create_time = this.$api.format(res.datas.order.create_time);
						_this.order_data = res.datas.order;
						_this.order_detail = res.datas.order_detail;
						_this.addressData = res.datas.order_trip;
						if (res.datas.order && res.datas.order.state === '待付款') {
							_this.time_remaining = res.datas.time_remaining;
						}

						_this.order_detail.forEach(data => {
							if (data.goods_opt_id > 0) {
								let desc = '';
								if (data.goods_opt_desc) {
									desc = ' (' + data.goods_opt_desc + ')';
								}
								_this.goods_price_tip = data.goods_opt_name + desc;
							}
						});
						
						// console.log(_this.order_detail);
						// console.log(_this.order_data.state);
					}
				})
			},
			// 立即支付
			payment() {
				if (this.order_data.order_pay_state == '待核实') {
					this.$api.msg('订单已支付待核实状态');
					return;
				}

				this.$api.topay({
					order_id: this.order_data.order_id,
					money: this.order_data.order_actural_paid
				});
			},
			// 查看物流
			toexpress(item) {
				// this.$api.msg('查看物流开发中');
				uni.navigateTo({
					url: `/pages/user/order/order-express?order_id=${this.order_id}`
				});
			},
			// 已发货
			toreceipt() {
				let _this = this;

				uni.showModal({
					title: '提示',
					content: '确认收货',
					success: function(res) {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							_this.$func.usemall.call('order/received', {
								order_id: _this.order_id,
								state: '待评价'
							}).then(res => {
								_this.loadData('refresh');
							});
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					},
					complete() {
						uni.hideLoading();
					}
				});
			},
			// 删除订单
			delorder() {
				let _this = this;

				uni.showModal({
					title: '提示',
					content: '删除订单',
					success: function(res) {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							_this.$func.usemall.call('order/deleted', {
								order_id: _this.order_id,
							}).then(res => {
								if (res.code === 200) {
									uni.navigateBack({});
								}
							})
						} else if (res.cancel) {
							console.log('点击取消');
						}
					},
					complete() {
						uni.hideLoading();
					}
				});
			},
			// 取消订单
			cancelOrder() {
				let _this = this;

				uni.showModal({
					title: '提示',
					content: '取消订单',
					success: function(res) {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							_this.$func.usemall.call('order/cancel', {
								order_id: _this.order_id,
								state: '已取消'
							}).then(res => {
								if (res.code === 200) {
									_this.loadData('refresh');
								}
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					},
					complete() {
						uni.hideLoading();
					}
				});
			},
			// 点击复制
			copy() {
				let _this = this;

				uni.setClipboardData({
					data: _this.order_id,
					success: function(res) {
						uni.getClipboardData({
							success: function(res) {
								uni.showToast({
									title: '复制成功'
								});
							}
						});
					}
				});
			},
			// 评价
			evaluate() {
				uni.navigateTo({
					url: `/pages/user/order/order-evaluate?id=${this.order_id}`
				});
			},
			// 申请退款
			refund() {
				uni.navigateTo({
					url: `/pages/user/order/order-refund?order_id=${this.order_id}`
				});
			},
		},
	}
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}

	.order-detail .item text:first-child {
		width: 152rpx;
		text-align: right;
		display: inline-block;
	}

	/* 状态区 */
	.state-area {}

	/* 收货人 */
	.address-area {}

	/* 商品区 */
	.goods-area {
		&:last-child {
			margin-bottom: 0;
		}

		image {
			width: 180rpx;
			height: 180rpx;
		}
	}

	/* 订单数据区 */
	.order-area {
		.item {
			line-height: 66rpx;

			.copy {
				margin-left: 20rpx;
				padding: 10rpx 40rpx;
				background-color: #f1f1f1;
				border-radius: 40rpx;
				font-size: 24rpx;
			}
		}
	}

	/* 数据统计区 */
	.total-area {
		.item {
			line-height: 48rpx;

			text {
				padding-right: 16rpx;
			}
		}
	}

	/* 操作区 */
	.oper-area {
		width: 100%;
		height: 100rpx;
		background-color: #fff;
		position: fixed;
		z-index: 1;
		bottom: 0;
		left: 0;
		border-top: 1px solid #f0f0f0;

		.btn-area {
			font-size: $font-sm;
			color: $font-color-base;
			width: 96rpx;

			.iconfont {
				font-size: 40rpx;
				line-height: 48rpx;
			}
		}

		/* 操作按钮 */
		.action-btn {
			width: 156rpx;
			height: inherit;
			line-height: inherit;
			margin: 0;
			margin-left: 20rpx;
			padding: 12rpx 0;
			font-size: $font-sm + 2upx;
			color: $font-color-dark;
			background: #fff;
			border-radius: 100px;
			/* #ifdef MP-QQ || MP-ALIPAY */
			border: 1px solid;
			/* #endif */

			&:after {
				border-radius: 100px;
			}

			&.main-btn {
				background: #fff9f9;
				color: $base-color;

				&:after {
					border-color: #f7bcc8;
				}
			}
		}
	}
</style>
