<template>
	<view class="padding">
		
		<view class="padding item border-radius dflex-b margin-bottom" v-for="(item, idx) in datas" :key="idx">
			<view class="fs fwb">{{item.time}}</view>
			<view class="tar">
				<view class="fwb"><text class="fs-lg">{{item.symbol}}{{item.integral}}</text></view>
				<view class="fs-xs">{{item.type}}</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				datas: [],
			}
		},
		onShow() {
			this.loadData();
		},
		methods: {
			loadData(){
				this.datas = [
					{time: '2021.06.10 12:00', integral: 10, symbol: '+', type: '签到'},
					{time: '2021.06.11 12:00', integral: 10, symbol: '-', type: '支出'},
					{time: '2021.06.12 12:00', integral: 10, symbol: '-', type: '支出'},
					{time: '2021.06.13 12:00', integral: 10, symbol: '+', type: '签到'},
					{time: '2021.06.14 12:00', integral: 10, symbol: '+', type: '签到'},
					{time: '2021.06.16 12:00', integral: 10, symbol: '-', type: '消费'},
					{time: '2021.06.15 12:00', integral: 10, symbol: '+', type: '支出'},
					{time: '2021.06.17 12:00', integral: 10, symbol: '+', type: '签到'},
					{time: '2021.06.18 12:00', integral: 10, symbol: '-', type: '消费'},
					{time: '2021.06.18 12:00', integral: 10, symbol: '+', type: '注册'},
				];
			},
		}
	}
</script>

<style lang="scss">
	.item {
		box-shadow: 0px 0px 17px 3px #f0f0f0;;
	}
</style>
