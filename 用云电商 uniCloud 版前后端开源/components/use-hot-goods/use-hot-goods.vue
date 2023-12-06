<template>
	<!-- 热卖产品 -->
	<view class="use-hot-goods">
		<!-- 列表标题 -->
		<use-list-title v-if="hotDatas && hotDatas.length > 0" :title="title" size="32" fwt="600" :type="titleType" color="#333" iconfont="iconremen" @goto="hot"></use-list-title>
		
		<view class="list dflex-b dflex dflex-wrap-w w-full">
			<view v-for="(item, index) in hotDatas" :key="index" class="item border-radius-sm padding-bottom-sm" @click="to_detail(item)">
				<view class="image-wrapper"><image mode="aspectFill" :lazy-load="true" :src="item.img"></image></view>
				<text class="title clamp padding-sm">{{ item.name }}</text>
				<view class="padding-left-sm">
					<text class="price">{{ item.price / 100 }}</text>
					<text class="m-price">{{ item.market_price / 100 }}</text>
				</view>
			</view>
		</view>
		
		<!-- 用云版权 -->
		<use-copyright></use-copyright>
	</view>
</template>

<script>
export default {
	props: {
		title: {
			type: String,
			default: '热卖产品'
		},
		titleType: {
			type: String,
			default: 'square'
		},
		autoload: {
			type: String,
			default: 'auto'
		},
		datas: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			hotDatas: []
		};
	},
	watch: {
		datas(){
			this.hotDatas = this.datas;
		}
	},
	created() {
		if(this.autoload === 'auto'){
			this.loadData();
		}
	},
	methods: {
		loadData() {
			this.$db['usemall-goods'].where('state == "销售中" && hot == 1').tolist({ rows: 8, orderby: 'sort asc' })
				.then(res=>{
					// console.log('usemall-goods',res);
					if(res.code === 200){
						this.hotDatas = res.datas || [];
					}
				})
		},
		goto() {
			console.log('goto');
			this.$emit('goto', {
				type: 'goto'
			});
		},
		hot() {
			this.$api.togoodslist({hot: 1});
		},
		to_detail(options) {
			this.$api.togoods({id: options._id});
		}
	}
};
</script>

<style lang="scss">
.use-hot-goods {
	background-color: #f3f4f6;
	
	.list{
		padding: 0 3vw 20rpx;
	}
	
	.item { 
		width: 46vw;
		overflow: hidden;
		margin-top: 2vw;
		background: #fff;

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
