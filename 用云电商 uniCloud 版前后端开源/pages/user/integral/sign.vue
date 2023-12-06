<template>
	<view class="sign-area">
		<view class="sign-top pos-r bg-base dflex dflex-flow-c">
			<view class="ft-white margin-top-sm fwb" style="font-size: 70rpx">{{data.member_integral || 750}}</view>
			<view class="btn-line ft-black fs-xs border-radius-big" @click="toDetail">积分明细</view>
		</view>
		<view class="sign-content margin pos-a">
			<view class="bg-main border-radius padding">
				<view class="title">
					<view class="fwb fs">
						<text class="d">已累计签到</text>
						<text class="ft-base margin-left-sm fwb">{{data.sign_cnt || 6}}天</text>
					</view>
				</view>
				<view class="dflex-b margin-top">
					<view class="dflex-c dflex-flow-c" v-for="(item, index) in weeks" :key="index">
						<view :class="{ active: item.sign }" class="iconfont iconxuanzhong"></view>
						<view>{{item.name}}</view>
					</view>
				</view>
			</view>
			
			<view class="margin-top-xl">
				<view class="tac margin fs-xs">
					<text>连续签到{{data.sign_in_full || 7}}天</text>
					<text class="margin-left-xs">可额外获得{{ data.sign_in_full_integral || '10' }}积分</text>
				</view>
				
				<view class="w-full margin-top">
					<view class="dflex-b border-radius-big">
						<view class="tac padding-tb-sm flex1 bg-base" v-if="!signed" @click="toSign">立即签到</view>
						<view class="tac padding-tb-sm flex1 bg-disabled" v-else>今日已签到</view>
					</view>
				</view>
			</view>
		</view>
		
		<view class="pos-f pos-bottom padding tac w-full bg-warn fs-xs">有200积分即将在2021.12.30过期</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				weeks: [],
				data: {},
				signed: false,
			}
		},
		onShow() {
			this.loadData();
		},
		methods: {
			loadData(){
				this.weeks = [];
				this.weeks.push({ name: '周一', sign: true });
				this.weeks.push({ name: '周二', sign: true });
				this.weeks.push({ name: '周三', sign: true });
				this.weeks.push({ name: '周四', sign: true });
				this.weeks.push({ name: '周五', sign: false });
				this.weeks.push({ name: '周六', sign: false });
				this.weeks.push({ name: '周日', sign: false });
			},
			toDetail() {
				uni.navigateTo({
					url: '/pages/user/integral/detail'
				});
			},
			toSign() {
				if (this.signed) {
					this.$api.msg('已签到，明天再来吧')
					return;
				}
				
				this.signed = true;
				this.$api.msg('恭喜签到成功');
			}
		}
	}
</script>

<style lang="less">
	page {
		overflow: hidden;
		background-color: #f5f5f5;
	}
	
	.sign-area {
		.sign-top {
			left: -10%;
			width: 120%;
			height: 360rpx;
			padding: 0rpx 10%;
			border-bottom-right-radius: 50%;
			border-bottom-left-radius: 50%;

			.btn-line {
				padding: 10rpx 30rpx;
				border: 1px solid #333;
			}
		}
		
		.bg-disabled {
			background-color: #c0c4cd !important;
			color: #fff !important;
		}

		.sign-content {
			top: 240rpx; left: 0; right: 0; 
			margin: 0 50rpx;
			
			.iconfont {
				color: #c0c4cd;
				font-size: 50rpx;
			}
		}
	}
</style>
