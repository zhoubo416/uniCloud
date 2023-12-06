<template>
	<view class="box-sizing-b w-full">
		<!-- 01. 头部组件 -->
		<use-header :search-tip="searchTip" :search-auto="searchAuto" @search="search"></use-header>

		<!-- 02. 轮播区 -->
		<view class="swiper-area pos-r" v-if="swiperDatas && swiperDatas.length > 0">
			<!-- 轮播组件 -->
			<swiper class="swiper w-full" autoplay indicator-dots indicator-color="#f7f7f7" indicator-active-color="#ff6a6c">
				<swiper-item class="swiper-item padding-lr wh-full box-sizing-b" v-for="(item, index) in swiperDatas" :key="index">
					<view class="wh-full" @click.stop="topage(item)">
						<image class="border-radius wh-full" mode="aspectFill" :lazy-load="true" :src="item.img" />
					</view>
				</swiper-item>
			</swiper>
		</view>

		<!-- 03. 分类区 -->
		<view class="category-area dflex dflex-wrap-w" v-if="categoryDatas && categoryDatas.length > 0">
			<view class="category-item dflex dflex-flow-c margin-bottom-sm" v-for="(item, index) in categoryDatas"
				:key="index" @click="topage(item)">
				<image class="margin-bottom-xs" lazy-load :src="item.img"></image>
				<text class="tac clamp">{{ item.name }}</text>
			</view>
		</view>
		<view class="gap"></view>

		<!-- 04. 限时精选 -->
		<use-list-title title="限时精选" size="32" fwt="600" color="#333" iconfont="icondaishouhuo-" @goto="limit">
		</use-list-title>
		<view class="limit-area">
			<scroll-view class="padding-lr" scroll-x>
				<view class="dflex padding-bottom">
					<view class="item margin-right-sm" v-for="(item, index) in goodsLimitDatas" :key="index"
						@click="togoods(item)">
						<image class="border-radius-xs" mode="aspectFill" :lazy-load="true" :src="item.img"></image>
						<text class="title clamp padding-bottom-xs">{{ item.name }}</text>
						<text class="price">{{ item.price / 100 }}</text><text class="m-price">{{ item.market_price / 100 }}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		<view class="gap"></view>

		<!-- 05. 热门推荐 -->
		<use-hot-goods :datas="goodsHotDatas" autoload="none" title="热门推荐"></use-hot-goods>

		<!-- 置顶 -->
		<use-totop ref="usetop" :style="{ marginBottom: navHeight + 'px' }"></use-totop>

		<!-- #ifdef MP-WEIXIN -->
		<official-account @bindload="wxOAccountLoad" @binderror="wxOAccountErr"></official-account>
		<!-- #endif -->
	</view>
</template>

<script>
	import { mapState } from 'vuex';

	export default {
		computed: {
			...mapState(['member'])
		},
		data() {
			return {
				// 头部参数
				searchAuto: !0,
				searchTip: '请输入搜索关键字',

				// 轮播区
				swiperDatas: [],
				// 金刚区分类
				categoryDatas: [],
				// 限时精选
				goodsLimitDatas: [],
				// 热门推荐
				goodsHotDatas: [],

				scrollTop: 0,
				navHeight: 0,
			};
		},
		// 监听页面加载
		onLoad() {
		},
		onPageScroll(e) {
			// this.scrollTop = e.scrollTop
			this.$refs.usetop.change(e.scrollTop);
		},
		// 监听页面显示。页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面
		onShow() {
			this.loadData();
		},
		// 监听用户下拉刷新
		onPullDownRefresh() {
			this.loadData(() => {
				uni.stopPullDownRefresh();
			});
		},
		// 用户点击右上角分享
		// https://uniapp.dcloud.io/api/plugins/share?id=showsharemenu
		onShareAppMessage: function(ops) {
			let _this = this,
				mid = 0;

			if (_this.member && _this.member._id) {
				mid = _this.member._id;
			}

			return {
				title: '用云电商',
				path: `/pages/tabbar/home?mid=${mid}`,
				// imageUrl: 'https://mall-os-api.use-cloud.com/files/upload/image/20200408/200408115587860242.jpg',
				success: function(res) {
					// 转发成功
					console.log('转发成功', res);
				},
				fail: function(res) {
					// 转发失败
					console.log('转发失败', res);
				}
			};
		},


		methods: {
			// 加载数据
			async loadData(callback) {

				await this.$func.usemall.call('app/mp/home', {
					rows: 8
				}).then(res => {
					if (res.code === 200) {
						// 轮播图
						this.swiperDatas = res.datas.carousel || [];
						// 分类导航
						this.categoryDatas = res.datas.category || [];
						// 限时精选
						this.goodsLimitDatas = res.datas.limited || [];
						// 热门推荐
						this.goodsHotDatas = res.datas.hot || [];

						if (typeof callback === 'function') {
							// 数据加载完成回调函数
							callback();
						}
					}
				});

			},
			// 搜索回调函数
			search() {
				console.log('home search');
			},
			// 跳转页面
			topage(item) {
				// console.log('分类点击', item);
				if (item && item.type == '网页') {
					uni.navigateTo({
						url: `/pages/content/web?url=${item.url}`
					});
				} else if (item && item.type == '页面') {
					uni.navigateTo({
						url: `${item.url}`
					});
				} else {
					if (item.id) this.$api.togoods({
						id: item._id
					});
				}
			},
			// 限时精选 -> 商品详情
			togoods(item) {
				// 跳转商品详情
				this.$api.togoods({
					id: item._id
				});
			},
			// 限时精选
			limit() {
				// 跳转商品列表 - 限时精选类目
				this.$api.togoodslist({
					limited: 1
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

	/* 轮播图区 */
	.swiper-area {
		.swiper {
			height: 240rpx;
		}
	}

	/* 分类区 */
	.category-area {
		padding: 60rpx 0 30rpx 0;

		.category-item {
			font-size: $font-sm + 2upx;
			color: $font-color-dark;
			width: 25%;
		}

		image {
			width: 96rpx;
			height: 96rpx;
		}
	}

	/* 限时精选区 */
	.limit-area {
		min-height: 240rpx;

		.item {
			width: 240rpx;

			image {
				width: 240rpx;
				height: 240rpx;
			}
		}
	}

</style>
