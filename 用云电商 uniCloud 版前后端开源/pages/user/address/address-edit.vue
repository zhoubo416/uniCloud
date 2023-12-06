<template>
	<view class="content bg-drak ft-main">
		<view class="gap"></view>
		<view class="row dflex border-line padding-lr">
			<text class="tit">收货人</text>
			<input class="input" type="text" v-model="addrData.consignee" placeholder="请输入收货人姓名"
				placeholder-class="placeholder" />
		</view>
		<view class="row dflex border-line padding-lr">
			<text class="tit">手机号</text>
			<input class="input" type="number" v-model="addrData.mobile" placeholder="请输入手机号码"
				placeholder-class="placeholder" />
		</view>

		<view class="row dflex border-line padding-left">
			<text class="tit">所在地区</text>
			<view class="dflex-b flex1">
				<view class="flex1 input_t" @click="openAddress">{{ addressName }}</view>
				<use-address ref="useAddress" @onConfirm="changeAddr" cancelColor="#bbb" themeColor="#FF6A6C">
				</use-address>
				<!-- <use-pickeraddr class="flex1" @change="changeAddr">
					<view class="input_t">{{ addressName }}</view>
				</use-pickeraddr> -->
				<!-- #ifdef MP-WEIXIN || MP-BAIDU -->
				<view class="iconfont icondizhi- input_t padding-lr-sm padding-tb-16" @click="choiceMapAddr"></view>
				<!-- #endif -->
				<!-- #ifdef MP-ALIPAY -->
				<view class="iconfont icondizhi- input_t padding-lr-sm padding-tb-16" @click="choiceAlipayMapAddr">
				</view>
				<!-- #endif -->
			</view>
		</view>
		<view class="row dflex border-line padding-lr">
			<text class="tit">详细地址</text>
			<input class="input" type="text" v-model="addrData.addr_detail" placeholder="请输入详细地址"
				placeholder-class="placeholder" />
		</view>
		<view class="gap"></view>
		<view class="row dflex-b padding-lr">
			<text class="tit">设为默认</text>
			<switch :checked="addrDefault" color="#FF6A6C" @change="switchChange" />
		</view>

		<view class="padding w-full margin-top">
			<view class="dflex-b border-radius-big">
				<view class="tac padding-tb-sm flex1 bg-base" @click="submit">提交</view>
			</view>
		</view>
	</view>
</template>

<script>
	const __name = 'usemall-member-address';
	export default {
		components: {},
		data() {
			return {
				addrDefault: false,
				addressName: '请选择地址 | 地图选择',
				addrData: {
					consignee: '',
					mobile: '',
					address: '',
					province_name: '',
					city_name: '',
					area_name: '',
					addr_detail: '',
					is_default: 0,
					addr_source: '录入',
					remark: '家',
					longitude: '',
					latitude: '',
				},
				id: 0,
				type: 'add',
			};
		},
		onLoad(options) {
			let title = '新增收货人';
			if (options.type === 'edit') {
				title = '编辑收货人';
				this.id = options.id;

				this.$db[__name].tofirst(this.id).then(res => {
					if (res.code == 200) {
						for (let key in this.addrData) {
							this.addrData[key] = res.datas[key];
						}
						this.addrDefault = this.addrData.is_default == '是';
						this.addressName = this.addrData.province_name + '-' + this.addrData.city_name +
							'-' + this.addrData.area_name;
					}
				});

			} else {
				// #ifdef H5 || MP-360 || MP-QQ || MP-TOUTIAO
				this.addressName = "请选择地址";
				// #endif
			}

			this.type = options.type || 'add';
			uni.setNavigationBarTitle({
				title
			});
		},
		methods: {
			switchChange(e) {
				this.addrDefault = e.detail.value;
			},
			openAddress() {
				this.$refs.useAddress.open();
			},
			// 选择地址
			changeAddr(res) {
				let _this = this;

				_this.addrData.province_name = res.labelArr[0] || '';
				_this.addrData.city_name = res.labelArr[1] || '';
				_this.addrData.area_name = res.labelArr[2] || '';

				_this.addrData.address = res.label;
				_this.addressName = _this.addrData.address;
			},
			// 选择地图地址
			choiceMapAddr(options) {
				let _this = this;

				uni.authorize({
					scope: 'scope.userLocation',
					success() {
						uni.chooseLocation({
							success: res => {
								console.log('位置', res);
								// console.log('位置名称：' + res.name);
								// console.log('详细地址：' + res.address);
								// console.log('纬度：' + res.latitude);
								// console.log('经度：' + res.longitude);

								if (res && res.name) {
									let __addr = _this.resolveAddr(res);
									_this.addrData.province_name = __addr.province || '';
									_this.addrData.city_name = __addr.city || '';
									_this.addrData.area_name = __addr.area || '';

									_this.addrData.address = __addr.addr;
									_this.addressName = _this.addrData.address;

									_this.addrData.longitude = res.longitude + '';
									_this.addrData.latitude = res.latitude + '';

									_this.addrData.addr_detail = res.name;
								}
							},
							fail(err) {
								console.log(err);
							}
						});
					},
					fail(err) {
						uni.showModal({
							title: '位置未授权，打开设置',
							success: function(res) {
								if (res.confirm) {
									uni.openSetting({});
								}
							}
						});
					}
				});
			},
			// #ifdef MP-ALIPAY
			// 选择地图地址
			choiceAlipayMapAddr(options) {
				console.log('open-location', options);
				let _this = this;

				uni.chooseLocation({
					success: res => {
						console.log('位置', res);
						if (res && res.address) {
							let __addr = _this.resolveAddr(res);
							_this.addrData.province_name = res.provinceName || '';
							_this.addrData.city_name = res.cityName || '';
							_this.addrData.area_name = res.adName || '';
							
							_this.addrData.address = [_this.addrData.province_name, _this.addrData.city_name, _this.addrData.area_name]
								.filter(x => x).join('-');
							_this.addressName = _this.addrData.address;

							_this.addrData.longitude = res.longitude;
							_this.addrData.latitude = res.latitude;

							_this.addrData.addr_detail = res.name || res.address;
						}
					},
					fail(err) {
						console.log(err);
					}
				});
			},
			// #endif
			// 解析地址
			resolveAddr(options) {
				let _this = this;
				let str = options.address;
				let __addr = {
					addr: ''
				};
				let __idx = 0;
				let __idx_pro = str.indexOf('省');

				if (__idx_pro == -1) {
					__idx = str.indexOf('自治区');
					if (__idx != -1) {
						__addr.province = str.substring(0, __idx + 3);
					} else {
						__addr.province = str.substring(0, 0);
						__idx = 0;
					}
				} else {
					__addr.province = str.substring(0, __idx_pro + 1);
				}

				if (__addr.province) __addr.addr += __addr.province + '-';

				let __idx_city = str.indexOf('市');
				if (__idx_city == -1) {
					__idx = str.indexOf('自治州');
					if (__idx != -1) {
						__addr.city = str.substring(__idx_pro + 1, __idx + 3);
					} else {
						__addr.city = str.substring(__idx + 1, __idx_city + 1);
					}
				} else {
					if (__idx == 0) {
						__addr.city = str.substring(__idx_pro + 1, __idx_city + 1);
					} else {
						__addr.city = str.substring(__idx + 3, __idx_city + 1);
					}
				}

				if (__addr.city) __addr.addr += __addr.city + '-';

				let __idx_area = str.lastIndexOf('区');
				if (__idx_area == -1) {
					__idx_area = str.indexOf('县');
					if (__idx == 0) {
						__addr.area = str.substring(__idx_city + 1, __idx_area + 1);
					} else {
						__addr.area = str.substring(__idx + 3, __idx_area + 1);
					}
				} else {
					if (__idx == 0) {
						__addr.area = str.substring(__idx_city + 1, __idx_area + 1);
					} else {
						__addr.area = str.substring(__idx + 3, __idx_area + 1);
					}
				}

				if (__addr.area) __addr.addr += __addr.area;

				return __addr;
			},

			//提交
			async submit() {
				if (this.addrDefault) {
					this.addrData.is_default = '是';
				} else {
					this.addrData.is_default = '否';
				}

				let data = this.addrData;
				if (!data.consignee) {
					this.$api.msg('请填写收货人');
					return;
				}
				if (!/(^1[3|4|5|7|8|9][0-9]{9}$)/.test(data.mobile)) {
					this.$api.msg('请输入正确的手机号码');
					return;
				}

				if (!data.address) {
					this.$api.msg('请选择地址');
					return;
				}
				if (!data.addr_detail) {
					this.$api.msg('请填写详细地址');
					return;
				}
				
				if (this.addrDefault) {
					// 把默认为是的改成 否
					await this.$db[__name]
						.where('create_uid == $env.uid && is_default == "是"')
						.update({
							is_default: '否'
						});
				}
				
				if (this.type == 'add') {

					this.$db[__name].add(data).then(res => {
						if (res.code === 200) {
							this.$api.msg('添加成功');
							this.$api.timerout(() => {
								uni.navigateBack();
							}, 100);
							return;
						} 
						
						this.$api.msg(res.msg);
					});
				} else {
					if (!this.id) {
						this.$api.msg('当前ID异常，编辑失败');
						return;
					}
					
					this.$db[__name].update(this.id, data).then(res => {
						if (res.code === 200) {
							this.$api.msg('编辑成功');
							this.$api.timerout(() => {
								uni.navigateBack();
							}, 100);
							return;
						}
						 
						this.$api.msg(res.msg);
					});
				}
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}

	.row {
		background: #fff;
		position: relative;
		height: 110rpx;

		.tit {
			flex-shrink: 0;
			width: 150rpx;
		}

		.input {
			flex: 1;
			font-size: 30rpx;
			padding-left: 0;
		}

		.input_t {
			color: #333;
		}
	}
</style>
