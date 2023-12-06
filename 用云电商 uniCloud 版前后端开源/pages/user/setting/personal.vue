<template>
	<view class="container">
		<view class="dflex-c pos-r margin-bottom margin-top">
			<view class="portrait-box">
				<image class="border-radius-c" :src="member.member_headimg || '/static/images/user/default.png'">
				</image>
			</view>
			<view class="margin-left-sm">
				<view>
					<text class="username">{{ member.member_name || '用云' }}</text>
				</view>
				<view v-if="member.member_city"><text>{{ member.member_city }}</text></view>
			</view>
		</view>
		<view class="use-item padding-lr dflex-b">
			<text class="tac">昵称</text>
			<text>{{ member.member_name || member.member_nickname }}</text>
		</view>
		<view class="gap"></view>
		<view class="use-item padding-lr dflex-b">
			<text class="tac">性别</text>
			<text>{{ (member.member_gender == 0 ? '未知' : member.member_gender == 1 ? '男' : '女') || '未知' }}</text>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex';
	export default {
		computed: {
			...mapState(['islogin', 'member'])
		},
		data() {
			return {
			};
		},
		onShow() {
			if (!this.islogin) {
				this.$api.msg('账号未登录');
				return;
			}
		},
		methods:{
			
		}
	}
</script>

<style lang='scss'>
	page {
		background: $page-color-base;
	}

	image {
		width: 130rpx;
		height: 130rpx;
	}

	.use-item {
		height: 100rpx;
		line-height: 100rpx;
		position: relative;
		background: #fff;
	}
</style>
