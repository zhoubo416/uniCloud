<template>
	<view class="use-upload dflex dflex-wrap-w">
		<view class="item pos-r" v-for="(item, index) in imgs" @click="preImage(item, imgs)" :key="index">
			<video v-if="item.type.indexOf('video/') !== -1" :src="item.url"></video>
			<image v-else :src="item.url" mode="aspectFill"></image>
			<view class="del pos-a bg-main dflex-c border-radius-c iconfont iconlajitong-01 ft-dark" @tap.stop="delImage(index)"></view>
		</view>

		<view class="item dflex-c" v-if="imgs.length < limit" @tap="chooseImage">
			<view class="iconfont iconxiangji-01 fs-big ft-dark"></view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			limit: {
				type: Number,
				default: 3
			}
		},
		data() {
			return {
				imgs: []
			};
		},
		methods: {
			chooseImage() {
				let _this = this;

				uni.chooseImage({
					count: _this.limit,
					// 可以指定是原图|压缩图，默认二者都有
					sizeType: ['original', 'compressed'],
					success: async (res) => {
						uni.showLoading({
							title: '上传中',
							mask: true
						});
						
						for (var i = 0; i < res.tempFilePaths.length; i++) {
							const result = await uniCloud.uploadFile({
								filePath: res.tempFilePaths[i],
								cloudPath: _this.$api.getFileName(res.tempFilePaths[i]),
								onUploadProgress: function(progressEvent) {
									var percentCompleted = Math.round((progressEvent.loaded *
										100) / progressEvent.total);
								}
							}).then(uRes => {
								console.log(uRes, res.tempFiles[i])
								uRes.url = uRes.fileID;
								uRes.type = res.tempFiles[i].type || '';
								uRes.size = res.tempFiles[i].size;
								
								_this.imgs.push(uRes);
								_this.sendData()
							}).catch(err => {
								console.log('use-upload', err);
							});
						}

						uni.hideLoading();
					}
				});
			},
			preImage(item, urls) {
				if (item.type.indexOf('video/') !== -1) {
					return;
				}
				
				let _urls = urls.filter(x => x.type.indexOf('image/') !== -1).map(ele => {
					return ele.url;
				});
				
				console.log(item, urls);
				uni.previewImage({
					current: item.url,
					urls: _urls,
					longPressActions: {
						itemList: ['发送给朋友', '保存图片', '收藏'],
						success: function(data) {
							console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
						},
						fail: function(err) {
							console.log(err.errMsg);
						}
					}
				});
			},

			delImage(idx) {
				this.imgs.splice(idx, 1);
				this.sendData();
			},

			sendData() {
				this.$emit('upload', this.imgs);
			}
		}
	};
</script>

<style lang="scss">
	.use-upload {
		.item {
			width: 23%;
			margin-right: 2%;
			height: 150rpx;
			border: 1px solid #f0f0f0;

			image, video {
				width: 100%;
				height: 100%;
			}
		}

		.del {
			top: -30rpx;
			right: -10rpx;
			width: 50rpx;
			height: 50rpx;
			z-index: 99;
			box-shadow: 0px 3px 5px #f0f0f0;
		}
	}
</style>
