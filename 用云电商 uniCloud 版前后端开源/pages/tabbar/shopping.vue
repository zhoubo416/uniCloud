<template>
	<view class="margin-sm">
		<view class="dflex-b">
			<image src="/static/images/user/default.png" class="border-radius-lg headimg" style="width: 66rpx; height: 66rpx;" mode="" @click="user"></image>
			<view class="flex1 margin-left-sm">
				<view class="bg-main border-radius-lg dflex" style="height: 76rpx; line-height: 76rpx;">
					<input type="text" placeholder="输入关键词" class="w-full padding-lr" />
					<view class="iconfont iconsousuo-01 bg-base border-radius-lg h-full padding-lr-xl" @click="search"></view>
				</view>
			</view>
		</view>
		<view class="margin-top">
			<scroll-view scroll-x class="ws-np">
				<view class="dflex padding-bottom-sm">
					<block v-for="(item,index) in ['全部','关注','推荐','服饰','箱包','鞋子','手机','家电','饰品']" :key="index" >
					<view class="pos-r padding-tb-sm margin-right-xs padding-lr diblock line-height-1 tac" :class="{active: title_id === index}" @click="pitch(index)">
						{{item}}
						<view class="badge" v-if="item == '关注'">2</view>
					</view>
					</block>
				</view>
			</scroll-view>
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
		
		<!-- 置顶 -->
		<use-totop ref="usetop" :style="{ marginBottom: navHeight + 'px' }"></use-totop>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title_id: 0,
				
				scrollTop: 0,
				navHeight: 0,
			};
		},
		onPageScroll(e) {
			// this.scrollTop = e.scrollTop
			this.$refs.usetop.change(e.scrollTop);
		},
		methods: {
			// 跳转个人
			user() {
				uni.navigateTo({
					url: `/pages/shopping/user`
				});
			},
			// 搜索
			search() {
				this.$api.msg('搜索')
			},
			pitch(index) {
				this.title_id = index
			},
			// 跳转详情页
			dongt(options) {
				uni.navigateTo({
					url: `/pages/shopping/detail?id=${options}`
				});
			}
		},
		mounted() {
			// #ifdef H5 || MP-360
			this.navHeight = 50;
			// #endif
		}
	}
</script>

<style lang="less">
	page {
		background-color: #F5F5F5;
	}

	.active {
		color: #ff6a6c;
		font-weight: bold;
		font-size: 34rpx;
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
