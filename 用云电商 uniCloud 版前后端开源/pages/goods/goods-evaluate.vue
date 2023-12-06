<template>
	<view class="">
		<view class="gap"></view>
		<view class="state-area dflex padding bg-main">
			<view class="item margin-right-sm" :class="{ active: state == item.name }" v-for="(item, index) in stateDatas" :key="index" @click="change(item)">
				<text style="font-size: 26rpx;">{{ item.name }}({{ item.cnt }})</text>
			</view>
		</view>
		<view class="gap"></view>

		<!-- 评价区 -->
		<view class="evaluate-area">
			<view class="padding-lr padding-top bg-main">
				<view class="eva-box dflex-s padding-bottom-lg" v-for="(item, index) in evaluateDatas" :key="index">
					<image class="portrait border-radius-c" :src="item.member_headimg"></image>
					<view class="right-area flex1 padding-left-sm">
						<view class="dflex-b ft-dark">
							<view class="dflex">
								<text class="name margin-right">{{ item.member_name }}</text>
								<use-rate :value="item.review_cnt" disabled></use-rate>
							</view>
							<text class="time fs-xs">{{ $api.format(item.create_time, 'yyyy-MM-dd') }}</text>
						</view>
						<view class="fs-sm ft-main padding-top-xs padding-bottom-sm">{{ item.review_content }}</view>
						<view class="dflex dflex-wrap-w">
							<image v-for="(img, i) in item.review_imgs" :src="img" :key="i" mode="widthFix" class="" @click="preview(item.imgs, img)"></image>
						</view>
						<view class="">
							<text class="fs-xs ft-dark">{{ item.goods_type || '套餐1' }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
export default {
	data() {
		return {
			// 评价状态
			stateDatas: [],
			// 评价数据
			evaluateDatas: [],
			// 商品ID
			goods_id: 0,
			// 评价类型
			state: '全部'
		};
	},
	onLoad(res) {
		this.goods_id = res.id;

		this.loadData();
	},
	methods: {
		loadData() {
			const $ = this.$dbcmd.aggregate;
			this.$db['usemall-goods-comment']
				.collection()
				.aggregate()
				.match({
					goods_id: $.eq(this.goods_id),
					state: '显示'
				})
				.group({
					_id: '$review_type',
					num: $.sum(1)
				})
				.end()
				.then(res => {
					let __stateDatas = [];
					let total = 0;
					res.result.data.forEach(x => {
						__stateDatas.push({ name: x._id, cnt: x.num });
						total += x.num;
					});

					this.stateDatas = [{ name: '全部', cnt: total }, ...__stateDatas];
				});

			this.$db['usemall-goods-comment']
				.where({ 
					goods_id: this.goods_id,
					state: '显示'
				})
				.whereif(this.state != '全部', { review_type: this.state })
				.tolist({ rows: 30, orderby: 'create_time desc' })
				.then(res => {
					if (res.code === 200) {
						this.evaluateDatas = res.datas;
					}
				});
		},
		change(options) {
			this.state = options.name;

			this.loadData();
		},
		preview(imgs, cur) {
			if (!imgs) return;

			uni.previewImage({
				urls: imgs,
				current: cur,
				longPressActions: {
					itemList: ['发送给朋友', '保存图片', '收藏'],
					success: function(data) {
						console.log(res);
					},
					fail: function(err) {
						console.log(err);
					}
				}
			});
		}
	}
};
</script>
<style lang="scss">
page {
	background: $page-color-base;
}

.state-area {
	.item {
		text {
			padding: 10rpx 20rpx;
			border: 1px solid #f0f0f0;
			border-radius: 30rpx;
		}

		&:last-child {
			margin-right: 0;
		}
	}
}

.evaluate-area {
	.portrait {
		flex-shrink: 0;
		width: 80rpx;
		height: 80rpx;
	}
	.right-area {
		image {
			margin-right: 10rpx;
			margin-bottom: 10rpx;
			height: 200rpx;
			width: 30%;
		}
	}
}
</style>
