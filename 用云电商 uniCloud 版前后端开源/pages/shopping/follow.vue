<template>
	<view class="padding-sm">
		<view class="padding bg-main border-radius margin-bottom-sm" v-for="(item, idx) in [1,1,1,1,1,1]" :key="idx">
			<view class="dflex-b">
				<view class="dflex">
					<image src="/static/images/user/default.png" class="border-radius-lg margin-right-sm headimg" 
						style="width: 70rpx; height: 70rpx;" mode="aspectFill"></image>
					<view class="fwb">
						沙发上的猫
					</view>
				</view>
				<view class="border-radius-lg fs-xs" style="border: 1rpx solid #333; padding: 12rpx 34rpx;">
					已关注
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		}
	}
</script>

<style lang="less">
page{
	background-color: #F5F5F5;
}
</style>
