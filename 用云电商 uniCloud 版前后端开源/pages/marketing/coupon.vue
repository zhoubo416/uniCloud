<template>
	<view class="bg-drak padding-bottom">
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" tip="无优惠券"></use-empty>

		<view v-else class="padding-lr" v-for="(item, index) in couponDatas" :key="index" @click="togoods(item)">
			<view class="coupon-area border-radius margin-top-sm bg-main">
				<view class="dflex-b">
					<view class="left pos-a h-full dflex-c dflex-flow-c">
						<view v-if="item.type == '满减'">
							<text class="price fs-big">{{ item.price }}</text>
						</view>
						<view v-if="item.type == '折扣'">
							<text class="discount fs-big">{{ item.price }}</text>
						</view>
						<view class="fs-sm" v-if="item.order_amount > 0">满{{ item.order_amount }}元使用</view>
						<view class="fs-sm" v-else>全场通用</view>

					</view>
					<view class="right padding left_t flex1">
						<view class="dflex-b padding-bottom-xs">
							<view class="fwb fs">{{ item.name }}</view>
						</view>
						<view class="dflex-b ft-dark fs-xs padding-bottom">
							<view class="">有效期至 {{ item.end_time || '2022.05.20' }}</view>
						</view>
						<view class="w-full dflex-b">
							<view class="fs-xs ft-dark padding-top-xs">{{ item.remark || '详细信息' }}</view>
							<view @tap.stop="receive(item._id)" class="dflex-b border-radius-big">
								<view class="tac padding-tb-xs padding-lr flex1 bg-base fs-xs">领取</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 上拉加载更多 -->
		<use-loadmore v-if="!empty && hasmore" :type="loadmoreType"></use-loadmore>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 加载更多状态
				loadmoreType: 'nomore', 

				// 浏览历史数据源
				couponDatas: [],
				empty: false,
				hasmore: 0,
				reqdata: {
					rows: 20,
					page: 1
				},
			};
		},
		watch: {
			couponDatas(e) {
				let empty = e.length === 0;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			}
		},
		onShow() {
			this.loadData();
		},
		methods: {
			loadData() {
				// 获取数据
				this.$func.usemall.call('marketing/coupon/list', this.reqdata).then(res => {
					if (res.code === 200) {
						this.couponDatas = [...this.couponDatas, ...res.datas];
						
						if (res.datas.length >= this.reqdata.rows) {
							if (this.reqdata.page == 1) this.hasmore = !0;
						}
						
						if(this.couponDatas.length === 0) {
							this.empty = true;
						}
					}
				});
			},
			receive(id) {
				let _this = this
				uni.showModal({
					title: '提示',
					content: '领取优惠券',
					success: function(res) {
						if (res.confirm) {
							
							_this.$func.usemall.call('marketing/coupon/receive', {
								coupon_id: id
							}).then(res => {
								if (res.code === 200) {
									_this.$api.msg('领取成功');
									return;
								}
								
								_this.$api.msg(res.msg);
							});
							
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			togoods(item) {
				return;
				this.$api.togoods({
					id: item.goods_id
				});
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}

	.coupon-area {
		position: relative;
	
		.left {
			background-color: $base-color;
			color: #fff;
			width: 30%;
	
			.price {
				color: #fff !important;
			}
		}
		.right {
			margin-left: 30%;
		}
		.discount {
			font-weight: 580;
		}
		.discount::after {
			content: '折';
			font-size: 24rpx;
			margin-left: 6rpx;
		}
	
		.border-line {
			border-bottom: 1px dotted #ededed;
		}
	}
	
</style>
