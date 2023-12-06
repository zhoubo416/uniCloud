<template>
	<view>
		<!-- 收货人 -->
		<view class="gap"></view>
		<use-list-title v-if="!(addrData && addrData._id)" color="#333" title="选择收货人" iconfont="icondizhi-" @goto="toaddr"></use-list-title>
		<view v-else class="padding dflex-b bg-main" @click="toaddr">
			<view class="dflex">
				<view class="iconfont icondizhi- margin-right ft-main"></view>
				<view class="w-full dflex-wrap-w">
					<view class="margin-bottom-xs">
						<text>{{ addrData.address }} {{ addrData.addr_detail }}</text>
					</view>
					<view>
						<text>{{ addrData.consignee }}</text>
						<text class="margin-left">{{ addrData.mobile }}</text>
					</view>
				</view>
			</view>

			<view class="iconfont iconjiantou-01 fs-sm"></view>
		</view>
		<view class="gap"></view>

		<view class="goods-area bg-main padding">
			<!-- 商品列表 -->
			<view class="goods-item" :class="{ 'margin-top': index > 0 }" v-for="(item, index) in goodsDatas"
				:key="index">
				<view class="pos-r">
					<image mode="aspectFill" :src="item.goods.img"></image>
					<view v-if="(item.goods.stock_num < 10 || item.goods.stock_num < item.goods.goods_num)"
						class="disabled dflex-c dflex-flow-c pos-a pos-tl-c border-radius-c">
						<text>库存不足</text><text class="margin-left-xs fs-xs" v-if="item.goods.stock_num > 0">剩余
							{{item.goods.stock_num}}</text>
					</view>
				</view>
				<view class="flex1 padding-left-sm">
					<text class="title clamp-2">{{ item.goods.name || '' }} {{ item.goods.name_pw || '' }}</text>
					<view class="ft-dark fs-xs padding-top-xs">
						<text v-if="cart_ids && cart_ids.length > 0" class="margin-right">× {{item.cart.goods_num}}</text>
						{{ (item.goods_sku && item.goods_sku.spec) || '&nbsp;&nbsp;' }}
					</view>
					<view class="pos-r dflex-b padding-top">
						<view class="price flex1">{{ item.goods.price / 100 || '' }}</view>

						<!-- + - 数量 -->
						<use-number-box v-if="!(cart_ids && cart_ids.length > 0)" :min="1" :max="item.goods.stock_num"
							:value="item.goods.goods_num > item.goods.stock_num ? item.goods.stock_num : item.goods.goods_num"
							:is-max="item.goods.goods_num >= item.goods.stock_num" :is-min="item.goods.goods_num === 1"
							:index="index" direction="right" @eventChange="numberChange"></use-number-box>
					</view>
				</view>
			</view>
		</view>
		<view class="gap"></view>

		<!-- 优惠券 -->
		<use-list-title title="优惠券" :tip="couponName" color="#333" iconfont="iconyouhui" @goto="couponShow = true">
		</use-list-title>
		<!-- 优惠券弹出层 -->
		<use-popup mode="bottom" v-model="couponShow" @open="couponOpen">
			<!-- 优惠券区 -->
			<view class="coupon-area padding bg-drak">
				<view class="coupon-item bg-main pos-r fs-xs" v-for="(item, index) in couponDatas" :key="index">
					<view class="content pos-r padding dflex-b">
						<view class="">
							<view class="margin-bottom-xs fs">{{ item.name }}</view>
							<view class="ft-dark">有效期至 {{ item.end_time.split(' ')[0] }}</view>
						</view>
						<view class="tar">
							<view class="margin-bottom-xs price">{{ item.price }}</view>
							<view v-if="item.order_amount > 0" class="ft-dark">满{{ item.order_amount }}可用</view>
							<view v-else class="ft-dark">不限</view>
						</view>

						<view class="circle l"></view>
						<view class="circle r"></view>
					</view>
					<view class="dflex-b">
						<text class="ft-dark padding-lr">{{ item.type }}</text>
						<text class="ft-base padding-tb-sm padding-lr" @click="couponUse(item)">立即使用</text>
					</view>
				</view>
				<view v-if="!couponDatas || couponDatas.length <= 0" class="coupon-none">
					<text class="coupon-none-tip">开发中!!!!!</text>
				</view>
			</view>
		</use-popup>
		<view class="gap"></view>

		<!-- 金额明细 -->
		<view class="bg-main">
			<view class="dflex-b padding-lr padding-tb-sm">
				<view class="flex1">总金额</view>
				<view class=""><text style="font-size: 24rpx;">￥</text>{{ goods_money }}</view>
			</view>

			<view v-if="total_coupon_money > 0" class="dflex-b padding-lr padding-tb-sm">
				<view class="flex1">优惠金额</view>
				<view class="ft-base">-￥{{ total_coupon_money }}</view>
			</view>

			<view class="dflex-b padding-lr padding-tb-sm">
				<view class="margin-right-xl">备注</view>
				<input class="flex1 padding-sm" type="text" v-model="order_desc" placeholder="请填写买家备注"
					placeholder-class="placeholder" />
			</view>
		</view>
		<view class="gap"></view>

		<!-- 底部  -->
		<view class="oper-area pos-f pos-bottom w-full dflex-b bg-main safe-area-inset-bottom padding-left">
			<view>
				<text class="fs-sm">实付款</text>
				<text class="price margin-left-sm fs-xl">{{ total_money }}</text>
			</view>
			<view class="submit dflex-c bg-base fs animated-all" :class="is_submit === 1 ? 'bg-disabled' : ''" @click="submit">提交订单</view>
		</view>
	</view>
</template>

<script>
	// 收获人地址
	const _address = 'usemall-member-address'
	export default {
		data() {
			return {
				// 收货地址
				addrData: {},
				// 商品数据
				goodsDatas: [],
				// 产品金额
				goods_money: 0,

				// 优惠券
				couponShow: false,
				couponName: '选择优惠券',
				couponDatas: [],
				// 优惠券类型 满减|折扣
				coupon_type: '满减',
				// 优惠券金额
				coupon_money: 0,
				// 实付金额
				total_money: 0,
				// 优惠金额
				total_coupon_money: 0,

				// 购物车 ids
				cart_ids: [],
				// 商品 id
				goods_id: 0,
				// 商品数量
				goods_num: 1,
				// 商品 sku id
				goods_sku_id: 0,
				// 使用优惠券ID
				order_coupon_id: 0,
				// 买家备注
				order_desc: '',

				is_submit: 1,
				platform: '',
				platform_name: ''
			};
		},
		onLoad(options) {
			let _this = this;
			this.$api.get_env(res => {
				this.platform = res.platform;
				this.platform_name = res.platform_name;
			});

			// 商品 ids
			this.goods_id = options.goods_id || '';
			// 商品 sku
			this.goods_sku_id = options.sku_id || '';

			// 购物车 ids
			if (options.cart_ids) {
			this.cart_ids = options.cart_ids.split(',');
}
			// 加载商品数据
			this.loadData();

			uni.$on('__event_choice_address', data => {
				this.addrData = data;
			});
		},
		onShow() {
			if (this.addrData && this.addrData._id) return;
			this.$db[_address].where('create_uid == $env.uid').tofirst()
				.then(res => {
					console.log('res', res);
					if (res && res.code === 200) {
						this.addrData = res.datas;
					}
				})

		},
		methods: {
			// 加载数据
			loadData() {
				this.$func.usemall.call('goods/detail2order', {
					cart_ids: this.cart_ids,
					goods_id: this.goods_id,
					goods_sku_id: this.goods_sku_id
				}).then(res => {
					if (res.code === 200) {
						this.goodsDatas = res.datas;
						this.calcTotalMoney();
						this.is_submit = 0;
						return;
					}

					this.$api.msg(res.msg);
				})
			},
			// 计算实际支付 总金额
			calcTotalMoney() {
				// 服务项总金额
				let service_money = 0;

				this.goods_money = 0;
				this.goodsDatas.forEach(x => {
					if (x.goods_sku && x.goods_sku.price) {
						x.goods.price = x.goods_sku.price;
						x.goods.stock_num = x.goods_sku.stock_num;
					}
					if (x.cart && x.cart.goods_num) {
						x.goods.goods_num = x.cart.goods_num;
					}

					this.goods_money += (x.goods.price / 100) * x.goods.goods_num;
				});

				// 商品金额 + 服务金额 - 优惠金额
				if (this.coupon_type == '满减') {
					this.total_coupon_money = this.coupon_money;
					this.total_money = (this.goods_money + service_money - this.coupon_money).toFixed(2);
				} else if (this.coupon_type == '折扣') {
					this.total_coupon_money = (this.goods_money + service_money) - ((this.goods_money + service_money) *
						this.coupon_money).toFixed(2);
					this.total_money = ((this.goods_money + service_money) * this.coupon_money).toFixed(2);
				}
			},
			// +- 下单数量
			numberChange(options) {
				let data = this.goodsDatas[options.index];
				data.goods.goods_num = options.number;

				if (this.goods_id) this.goods_num = options.number;

				this.calcTotalMoney();
			},
			// 打开优惠券
			couponOpen() {
				let _this = this;
				// 加载可使用优惠券数据 couponDatas
				
			},
			// 使用优惠券
			couponUse(coupon) {
				let _this = this;

				_this.order_coupon_id = coupon._id;
				_this.coupon_money = coupon.price;
				_this.coupon_type = coupon.type;
				_this.couponName = coupon.name;

				_this.calcTotalMoney();

				_this.couponShow = false;
			},
			// 提交订单
			submit() {
				if (!(this.addrData && this.addrData._id)) {
					this.$api.msg('请选择收货人');
					return;
				}

				if (this.is_submit) {
					this.$api.msg('提交中');
					return;
				}
				this.is_submit = 1;

				let _this = this;

				let obj = {
					cart_ids: _this.cart_ids,

					goods_id: _this.goods_id,
					goods_num: _this.goods_num,
					goods_sku_id: _this.goods_sku_id,

					order_coupon_id: _this.order_coupon_id,
					order_integral: 0,
					order_use_integral: 0,
					addr_id: _this.addrData._id,
					order_from: _this.platform_name,
					order_desc: _this.order_desc
				};
				
				this.$func.usemall.call('order/create', obj).then(res => {
					if (res.code === 200) {
						// 跳转支付页
						_this.$api.topay({
							order_id: res.datas.order_id,
							money: res.datas.money,
							type: 'redirect'
						});
						return;
					}
					
					_this.$api.msg(res.msg);
					_this.$api.timerout(() => {
						_this.is_submit = 0;
					}, 800);
				})
			},
			// 选择收货人
			toaddr() {
				uni.navigateTo({
					url: '/pages/user/address/address?source=1',
					complete() {}
				});
			},
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
		padding-bottom: 100rpx;
	}

	.goods-area {
		.goods-item {
			display: flex;

			.disabled {
				color: #fff !important;
				width: 70%;
				height: 70%;
				background-color: rgba(51, 51, 51, 0.5);
			}

			image {
				flex-shrink: 0;
				display: block;
				width: 180rpx;
				height: 180rpx;
				border-radius: 4rpx;
			}
		}
	}

	.oper-area {
		z-index: 998;
		box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);

		.submit {
			width: 280rpx;
			height: 100rpx;
		}
	}

	/* 优惠券区 */
	.coupon-area {
		max-height: 60vh;
		overflow: auto;

		.coupon-item {
			margin-bottom: 20rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.content {
				&:after {
					position: absolute;
					left: 0;
					bottom: 0;
					content: '';
					width: 100%;
					height: 0;
					border-bottom: 1px dashed #f3f3f3;
					transform: scaleY(50%);
				}
			}

			.circle {
				position: absolute;
				bottom: -10rpx;
				z-index: 10;
				width: 20rpx;
				height: 20rpx;
				background: #f5f5f5;
				border-radius: 50%;

				&.r {
					right: -6rpx;
				}

				&.l {
					left: -6rpx;
				}
			}
		}
	}

	.coupon-none {
		width: 100%;
		height: 100%;
		line-height: 30vh;
		display: flex;
		align-items: center;
		justify-content: center;

		.coupon-none-tip {
			color: #909399;
		}
	}
</style>
