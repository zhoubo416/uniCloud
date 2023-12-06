<template>
	<view class="container bg-drak" :class="{ 'margin-bottom-big': !empty }">
		<!-- 00. 未授权登录 -->
		<use-empty v-if="!islogin" e-style="round" e-type="unauthorized" tip="当前未授权" btn-tip="去登录" height="70vh"
			:auto="false" @goto="tologin"></use-empty>
		<!-- 00. 空白页 -->
		<use-empty v-else-if="empty" e-style="round" e-type="cart" tip="购物车数据为空" height="70vh"></use-empty>
		<!-- 00. 列表 -->
		<view v-else>
			<!-- 01. 购物车列表1 -->
			<view class="cart-list padding-sm">
				<block v-for="(item, index) in cartDatas" :key="index">
					<view class="cart-item bg-main margin-bottom-sm padding-lg pos-r dflex-s border-radius">
						<view class="image-wrapper pos-r" @click="togoods(item)">
							<!-- 商品图片 -->
							<image class="border-radius-xs wh-full" mode="aspectFill" :lazy-load="true"
								:src="item.goods.img">
							</image>
							<!-- 选中|未选中按钮 -->
							<view v-if="item.goods.stock_num > 0 && item.goods.stock_num >= item.goods_num"
								class="iconfont checkbox pos-a bg-main border-radius-big"
								:class="{active: item.checked, iconxuanzhongzhuangtai: item.checked, iconweixuanzhongzhuangtai: !item.checked}"
								@tap.stop="check('item', index)"></view>

							<view v-if="(item.goods.stock_num < 10 || item.goods.stock_num < item.goods_num)"
								class="disabled dflex-c dflex-flow-c pos-a pos-tl-c border-radius-c">
								<text>库存不足</text><text class="margin-left-xs fs-xs" v-if="item.stock_num > 0">剩余
									{{item.goods.stock_num}}</text>
							</view>
						</view>
						<view class="item-right padding-left pos-r">
							<!-- 商品名称 -->
							<view class="clamp-2 title" @click="togoods(item)">{{item.goods.name}}
								{{item.goods.name_pw}}
							</view>
							<view class="ft-dark fs-xs padding-top-xs">{{ item.goods_sku.spec || '&nbsp;&nbsp;' }}</view>
							<view class="padding-tb-sm">
								<text class="price">{{ item.goods.price / 100 }}</text>
								<text class="m-price"
									v-if="item.goods.market_price > 0">{{ item.goods.market_price / 100 }}</text>
							</view>

							<!-- + - 购物车数量 -->
							<use-number-box :min="1" :max="item.goods.stock_num || 1" :value="item.goods_num"
								:is-max="item.goods_num >= item.goods.stock_num" :is-min="item.goods_num === 1"
								:index="index" :disabled="item.goods_num >= item.goods.stock_num"
								@eventChange="numberChange">
							</use-number-box>
						</view>

						<!-- 删除 -->
						<view class="del-btn iconfont iconlajitong-01 pos-a border-radius-c dflex-c ft-dark fs-xl"
							@tap.stop="deleteCart(item._id)"></view>
					</view>
				</block>
			</view>

			<!-- 02. 底部操作栏 -->
			<view class="action-section dflex w-full bg-main pos-f padding-right">
				<view class="checkbox pos-r h-full dflex-c">
					<view class="padding-lr iconfont"
						:class="{active:allChecked,iconxuanzhongzhuangtai: allChecked, iconweixuanzhongzhuangtai: !allChecked}"
						@click="check('all')"></view>
					<view class="clear-btn pos-a tac ft-white" :class="{ show: allChecked }" @click="clearCart">清空
					</view>
				</view>
				<view class="total-box flex1 tar padding-right-lg">
					<text class="price">{{total || 0}}</text>
				</view>
				<button type="primary" class="payment no-border border-radius-lg fs" @click="createOrder">去结算</button>
			</view>
		</view>

		<!-- 03. 猜你喜欢 -->
		<use-hot-goods title-type="round" title="热门推荐"></use-hot-goods>
	</view>
</template>

<script>
	const db = uniCloud.database();
	const _cart = 'usemall-goods-cart'
	import { mapState } from 'vuex';
	export default {
		computed: {
			...mapState(['islogin'])
		},
		data() {
			return {
				// 空白页
				empty: false,
				// 购物车数据
				cartDatas: [],
				// 全选状态
				allChecked: false,
				// 总价格
				total: 0,
			};
		},
		watch: {
			//显示空白页
			cartDatas(e) {
				let empty = e.length === 0;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			}
		},
		// 监听页面显示。页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面
		onShow() {
			this.loadData();
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.loadData(() => {
				uni.stopPullDownRefresh();
			});
		},

		methods: {
			//请求数据
			async loadData(callback) {
				
				// 更改为临时表方式查询
				const goodsTemp = db.collection('usemall-goods').getTemp();
				const goodsSkuTemp = db.collection('usemall-goods-sku').getTemp();
				
				db.collection(_cart, goodsTemp, goodsSkuTemp)
					.where('create_uid == $env.uid')
					.field(
						'_id, goods_num, goods_sku.spec, goods.price, goods.market_price, goods.stock_num, goods.name,goods.name_pw ,last_modify_time, goods._id as goods_id, goods.img, goods.state'
					)
					.orderBy('last_modify_time desc')
					.get()
					.then(res => {
						if (res && res.result && res.result.errCode === 0) {
							let _cartDatas = [];
							res.result.data.forEach(x => {
								x.goods = x.goods[0];
								x.goods_id = x.goods_id[0];
								x.goods_sku = x.goods_sku[0] || {};
								
								if (x.goods && x.goods_id) _cartDatas.push(x);
							});
							// 购物车数据
							this.cartDatas = _cartDatas;
							// 计算总价
							this.calcTotal();

							if (typeof callback === 'function') {
								// 数据加载完成回调函数
								callback();
							}
						}
					})
				return;
			},
			// 跳转登录页
			tologin() {
				this.$api.tologin();
			},
			// 跳转商品页
			togoods(item) {
				this.$api.togoods({
					id: item.goods_id
				});
			},

			// 选中状态处理
			check(type, index) {
				if (type === 'item') {
					this.cartDatas[index].checked = !this.cartDatas[index].checked;
				} else {
					const checked = !this.allChecked
					this.cartDatas.forEach(item => {
						item.checked = checked;
					})
					this.allChecked = checked;
				}

				this.calcTotal();
			},
			// +- 数量
			numberChange(data) {
				let cart = this.cartDatas[data.index];

				this.$db[_cart].update(cart._id, {
					goods_num: data.number
				}).then(res => {
					if (res.code === 200) {
						cart.goods_num = data.number;
						this.calcTotal();
						return;
					}
					this.$api.msg(res.msg);
				});
			},
			// 删除
			deleteCart(id) {
				let _this = this
				uni.showModal({
					title: '提示',
					content: '删除购物车',
					success: function(res) {
						if (res.confirm) {
							_this.$db[_cart].where('create_uid == $env.uid').remove(id)
								.then(res => {
									if (res.code === 200) {
										_this.loadData();
									}
								})
						} else if (res.cancel) {
						}
					}
				});
			},
			// 清空
			clearCart() {
				let _this = this;
				uni.showModal({
					title: '提示',
					content: '清空购物车',
					success: function(res) {
						if (res.confirm) {
							_this.$db[_cart].where('create_uid == $env.uid').remove()
								.then(res => {
									if (res.code === 200) {
										_this.cartDatas = [];
										return;
									}
									_this.$api.msg(res.msg)
								})
						} else if (res.cancel) {
						}
					}
				});
			},
			// 计算总价
			calcTotal() {
				if (this.cartDatas.length === 0) {
					this.empty = true;
					return;
				}

				let total = 0,
					checked = true;

				this.cartDatas.forEach(item => {
					if (item.checked) {
						// 存在库存
						if (item.goods.stock_num > 0 && item.goods.stock_num >= item.goods_num) {
							total += (item.goods.price / 100) * item.goods_num;
						}
					} else if (checked) {
						checked = false;
					}
				})

				this.allChecked = checked;
				this.total = Number(total.toFixed(2));
			},
			// 创建订单
			createOrder() {
				let cart_ids = [];
				this.cartDatas.forEach(item => {
					// 选中有库存购物车
					if (item.checked && item.goods.stock_num > 0 && item.goods.stock_num > item.goods_num) {
						cart_ids.push(item._id)
					}
				})
				if (cart_ids.length <= 0) {
					this.$api.msg('请选择结算商品')
					return;
				}
				uni.navigateTo({
					url: `/pages/order/create?cart_ids=${cart_ids.join(',')}`
				})
			},
		},
	}
</script>

<style lang='scss'>
	page {
		min-height: 100%;
	}

	/* 购物车列表项 */
	.cart-item {

		&:last-child {
			margin-bottom: 0;
		}

		.image-wrapper {
			width: 230rpx;
			height: 230rpx;
			flex-shrink: 0;

			image {
				opacity: 1;
			}
		}

		.checkbox {
			top: -16rpx;
			left: -16rpx;
			color: $font-color-disabled;
			line-height: 1;
			font-size: 46rpx;
			padding: 5rpx;
			z-index: 8;
		}

		.disabled {
			color: #fff !important;
			width: 70%;
			height: 70%;
			background-color: rgba(51, 51, 51, 0.5);
		}

		.item-right {
			height: 260rpx;
			overflow: hidden;
		}

		.del-btn {
			bottom: 40rpx;
			right: 30rpx;
			width: 70rpx;
			height: 70rpx;
		}
	}

	/* 底部栏 */
	.action-section {
		z-index: 999;
		bottom: 0;
		height: 100rpx;

		.checkbox {
			.iconfont {
				font-size: 46rpx;
				color: #2C405A;
			}
		}

		.clear-btn {
			left: 100rpx;
			background: #2C405A;
			border-radius: 0 50rpx 50rpx 0;
			padding: 12rpx 0;
			transition: all .2s;

			width: 0;
			opacity: 0;

			&.show {
				width: 120rpx;
				opacity: 1;
			}
		}

		.payment {
			padding: 0 40rpx;
			font-size: $font-base;
			background: $uni-color-primary;
			box-shadow: 1px 2px 5px rgba(217, 60, 93, 0.72)
		}
	}

	/* #ifdef H5 || MP-360 */
	.action-section {
		margin-bottom: 50px;
	}

	/* #endif */
</style>
