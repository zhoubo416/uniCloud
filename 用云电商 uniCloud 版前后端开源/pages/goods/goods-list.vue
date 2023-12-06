<template>
	<view :class="!empty ? 'padding-top-big' : '' ">

		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" e-type="search" tip="搜索数据为空" btn-tip="重新搜索" height="70vh" :auto="false"
			@goto="tosearch"></use-empty>

		<!-- 列表区 -->
		<view v-else>
			<!-- 筛选区 -->
			<view class="navbar pos-f w-full dflex bg-main" :style="{ position: headerPosition }">
				<view class="nav-item dflex-c flex1 pos-r h-full" :class="{active: filterIndex === 0}"
					@click="navbarClick(0)">
					综合排序
				</view>
				<view class="nav-item dflex-c flex1 pos-r h-full" :class="{active: filterIndex === 1}"
					@click="navbarClick(1)">
					销量优先
				</view>
				<view class="nav-item dflex-c flex1 pos-r h-full" :class="{active: filterIndex === 2}"
					@click="navbarClick(2)">
					<text>价格</text>
					<view class="">
						<view class="iconfont iconjiantou02 ft-dark dflex-c"
							:class="{active: priceOrder === 1 && filterIndex === 2}"></view>
						<view class="iconfont iconjiantou ft-dark dflex-c"
							:class="{active: priceOrder === 2 && filterIndex === 2}"></view>
					</view>
				</view>
			</view>

			<!-- 商品列表区 -->
			<view class="goods-list">
				<view class="list dflex-b dflex dflex-wrap-w w-full">
					<view class="item bg-main border-radius-sm padding-bottom-sm" v-for="(item, index) in goodsDatas"
						:key="index" @click="togoods(item)">
						<view class="image-wrapper">
							<image mode="aspectFill" :lazy-load="true" :src="item.img"></image>
						</view>
						<text class="title clamp padding-sm">{{ item.name }}</text>
						<view class="padding-left-sm dflex-b">
							<text class="price">{{ item.price / 100 }}</text>
							<text class="ft-dark margin-right-sm fs-xs">已售 {{item.sale_cnt }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 上拉加载更多 -->
			<use-loadmore :type="loadmoreType"></use-loadmore>
		</view>

		<!-- 置顶 -->
		<use-totop ref="usetop"></use-totop>

		<!-- 03. 猜你想要 -->
		<use-hot-goods v-if="empty" title-type="round" title="猜你想要"></use-hot-goods>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				empty: false,
				headerPosition: "fixed",
				// 0综合排序 1销量优先 2价格排序
				filterIndex: 0,
				// 1价格从低到高 2价格从高到低
				priceOrder: 0,
				// 商品数据
				goodsDatas: [],
				// 加载更多状态
				loadmoreType: 'more',
				// 请求数据
				reqdata: {
					page: 1,
					rows: 8,
					sidx: 'sort',
					sord: 'asc'
				},
				scrollTop: 0,
			};
		},
		watch: {
			// 显示空白页
			goodsDatas(e) {
				let empty = e.length === 0;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			}
		},
		onPageScroll(e) {
			// 兼容iOS端下拉时顶部漂移
			if (e.scrollTop >= 0) {
				this.headerPosition = "fixed";
			} else {
				this.headerPosition = "absolute";
			}
			// this.scrollTop = e.scrollTop
			this.$refs.usetop.change(e.scrollTop);
		},
		//下拉刷新
		onPullDownRefresh() {
			this.loadData('refresh');
		},
		//加载更多
		onReachBottom() {
			this.loadData();
		},
		onLoad(options) {
			let title = '搜索列表';
			if (options && options.hot) {
				title = '热门推荐';
			} else if (options && options.limited) {
				title = '限时精选';
			}

			uni.setNavigationBarTitle({
				title: title
			})

			for (let key in options) {
				this.reqdata[key] = decodeURIComponent(options[key]);
			}

			this.loadData();
		},
		methods: {
			// 加载商品，下拉刷新|上拉加载
			async loadData(type = 'add', loading) {

				if (this.loadmoreType === 'loading') {
					// 防止重复加载
					return;
				}

				if (loading == 1 || type == 'refresh') {
					// 从首页开始加载
					this.reqdata.page = 1;
				}

				// 没有更多直接返回 
				if (type === 'add') {
					if (this.loadmoreType === 'nomore') {
						return;
					}
					// 加载中
					this.loadmoreType = 'loading';
				} else {
					// 更多
					this.loadmoreType = 'more'
				}
				this.$func.usemall.call('goods/list', this.reqdata).then(res => {
					if (res.code === 200) {
						if (res.datas && res.datas.goods.length > 0) {
							if (loading == 1 || type == 'refresh') {
								this.goodsDatas = [];
							}
							let _datas = [];
							res.datas.goods.forEach((row) => {
								if(row.state === '销售中'){
									_datas.push(row);
								}
							});
							// res.datas.goods.forEach((row) => {
							// 	if(res.res.datas.goods.state === '销售中')
							// });
							this.goodsDatas = [...this.goodsDatas, ..._datas];

							if (res.datas.goods.length >= this.reqdata.rows) {
								this.reqdata.page++;
								this.loadmoreType = 'more'
							} else {
								this.loadmoreType = 'nomore'
							}
						} else {
							this.loadmoreType = 'nomore'
						}
					}

					if (this.goodsDatas.length === 0) {
						this.empty = true;
					}

					if (loading == 1) {
						uni.hideLoading()
					} else if (type == 'refresh') {
						uni.stopPullDownRefresh();
					}
				})
			},
			// 点击筛选 
			navbarClick(index) {
				// 
				if (this.filterIndex === index && index !== 2) {
					return;
				}

				this.filterIndex = index;

				if (index === 2) {
					this.priceOrder = this.priceOrder === 1 ? 2 : 1;
				} else {
					this.priceOrder = 0;
				}

				if (this.filterIndex == 0) {
					// 综合排序
					this.reqdata.sidx = 'sort';
					this.reqdata.sord = 'asc';
				} else if (this.filterIndex == 1) {
					// 销量优先
					this.reqdata.sidx = 'sale_cnt';
					this.reqdata.sord = 'desc';
				} else if (this.filterIndex == 2) {
					// 价格排序
					this.reqdata.sidx = 'price';
					if (this.priceOrder == 1) {
						// 降序
						this.reqdata.sord = 'desc';
					} else if (this.priceOrder == 2) {
						// 升序
						this.reqdata.sord = 'asc';
					}
				}

				uni.pageScrollTo({
					duration: 300,
					scrollTop: 0
				})

				this.loadData('refresh', 1);
				uni.showLoading({
					title: '正在加载'
				})
			},
			// 搜索页
			tosearch() {
				if (this.$api.pages().length > 1) {
					uni.navigateBack();
					return;
				}
				this.$api.tosearch();
			},
			// 商品详情
			togoods(options) {
				this.$api.togoods({
					id: options._id
				});
			}
		},
	}
</script>

<style lang="scss">
	page {
		background-color: $page-color-base;
	}

	.navbar {
		top: var(--window-top);
		left: 0;
		height: 100rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, .06);
		z-index: 10;

		.nav-item {
			color: $font-color-dark;
			font-size: 30rpx;

			&.active {
				&:after {
					content: '';
					position: absolute;
					left: 50%;
					bottom: 0;
					transform: translateX(-50%);
					width: 120rpx;
					height: 0;
					border-bottom: 4rpx solid $base-color;
				}
			}
		}

		.iconfont {
			width: 30rpx;
			height: 14rpx;
			font-size: 20rpx;
			line-height: 1;
			margin-left: 4rpx;
		}
	}

	.goods-list {
		.list {
			padding: 0 3vw 20rpx;
		}

		.item {
			width: 46vw;
			overflow: hidden;
			margin-top: 2vw;

			&:nth-child(2n) {
				margin-left: 1vw;
			}

			&:nth-child(2n + 1) {
				margin-right: 1vw;
			}
		}

		.image-wrapper {
			width: 100%;
			height: 300rpx;
			overflow: hidden;

			image {
				width: 100%;
				height: 100%;
				opacity: 1;
			}
		}
	}
</style>
