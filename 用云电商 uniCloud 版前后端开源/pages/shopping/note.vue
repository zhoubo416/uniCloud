<template>
	<view class="margin-sm">
		<!-- 商品区 -->
		<view class="padding bg-main margin-bottom-sm border-radius dflex-b">
			<view class="dflex">
				<view class="iconfont iconshangpin-01 ft-base margin-right-xs"></view>
				<view class="fwb">商品</view>
			</view>
			
			<view class="dflex">
				<image class="margin-right-xs" style="width: 48rpx; height: 48rpx;" mode="widthFix" src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-7e00db99-ad65-4b9f-a74b-61bccb92b124/11bd19fa-6a70-49fd-9e71-72950828f6a8.jpg"></image>
				<view class="iconfont iconjiantou-01 fwb"></view>
			</view>
		</view>

		<!-- 评分 -->
		<view class="padding bg-main margin-bottom-sm border-radius dflex-b">
			<input type="text" maxlength="20" class="wh-full" v-model="postData.title" placeholder="标题(不超过20个字)" />
		</view>

		<view class="padding bg-main margin-bottom-sm border-radius">
			<textarea class="ft-black w-full fs-sm" v-model="postData.content"
				placeholder="请输入正文"></textarea>

			<!-- 上传图片 -->
			<use-upload class="pos-r" @upload="uploadImgs"></use-upload>
		</view>

		<!-- 提交操作 -->
		<view class="padding w-full margin-top">
			<view class="dflex-b border-radius-big">
				<view class="tac padding-tb-sm fwb flex1 bg-base" @click="submit">发布</view>
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
				goodsDatas: [],
				postData: {
					imgs: [],
					goods: {},
					title: '',
					content: '',
				}
			};
		},
		onLoad(options) {
			
			this.loadData();
		},
		methods: {
			async loadData() {
				let _this = this;
				
			},
			uploadImgs(options) {
				if (options.length > 0) this.postData.imgs = options;

				console.log('uploadImgs', this.postData.imgs);
			},
			submit() {
				let _this = this;
				
				if (!this.postData.title) {
					this.$api.msg('请填写标题');
					return;
				}
				if (!this.postData.content) {
					this.$api.msg('请填写正文');
					return;
				}
				
				if (this.issubmit) return;

				this.issubmit = true;
				uni.showModal({
					title: '提示',
					content: '发布',
					success: function(res) {
						if (res.confirm) {
							
						} else if (res.cancel) {
							console.log('用户点击取消');
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
