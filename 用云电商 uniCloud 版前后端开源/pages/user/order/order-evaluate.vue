<template>
	<view class="">
		<!-- 商品区 -->
		<view class="padding margin-lr margin-tb-sm bg-main border-radius">
			<view class="goods-area" v-for="(item, index) in order_detail" :key="index">
				<view class="dflex">
					<view class="img">
						<image :src="item.goods_img"></image>
					</view>
					<view class="margin-left-sm">
						<text class="clamp-2">{{ item.goods_name }} {{ item.goods_name_pw }}</text>
						<view class="ft-dark fs-xs padding-top-xs">
							<text class="margin-right">× {{ item.goods_num }}</text>
							{{ item.goods_sku_name || '&nbsp;&nbsp;' }}
						</view>
						<view class="margin-top-sm">
							<text class="price">{{ item.goods_price / 100 }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 评分 -->
		<view class="evaluate-kps">
			<view class="padding margin-lr margin-tb-sm bg-main border-radius dflex-b">
				<view>
					<text>总体评分</text>
					<text class="margin-left ft-base fs-xs">{{postData.review_type}}</text>
				</view>
				<use-rate @change="rateChange" value="5"></use-rate>
			</view>
		</view>

		<!-- 评价区 -->
		<view class="evaluate-area">
			<view class="padding margin-lr margin-tb-sm bg-main border-radius">
				<!-- 评价内容 -->
				<textarea class="ft-black w-full fs-sm" v-model="postData.review_content"
					placeholder="请输入评价内容"></textarea>

				<!-- 上传图片 -->
				<use-upload class="pos-r" @upload="uploadImgs"></use-upload>
			</view>
		</view>

		<!-- 是否匿名评价 -->
		<view>
			<view class="padding margin-lr margin-tb-sm bg-main border-radius dflex-b">
				<text>提交评价的图片{{ anonymity ? '不可见' : '可见' }}</text>
				<view>
					<text class="ft-dark">匿名</text>
					<switch color="#FF6A6C" @change="switchChange" />
				</view>
			</view>
		</view>

		<!-- 提交操作 -->
		<view class="padding w-full margin-top">
			<view class="dflex-b border-radius-big">
				<view class="tac padding-tb-sm flex1 bg-base" @click="submit">提交评价</view>
			</view>
		</view>

		<!-- 用云版权 -->
		<use-copyright></use-copyright>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				// 商品数据
				order_detail: [],
				// 订单数据
				order_data: {},
				// 订单ID
				order_id: '',
				postData: {
					order_id: '',
					review_cnt: 5,
					review_type: '好评',
					review_content: '',
					review_imgs: '',
					review_anonymity: '否',
				}
			};
		},
		onLoad(options) {
			this.order_id = options.id;
			if (!this.order_id) {
				this.$api.msg('订单编号不存在');
			}
			this.loadData();
		},
		methods: {
			async loadData() {
				let _this = this;
				await _this.$func.usemall.call('order/detail', {
					order_id: _this.order_id
				}).then(res => {
					if (res.code === 200) {
						_this.order_data = res.datas.order;
						_this.order_detail = res.datas.order_detail;
					}
				})
			},
			uploadImgs(options) {
				let imgs = [];

				options.forEach((_) => {
					imgs.push(_.url);
				});

				if (imgs.length > 0) this.postData.review_imgs = imgs;

				console.log('uploadImgs', this.postData.review_imgs);
			},
			submit() {
				let _this = this;
				if (!this.postData.review_content) {
					this.$api.msg('请填写评价内容');
					return;
				}
				if (this.issubmit) return;

				this.issubmit = true;
				this.postData.order_id = _this.order_id;
				uni.showModal({
					title: '提示',
					content: '提交评价',
					success: function(res) {
						if (res.confirm) {
							_this.$func.usemall.call('order/evaluate', _this.postData
							).then(
								res => {
									if (res.code === 200) {
										_this.$api.msg('提交成功');
										// setTimeout(() => {
										_this.issubmit = false;
										uni.navigateBack({});
										//}, 1000);
										return;
									}
									_this.$api.msg(res.msg);
									_this.issubmit = false;
								})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});

			},
			switchChange(options) {
				this.postData.review_anonymity = options.detail.value ? '是' : '否';
			},
			rateChange(options) {
				switch (options.value) {
					case 1:
						this.postData.review_type = '差评';
						break;
					case 2:
					case 3:
						this.postData.review_type = '中评';
						break;
					case 4:
					case 5:
						this.postData.review_type = '好评';
						break;
				}
				this.postData.review_cnt = options.value;
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}

	/* 商品区 */
	.goods-area {
		&:last-child {
			margin-bottom: 0;
		}

		image {
			width: 180rpx;
			height: 180rpx;
		}
	}
</style>
