<template>
	<view class="h-full pos-r">
		<view class="padding-lr padding-tb-lg bg-base">
			<view class="dflex-a">
				<view class="dflex" @click="popUp = true">
					<image src="/static/images/user/default.png" mode="aspectFill"
						class="border-radius-c margin-right-sm"
						style="width: 110rpx; height: 110rpx; border: 2px solid #fff;"></image>
					<view class="">
						<view class="fwb ft-white fs-30">
							沙发上的猫
						</view>
						<view class="fs-xxs" style="opacity: .6;">
							中国-广东-深圳
						</view>
					</view>
				</view>
				<view class="border-radius-lg fwbd bg-main ft-base padding-tb-16 padding-lr-xl" @click="note">
					写笔记
				</view>
			</view>
			<view class="margin-top-xl">
				<view class="dflex">
					<view class="tac flex1" @click="follow">
						<view class="ft-white fwb fs-xl">
							56
						</view>
						<view class="ft-main fs-xs">
							关注
						</view>
					</view>
					<view class="tac flex1" @click="fans">
						<view class="ft-white fwb fs-xl">
							120
						</view>
						<view class="ft-main fs-xs">
							粉丝
						</view>
					</view>
					<view class="tac flex1" @click="popUp = true">
						<view class="ft-white fwb fs-xl">
							375
						</view>
						<view class="ft-main fs-xs">
							获赞与收藏
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="bg-base w-full" style="height: 80rpx;"></view>
		<view class="w-full bg-drak data-area padding-lr-sm">
			<view class="dflex-c w-full padding-tb-lg fs">
				<view class="padding-lr" :class="{active: pitch_id === 0}" @click="pitch(0)">
					笔记
				</view>
				<view class="padding-lr" :class="{active: pitch_id === 1}" @click="pitch(1)">
					收藏
				</view>
			</view>
			<view class="goodsContent border-radius">
				<view class="goodsLeftList">
					<view class="bg-main margin-bottom-sm border-radius" style="height: 200rpx; background: #4645cf;">
						<image src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-7e00db99-ad65-4b9f-a74b-61bccb92b124/d462f254-a1a6-4225-992c-f0658f6d4e0d.jpg" mode="widthFix"></image>
					</view>
					<block v-for="(item, index) in [1,1,1,1,1,1]" :key="index">
						<view class="bg-main margin-bottom-sm border-radius" @click="dongt(item.id)">
							<block v-for="(img, img_idx) in [1]" :key="img_idx">
								<image src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-7e00db99-ad65-4b9f-a74b-61bccb92b124/5433329e-95c5-4973-aa87-86c4d1815771.jpg" 
									style="max-height: 340rpx;" class="flex1"
									mode="heightFix"></image>
							</block>
							<view class="padding-lr-sm margin-top-sm clamp-2">阿吉豆耳钉女日韩可爱甜美气质猫咪耳环人造猫眼石文艺钩坠耳饰品</view>
							<view class="dflex-b padding-lr-sm margin-tb-sm">
								<view class="dflex" style="width: 60%;">
									<image src="/static/images/user/default.png" class="border-radius-c headimg" style="width: 50rpx; height: 50rpx;"></image>
									<view class="ft-dark margin-left-xs fs-xxs">Usecloud</view>
								</view>
								<view class="dflex">
									<view class="iconfont iconaixin"></view>
									<view class="clamp ft-dark margin-left-xs fs-xxs">355</view>
								</view>
							</view>
						</view>
					</block>
				</view>
				<view class="goodsRightList">
					<block v-for="(item, index) in [1,1,1,1,1,1]" :key="index">
						<view class="bg-main margin-bottom-sm border-radius" @click="dongt(item.id)">
							<block v-for="(img, img_idx) in [1]" :key="img_idx">
								<image src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-7e00db99-ad65-4b9f-a74b-61bccb92b124/010c807f-a45e-40f7-8e08-49aa3dca8b49.jpg" 
									style="max-height: 340rpx;" class="flex1"
									mode="heightFix">
								</image>
							</block>
							<view class="padding-lr-sm margin-top-sm clamp-2">小包包女新款潮2020法国小众质感高级感洋气小ck小香风链条斜挎包 </view>
							<view class="dflex-b padding-lr-sm margin-tb-sm">
								<view class="dflex" style="width: 60%;">
									<image src="/static/images/user/default.png" class="border-radius-c headimg" style="width: 50rpx; height: 50rpx;"></image>
									<view class="ft-dark margin-left-xs fs-xxs">Usecloud</view>
								</view>
								<view class="dflex">
									<view class="iconfont iconaixin"></view>
									<view class="clamp ft-dark margin-left-xs fs-xxs">356</view>
								</view>
							</view>
						</view>
					</block>
				</view>
			</view>
		</view>

		<use-popup v-model="popUp" bgclass=" " mode="center" borderRadius="20">
			<view class="padding-lr-xl stats-area">
				<view class="dflex-s dflex-flow-c padding-left-lg">
					<view class="dflex-c">
						<view class="ft-white border-radius-c dflex-c circle" style="background: #ff6a6c;">
							<text class="iconfont iconmingxi"></text>
						</view>
						<text class="margin-lr-sm ft-dark">当前发布笔记数</text>
						<text>27</text>
					</view>
					<view class="dflex-c margin-tb-sm">
						<view class="ft-white border-radius-c dflex-c circle" style="background: #6f96f1;">
							<text class="iconfont iconaixin"></text>
						</view>
						<text class="margin-lr-sm ft-dark">当前获得点赞数</text>
						<text>305</text>
					</view>
					<view class="dflex-c">
						<view class="ft-white border-radius-c dflex-c circle" style="background: #ffbc49;">
							<text class="iconfont iconshoucang-01"></text>
						</view>
						<text class="margin-lr-sm ft-dark">当前发布收藏数</text>
						<text>70</text>
					</view>
				</view>
				<view class="bg-base margin-top-xl tac w-full border-radius-lg padding-tb-sm" @click.stop="popUp = false">
					我知道了
				</view>
			</view>
		</use-popup>

		<!-- 置顶 -->
		<use-totop ref="usetop"></use-totop>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pitch_id: 0,
				popUp: false,
			};
		},
		onPageScroll(e) {
			this.$refs.usetop.change(e.scrollTop);
		},
		methods: {
			//写笔记
			note() {
				uni.navigateTo({
					url: `/pages/shopping/note`
				});
			},
			// 选中
			pitch(id) {
				this.pitch_id = id
			},
			// 关注
			follow() {
				uni.navigateTo({
					url: `/pages/shopping/follow`
				});
			},
			// 粉丝
			fans() {
				uni.navigateTo({
					url: `/pages/shopping/fans`
				});
			},
			// 跳转详情页
			detail(options) {
				uni.navigateTo({
					url: `/pages/shopping/detail?id=${options._id}`
				});
			}
		},
	}
</script>

<style lang="less">
	page {
		width: 100%;
		height: 100%;
		background-color: #fff;
	}

	.data-area {
		border-top-left-radius: 80rpx;
		border-top-right-radius: 80rpx;
		overflow: hidden;
		position: relative;
		top: -80rpx;
	}

	.active {
		line-height: 1.2;
		color: #000 !important;
		font-weight: bold;
		position: relative;

		&:after {
			content: ' ';
			position: absolute;
			width: 40%;
			height: 8rpx;
			border-radius: 4rpx;
			background: #ff6a6c;
			bottom: -6rpx;
			left: 50%;
			transform: translateX(-50%);
		}
	}


	.fans-headimg {
		width: 60rpx;
		height: 60rpx;
	}

	.stats-area {
		width: 80vw;
		padding: 70rpx 80rpx 60rpx;
		
		.circle {
			width: 50rpx;
			height: 50rpx;
		}
		
		.iconfont {
			font-size: 28rpx;
		}
	}

	.goodsContent {
		width: 100%;
		display: flex;
		justify-content: center;

		.ft-dark {
			color: #585858;
		}
	}

	.goodsLeftList,
	.goodsRightList {
		width: 50%;
		overflow: hidden;
	}

	.goodsLeftList {
		margin-right: 10rpx;
	}

	.goodsRightList {
		margin-left: 10rpx;
	}
</style>
