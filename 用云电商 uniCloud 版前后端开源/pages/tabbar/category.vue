<template>
	<view class="wh-full">
		<!-- 头部组件 -->
		<use-header :fixed="headerFixed" :placeholder="headerPlaceholder" :search-tip="searchTip" :search-auto="searchAuto"></use-header>

		<!-- 分类 -->
		<view class="category dflex-s h-full padding-top-big">
			<!-- 左侧一级分类 -->
			<view class="h-full left">
				<scroll-view scroll-y class="h-full">
					<view v-for="item in fdatas" :key="item._id" class="item dflex-c"
						:class="{ active: item._id === cid }" @click="fSelect(item)">{{ item.name }}</view>
				</scroll-view>
			</view>

			<!-- 右侧 1二级分类 2商品列表 -->
			<scroll-view class="h-full right bg-main" scroll-with-animation scroll-y :scroll-top="top"
				:style="{ height: scrollHeight }" @scroll="onScroll">
				<!-- 右侧二级分类 -->
				<view class="dflex-s dflex-wrap-w" v-if="mode == 1">
					<view class="item padding-bottom-sm dflex dflex-flow-c" v-if="item.pid == cid"
						v-for="item in sdatas" :key="item._id" @click="togoodslist(item)">
						<image :lazy-load="true" :src="item.img"></image>
						<text class="tac clamp margin-top-sm">{{ item.name }}</text>
					</view>
				</view>

				<!-- 右侧分类对应商品列表 -->
				<view v-if="mode == 2">
					<!-- 空白页 -->
					<use-empty v-if="empty" e-style="round" tip="无商品数据"></use-empty>

					<view v-else class="padding-lr" v-for="(item, index) in goodsDatas" :key="index"
						@click="togoods(item)">
						<view class="goods border-radius-sm padding margin-bottom-sm bg-main"
							style="padding-bottom: 15rpx;">
							<view class="goods-left">
								<image mode="aspectFill" :lazy-load="true" :src="item.img"></image>
							</view>
							<view class="margin-left-sm pos-r">
								<text class="clamp-2">{{ item.name }} {{ item.name_pw }}</text>
								<view class="pos-a price-box w-full">
									<text class="price">{{ item.price / 100 }}</text>
									<text class="m-price">{{ item.market_price / 100 }}</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 上拉加载更多 -->
					<use-loadmore v-if="!empty && hasmore" :type="loadmoreType"></use-loadmore>
					<!-- 置顶 -->
					<use-totop ref="usetop" bottom="150" :style="{ marginBottom: navHeight + 'px' }" @to="totop"></use-totop>
				</view>
			</scroll-view>
		</view>

		<!-- 切换模式 1二级分类 2商品列表 -->
		<view class="fixed-top" :style="{ marginBottom: navHeight + 'px' }" @click="changeMode">
			<text class="iconfont iconpailie" v-if="mode == 1"></text>
			<text class="iconfont iconpailie02" v-if="mode == 2"></text>
		</view>
	</view>
</template>

<script>
	const _goods = 'usemall-goods'
	const _goodscategory = 'usemall-goods-category'
	export default {
		data() {
			return {
				// 1分类列表 2商品列表
				mode: 2,
				// 兼容支付宝 height 显示 bug
				scrollHeight: '100%',

				// 头部参数
				headerPlaceholder: 0,
				headerFixed: !0,
				searchAuto: !0,
				searchTip: '请输入搜索关键字',

				// 当前选中分类ID
				cid: 0,
				// 一级数据
				fdatas: [],
				// 二级数据
				sdatas: [],

				// 商品列表
				goodsDatas: [],
				empty: false,
				hasmore: 0,
				loadmoreType: 'nomore',
				// 商品请求数据
				reqdata: {
					rows: 20,
					page: 1
				},

				top: 0,
				scrollTop: 0,
				navHeight: 0
			};
		},
		watch: {
			goodsDatas(e) {
				// 监听数据，呈现空白页
				let empty = e.length === 0;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			}
		},
		onPageScroll(e) {
			//this.scrollTop = e.scrollTop;
			this.$refs.usetop.change(e.scrollTop);
		},
		onLoad() {
			// #ifdef MP-ALIPAY
			this.scrollHeight = (this.$env.windowHeight - this.$env.sis.titleBarHeight) + 'px';
			// #endif

			// 获取存储的模式
			this.mode = uni.getStorageSync('category.mode') || 1;

			this.loadData(() => {
				if (this.mode == 2) {
					// 加载商品数据
					this.loadGoodsDatas()
				}
			});
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.loadData(() => {
				uni.stopPullDownRefresh();
			});
		},
		methods: {
			async loadData(callback) {
				this.$db[_goodscategory].where({ state: '启用' }).tolist().then(res => {
					if (res.code === 200) {
						this.fdatas = [];
						this.sdatas = [];

						res.datas.forEach(item => {
							if (!item.pid) {
								// pid为父级id, 不存在 pid || pid=0 为一级分类
								this.fdatas.push(item);
							} else {
								// 二级分类
								this.sdatas.push(item);
							}
						});

						if (this.fdatas.length > 0) {
							this.cid = this.fdatas[0]._id;
						}

						if (typeof callback === 'function') {
							// 数据加载完成回调函数
							callback();
						}
					}
				})
			},
			// 加载商品数据
			loadGoodsDatas() {
				if (this.mode != 2) {
					return;
				}
				// 根据当前 cid 加载商品数据列表
				this.reqdata.cid = this.cid;
				this.$db[_goods]
					.where(`state == "销售中"`)
					.where(`'${this.reqdata.cid}' in cids`).tolist(this.reqdata).then(res => {
						if (res.code === 200) {
							this.goodsDatas = res.datas;
							if (this.goodsDatas.length >= this.reqdata.rows) {
								if (this.reqdata.page == 1) this.hasmore = !0;
							}
							this.empty = this.goodsDatas.length === 0;
						}
					})
			},
			totop(e) {
				this.top = e.scrollTop
				this.$nextTick(function() {
					this.top = 0
				});
			},
			// 一级分类
			fSelect(item) {
				this.cid = item._id;
				this.loadGoodsDatas();
			},
			// 切换模式 1分类模式 2商品模式
			changeMode() {
				this.mode = this.mode == 1 ? 2 : 1;
				uni.setStorage({
					key: 'category.mode',
					data: this.mode
				})

				this.loadGoodsDatas();
			},
			// 跳转商品详情
			togoods(item) {
				this.$api.togoods({
					id: item._id
				});
			},
			// 跳转商品列表
			togoodslist(item) {
				this.$api.togoodslist({
					cid: item._id
				});
			},
		},
		mounted() {
			// #ifdef H5 || MP-360
			this.navHeight = 50;
			// #endif
		}
	};
</script>

<style lang="scss">
	page {
		height: 100%;
		background-color: $page-color-base;
	}

	.category {
		overflow: hidden;

		.left {
			width: 200rpx;
			background-color: $page-color-base;

			.item {
				height: 100rpx;
				color: $font-color-base;
				position: relative;

				&.active {
					color: $uni-color-primary;
					background: #fff;

					&:before {
						content: '';
						position: absolute;
						left: 0;
						top: 50%;
						transform: translateY(-50%);
						height: 36rpx;
						width: 8rpx;
						background-color: $uni-color-primary;
						opacity: 0.8;
					}
				}
			}
		}

		.right {
			flex: 1;
			overflow: hidden;
			display: block;

			.item {
				flex-shrink: 0;
				width: 33.33%;
				font-size: $font-sm + 2upx;
				color: #666;

				image {
					width: 130rpx;
					height: 130rpx;
				}
			}
		}
	}

	.goods {
		display: flex;

		.goods-left {
			image {
				width: 120rpx;
				height: 120rpx;
			}
		}

		.price-box {
			bottom: 0;
		}
	}
</style>
