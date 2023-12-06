<template>
	<view>
		<!-- 01. 轮播区 -->
		<view class="swiper-area w-full pos-f">
			<swiper class="h-full pos-r" indicator-dots circular="true" duration="400">
				<swiper-item>
					<view class="wh-full">
						<image
							src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-7e00db99-ad65-4b9f-a74b-61bccb92b124/5433329e-95c5-4973-aa87-86c4d1815771.jpg"
							class="wh-full loaded" lazy-load="true" mode="aspectFill"></image>
					</view>
				</swiper-item>
				<swiper-item>
					<view class="wh-full">
						<image
							src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-7e00db99-ad65-4b9f-a74b-61bccb92b124/010c807f-a45e-40f7-8e08-49aa3dca8b49.jpg"
							class="wh-full loaded" lazy-load="true" mode="aspectFill"></image>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<view class="pos-f dflex-c border-radius-c"
			style="top: 30rpx; right: 30rpx;opacity: .6;background: #333; width: 80rpx; height: 80rpx;"
			@click="toShare">
			<view class="iconfont iconfenxiang ft-white fs-xl"></view>
		</view>

		<!-- 02. 商品数据区 -->
		<view class="goods-area bg-main padding">

			<view class="dflex-b margin-tb-sm">
				<view class="dflex">
					<image src="/static/images/user/default.png" class="headimg border-radius-c"
						style="width: 70rpx; height: 70rpx;"></image>
					<view class="margin-left-xs fs-xxs">Usecloud</view>
				</view>
				<view class="bg-drak border-radius-lg padding-lr fs-xs dflex-c" @click="toFollow">
					<text class="iconfont iconaixin-01 ft-base" v-if="follow"></text>
					<text class="iconfont iconaixin" v-else></text>
					<text class="padding-tb-16" style="margin-left: 6rpx;">关注</text>
				</view>
			</view>

			<text class="title fwb clamp-2 fs margin-bottom-xs">阿吉豆耳钉女日韩可爱甜美气质猫咪耳环人造猫眼石文艺钩坠耳饰品</text>
			<view class="">
				一套 js 解决前端、后端、数据库的全栈开发 serverless 模式（小程序、h5、app、vue + element-ui + uniCloud 版管理后台）前后端开源 QQ群 1020565856
			</view>
		</view>
		<!-- 07. 操作区 -->
		<view class="oper-area pos-f dflex-b w-full padding-lr-lg">
			<view class="dflex">
				<view class="btn-area dflex-c" :class="{ active: favorite }">
					<text class="iconfont iconaixin"></text>
					<text>758</text>
				</view>
				<view class="btn-area dflex-c" :class="{ active: favorite }">
					<text class="iconfont iconshoucang-01"
						:class="favorite ? 'iconshoucang-' : 'iconshoucang-01'"></text>
					<text>60</text>
				</view>
				<view class="btn-area dflex-c">
					<text class="iconfont iconkefu-01"></text>
					<text>95</text>
				</view>
			</view>
			<view class="btn-container border-radius-big">
				<view class="tac padding-tb-sm flex1 bg-base" style="padding: 16rpx 50rpx;" @click="toBuy(goods)">购买同款
				</view>
			</view>
		</view>
		<!-- 置顶 -->
		<use-totop ref="usetop" bottom="120"></use-totop>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	export default {
		computed: {
			...mapState(['islogin', 'member'])
		},
		data() {
			return {
				id: '',
				follow: true
			};
		},
		onShareAppMessage: function(ops) {
			let _this = this;
			let mid = 0;
			if (_this.member && _this.member._id) {
				mid = _this.member._id;
			}

			return {
				title: '用云 · 让开发更简单',
				path: `/pages/shopping/detail?id=${this.id}&mid=${mid}`, //这里设定都是以"/page"开头,并拼接好传递的参数
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
			// 立即购买
			toBuy(item) {
				this.$api.msg('购买')
			},
			toFollow() {
				this.follow = !this.follow;
				if (this.follow) {
					this.$api.msg('已关注')
				} else {
					this.$api.msg('取消关注')
				}
			},
			toShare() {
				this.$api.msg('分享')
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: #fff;
		padding-bottom: 120rpx;
	}

	/* 01. 轮播区 */
	.swiper-area {
		height: 66vh;
		top: 0;
		z-index: -1;
	}

	/* #ifndef MP */
	.swiper-area {
		margin-top: calc(44px + env(safe-area-inset-top));
	}

	/* #endif */

	/* 02. 商品数据区 */
	.goods-area {
		margin-top: 66vh;

		.price-box {
			display: flex;
			align-items: baseline;
		}

		.title {
			color: $font-color-dark;
			height: 46rpx;
			line-height: 46rpx;
		}
	}


	/* 07. 操作区 */
	.oper-area {
		left: 0;
		bottom: 0;
		background: rgba(245, 245, 245, 0.95);
		box-shadow: 0 0 20rpx 0 #f0f0f0;
		height: 100rpx;
		z-index: 95;

		.btn-area {
			color: #000;
			width: 96rpx;
			margin-right: 30rpx;
			text-align: center;

			.iconfont {
				font-size: 40rpx;
				line-height: 48rpx;
				margin-right: 6rpx;
			}
		}
	}
</style>
