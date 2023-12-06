<template>
	<view class="container">
		<!-- #ifdef MP-ALIPAY -->
		<!-- 订单状态区 -->
		<view class="pos-f w-full state-area dflex navbar-area bg-main">
			<view class="nav-item dflex-c pos-r fs h-full" :class="{ active: tabCurrentIndex === index }"
				v-for="(item, index) in navList" :key="index" @click="tabClick(index)">
				{{ item.state }}
			</view>
		</view>

		<!-- 订单轮播区 -->
		<view class="order-area w-full" style="margin-top: 7vh;">
			<!-- 空白页 -->
			<use-empty v-if="navData.orderList.length === 0 && navData.loaded" e-style="round" e-type="cart"
				tip="订单数据为空" height="93vh"></use-empty>
			<!-- 订单列表区 -->
			<view class="padding-lr margin-bottom-sm" :class="index === 0 ? 'padding-top-sm' : ''"
				v-for="(item, index) in navData.orderList" :key="index">
				<!-- 订单项 -->
				<view class="order-item padding bg-main border-radius">
					<view @click="todetail(item.order)">
						<!-- 订单商品明细 -->
						<view class="goods-area" :class="{ 'margin-top': goodsIndex > 0 }"
							v-for="(goodsItem, goodsIndex) in item.order_detail" :key="goodsIndex">
							<image :src="goodsItem.goods_img" mode="aspectFill"></image>
							<view class="right flex1">
								<text class="clamp-2">{{ goodsItem.goods_name }} {{ goodsItem.goods_name_pw }}</text>
								<view class="ft-dark fs-xs padding-top-xs">
									<text class="margin-right">× {{goodsItem.goods_num}}</text>
									{{ goodsItem.goods_sku_name || '&nbsp;&nbsp;' }}
								</view>
								<view class="margin-top-sm">
									<text class="price ft-main fs-sm">{{ goodsItem.goods_price / 100 }}</text>
								</view>
							</view>
						</view>

						<!-- 实付款 -->
						<view class="dflex-e">
							<text class="fs-xs margin-right-xs">实付款</text>
							<text class="price ft-main">{{ item.order.order_actural_paid / 100 }}</text>
						</view>
					</view>

					<!-- 订单操作区 -->
					<view class="dflex-b margin-top-sm">
						<view>
							<!-- 当前状态 -->
							<text class="ft-dark" v-if="item.order.order_refund_state == '处理中'">退款处理中</text>
							<text class="ft-dark"
								v-else-if="item.order.order_refund_state">{{ item.order.order_refund_state }}</text>
							<text class="ft-dark" v-else-if="item.order.state == '待评价'">已发货</text>
							<text class="ft-dark" v-else>{{ item.order.state }}</text>
						</view>

						<view class="dflex-e">
							<view class="dflex" v-if="item.order.state == '待付款'">
								<button class="action-btn border-radius-big bg-main"
									@click="cancelOrder(item)">取消订单</button>

								<button v-if="item.order.order_pay_state == '待付款'"
									class="action-btn border-radius-big bg-main main-btn"
									@click="payment(item.order)">立即支付</button>
								<button v-if="item.order.order_pay_state == '待核实'"
									class="action-btn border-radius-big bg-main main-btn"
									@click="payment(item.order)">待核实</button>
							</view>
							<view class="dflex" v-if="item.order.state == '待发货'">
								<button v-if="!item.order.order_refund_state"
									class="action-btn border-radius-big bg-main" @click="torefund(item)">申请退款</button>
							</view>
							<button v-if="!item.order.order_refund_state && 
										['待收货', '待评价', '已完成'].includes(item.order.state)" 
								class="action-btn border-radius-big bg-main" @click="toexpress(item)">查看物流</button>
							<view class="dflex" v-if="item.order.state == '待收货'">
								<button v-if="!item.order.order_refund_state"
									class="action-btn border-radius-big bg-main main-btn"
									@click="toreceipt(item)">确认收货</button>
							</view>
							<view class="dflex" v-if="item.order.state == '待评价'">
								<button class="action-btn border-radius-big bg-main main-btn"
									@click="toevaluate(item)">我要评价</button>
							</view>
							<view class="dflex" v-if="['已取消', '已完成'].includes(item.order.state)">
								<button class="action-btn border-radius-big bg-main main-btn"
									@click="delOrder(item)">删除订单</button>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 上拉加载更多 -->
			<use-loadmore v-if="navData.orderList.length > 0 && navData.loaded && navData.hasmore"
				:type="navData.loadingType"></use-loadmore>

		</view>
		<!-- #endif -->

		<!-- #ifndef MP-ALIPAY -->
		<!-- 订单状态区 -->
		<!-- <scroll-view scroll-x="true" class="navbar-area bg-main" :scroll-left="scrollLeft"> -->
		<view class="state-area dflex navbar-area bg-main">
			<view class="nav-item dflex-c pos-r fs h-full" :class="{ active: tabCurrentIndex === index }"
				v-for="(item, index) in navList" :key="index" @click="tabClick(index)">
				{{ item.state }}
			</view>
		</view>
		<!-- </scroll-view> -->

		<!-- 订单轮播区 -->
		<swiper class="swiper-area w-full" :duration="0" :current="tabCurrentIndex" @change="changeTab">
			<!-- 轮播项对应订单状态 -->
			<swiper-item class="tab-content wh-full" v-for="(tabItem, tabIndex) in navList" :key="tabIndex">
				<!-- 滚动区 -->
				<scroll-view class="h-full" scroll-y @scrolltolower="loadData">
					<!-- 空白页 -->
					<use-empty v-if="tabItem.orderList.length === 0 && tabItem.loaded" e-style="round" e-type="cart"
						tip="订单数据为空" height="93vh"></use-empty>
					<!-- 订单列表区 -->
					<view class="padding-lr margin-bottom-sm" :class="index === 0 ? 'padding-top-sm' : ''"
						v-for="(item, index) in tabItem.orderList" :key="index">
						<!-- 订单项 -->
						<view class="order-item padding bg-main border-radius">
							<view @click="todetail(item.order)">
								<!-- 订单商品明细 -->
								<view class="goods-area" :class="{ 'margin-top': goodsIndex > 0 }"
									v-for="(goodsItem, goodsIndex) in item.order_detail" :key="goodsIndex">
									<image :src="goodsItem.goods_img" mode="aspectFill"></image>
									<view class="right flex1">
										<text class="clamp-2">{{ goodsItem.goods_name }}
											{{ goodsItem.goods_name_pw }}</text>
										<view class="ft-dark fs-xs padding-top-xs">
											<text class="margin-right">× {{goodsItem.goods_num}}</text>
											{{ goodsItem.goods_sku_name || '&nbsp;&nbsp;' }}
										</view>
										<view class="margin-top-sm">
											<text class="price ft-main fs-sm">{{ goodsItem.goods_price / 100}}</text>
										</view>
									</view>
								</view>

								<!-- 实付款 -->
								<view class="dflex-e">
									<text class="fs-xs margin-right-xs">实付款</text>
									<text class="price ft-main">{{ item.order.order_actural_paid / 100}}</text>
								</view>
							</view>

							<!-- 订单操作区 -->
							<view class="dflex-b margin-top-sm">
								<view>
									<!-- 当前状态 -->
									<text class="ft-dark" v-if="item.order.order_refund_state == '处理中'">退款处理中</text>
									<text class="ft-dark"
										v-else-if="item.order.order_refund_state">{{ item.order.order_refund_state }}</text>
									<text class="ft-dark" v-else-if="item.order.state == '待评价'">已发货</text>
									<text class="ft-dark" v-else>{{ item.order.state }}</text>
								</view>

								<view class="dflex-e">
									<view class="dflex" v-if="item.order.state == '待付款'">
										<button class="action-btn border-radius-big bg-main"
											@click="cancelOrder(item)">取消订单</button>

										<button v-if="item.order.order_pay_state == '待付款'"
											class="action-btn border-radius-big bg-main main-btn"
											@click="payment(item.order)">立即支付</button>
										<button v-if="item.order.order_pay_state == '待核实'"
											class="action-btn border-radius-big bg-main main-btn"
											@click="payment(item.order)">待核实</button>
									</view>
									<view class="dflex" v-if="item.order.state == '待发货'">
										<button v-if="!item.order.order_refund_state"
											class="action-btn border-radius-big bg-main"
											@click="torefund(item)">申请退款</button>
									</view>
									<button v-if="!item.order.order_refund_state && 
										['待收货', '待评价', '已完成'].includes(item.order.state)" 
										class="action-btn border-radius-big bg-main" 
										@click="toexpress(item)">查看物流</button>
									<view class="dflex" v-if="item.order.state == '待收货'">
										<button v-if="!item.order.order_refund_state"
											class="action-btn border-radius-big bg-main main-btn"
											@click="toreceipt(item)">确认收货</button>
									</view>
									<view class="dflex" v-if="item.order.state == '待评价'">
										<button class="action-btn border-radius-big bg-main main-btn"
											@click="toevaluate(item)">我要评价</button>
									</view>
									<view class="dflex" v-if="['已取消', '已完成'].includes(item.order.state)">
										<button class="action-btn border-radius-big bg-main main-btn" @click="delOrder(item)">删除订单</button>
									</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 上拉加载更多 -->
					<use-loadmore v-if="tabItem.orderList.length > 0 && tabItem.loaded && tabItem.hasmore"
						:type="tabItem.loadingType"></use-loadmore>
				</scroll-view>
			</swiper-item>
		</swiper>
		<!-- #endif -->

	</view>
</template>


<script>
	const _order = 'usemall-order'
	import {
		mapState
	} from 'vuex';

	export default {
		data() {
			return {
				tabCurrentIndex: 0,
				navData: {},
				navList: [{
						id: 0,
						state: '全部',
						loadingType: 'more',
						orderList: []
					},
					{
						id: 1,
						state: '待付款',
						loadingType: 'more',
						orderList: []
					},
					{
						id: 2,
						state: '待发货',
						loadingType: 'more',
						orderList: []
					},
					{
						id: 3,
						state: '待收货',
						loadingType: 'more',
						orderList: []
					},
					{
						id: 4,
						state: '待评价',
						loadingType: 'more',
						orderList: []
					},
				],
				reqdata: {
					page: 1,
					rows: 10
				},
				scrollLeft: 0,
				title: '全部'
			};
		},
		watch: {
			tabCurrentIndex(nv, ov) {
				this.loadData('tab_change', 1);
			}
		},
		onShow(options) {
			let _this = this;
			if (!this.islogin) {
				uni.showModal({
					title: '授权登录',
					success: function(res) {
						if (res.confirm) {
							_this.$api.tologin();
						} else if (res.cancel) {
							_this.$api.tohome();
						}
					}
				});
				return;
			}

			let state = '';

			uni.getStorage({
				key: '__order_state',
				success(res) {
					state = res.data;

					let cur_nav = _this.navList.find(x => x.state == state);
					if (cur_nav) {
						_this.tabCurrentIndex = cur_nav.id;
					}

					uni.removeStorage({
						key: '__order_state'
					});
				},
				complete() {
					_this.loadData('refresh');
				}
			});
		},

		onLoad(options) {
			uni.$on('__event_order', res => {
				if (res == 'refresh') {
					this.loadData('refresh');
				}
			});
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.loadData('refresh');
		},
		// 上拉加载更多
		onReachBottom() {
			this.loadData();
		},
		computed: {
			...mapState(['islogin'])
		},
		methods: {
			// 获取订单列表
			async loadData(source = 'add', loading) {
				// 获取当前 nav
				let cur_nav = this.navList[this.tabCurrentIndex];
				this.title = cur_nav.state;
				console.log(this.title);
				console.log('loadData cur_nav', cur_nav);

				if (cur_nav.loadingType === 'loading') {
					//防止重复加载
					return;
				}

				this.reqdata.state = cur_nav.state;
				if (loading == 1 || source == 'refresh') {
					this.reqdata.page = 1;
				}
				if (source.type) {
					source.type = source.type.toLowerCase();
				}
				if (source === 'add' || source.type == 'scrolltolower') {
					if (cur_nav.loadingType == 'nomore') {
						return;
					}
					cur_nav.loadingType = 'loading';
				} else {
					cur_nav.loadingType = 'more';
				}

				await this.$func.usemall.call('order/list', this.reqdata).then(res => {
					if (res.code === 200) {

						cur_nav.loaded = true;

						if (res.code === 200) {
							if (loading == 1 || source == 'refresh') {
								cur_nav.orderList = [];
								cur_nav.hasmore = 0;
							}

							if (res.datas.length > 0) {
								let __datas = [];
								res.datas.forEach(row => {
									__datas.push(row);
								});

								cur_nav.orderList = [...cur_nav.orderList, ...__datas];

								if (res.datas.length >= this.reqdata.rows) {
									if (this.reqdata.page == 1) {
										cur_nav.hasmore = !0;
									}
									this.reqdata.page++;
									cur_nav.loadingType = 'more';
								} else {
									cur_nav.loadingType = 'nomore';
								}
							} else {
								cur_nav.loadingType = 'nomore';
							}
						}

						if (loading == 1) {
							uni.hideLoading();
						} else if (source == 'refresh') {
							uni.stopPullDownRefresh();
						}

						this.navData = cur_nav;
					}
				})
			},

			// swiper 切换
			changeTab(e) {
				this.tabCurrentIndex = e.target.current;

			},
			//顶部tab点击
			tabClick(index) {
				this.tabCurrentIndex = index;
			},

			// 点击跳转详情页面
			todetail(order) {
				uni.navigateTo({
					url: `/pages/user/order/order-detail?order_id=${order.order_id}`
				});
			},
			// 立即支付
			payment(order) {
				if (order.order_pay_state == '待核实') {
					this.$api.msg('订单已支付待核实状态');
					return;
				}

				this.$api.topay({
					order_id: order.order_id,
					money: order.order_actural_paid
				});
			},
			// 删除订单
			delOrder(item) {
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
								order_id: item.order.order_id,
							}).then(res => {
								if (res.code === 200) {
									_this.loadData('tab_change', 1);
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
			cancelOrder(item) {
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
								order_id: item.order.order_id,
								state: '已取消'
							}).then(res => {
								if (res.code === 200) {
									_this.loadData('tab_change', 1);
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
			// 查看物流
			toexpress(item) {
				// this.$api.msg('查看物流开发中');
				uni.navigateTo({
					url: `/pages/user/order/order-express?order_id=${item.order.order_id}`
				});
			},
			// 已发货
			toreceipt(item) {
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
								order_id: item.order.order_id,
								state: '待评价'
							}).then(res => {
								_this.loadData('tab_change', 1);
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
			// 申请退款
			torefund(data) {
				uni.navigateTo({
					url: `/pages/user/order/order-refund?order_id=${data.order.order_id}`
				});
			},
			// 评价
			toevaluate(item) {
				uni.navigateTo({
					url: `/pages/user/order/order-evaluate?id=${item.order.order_id}`
				});
			}
		}
	};
</script>

<style lang="scss">
	page,
	.container {
		min-height: 100%;
		background: $page-color-base;
	}

	/* 订单状态区 */
	.navbar-area {
		white-space: nowrap;
	}

	.state-area {
		height: 7vh;
		box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
		z-index: 10;
		top: 0;
	}

	.nav-item {
		flex: 1;

		&.active {
			&:after {
				content: '';
				position: absolute;
				left: 50%;
				transform: translate(-50%);
				bottom: 0;
				width: 44px;
				height: 0;
				border-bottom: 2px solid $base-color;
			}
		}
	}

	/* 订单轮播区 */
	.swiper-area {
		height: 93vh;
	}

	/* 订单区 */
	.order-area {}


	/* 订单项 */
	.order-item {

		/* 订单商品明细区 */
		.goods-area {
			display: flex;

			image {
				width: 180rpx;
				height: 180rpx;
			}

			.right {
				padding: 0 30upx 0 24upx;
				overflow: hidden;

				.attr-box {
					font-size: $font-sm + 2upx;
					color: $font-color-light;
					padding: 10upx 12upx;
				}
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
