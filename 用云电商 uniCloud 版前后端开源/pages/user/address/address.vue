<template>
	<view class="padding-lr padding-bottom-big margin-bottom ft-main bg-drak">
		<view class="bg-main padding-top padding-lr border-radius margin-top-sm" v-for="(item, index) in addressDatas"
			:key="index" @click="selectAddr(item)">
			<view class="w-full dflex-wrap-w border-line">
				<view class="fwb margin-bottom-xs desc">
					<text>{{ item.address }} {{ item.addr_detail }}</text>
				</view>
				<view class="margin-bottom-sm">
					<text>{{ item.consignee }}</text>
					<text class="margin-left">{{ item.mobile }}</text>
				</view>
			</view>
			<view class="dflex-b">
				<view v-if="item.is_default == '是'" class="dflex active">
					<text class="iconfont iconxuanzhongzhuangtai padding-tb-sm padding-right-sm"></text>
					<text> 默认地址</text>
				</view>
				<view v-else class="dflex ft-dark" @tap.stop="setDefault(item)">
					<text class="iconfont iconweixuanzhongzhuangtai padding-tb-sm padding-right-sm"></text>
					<text> 设为默认</text>
				</view>
				<view v-if="source == 0 || source == 1" class="dflex">
					<view class="padding-tb-sm padding-right-sm" @tap.stop="addAddr('edit', item)"><text
							class="iconfont iconbianji-01 ft-dark"></text></view>
					<view class="padding-tb-sm padding-left-sm" @tap.stop="removeAddr(item)"><text
							class="iconfont iconlajitong-01 ft-dark"></text></view>
				</view>
			</view>
		</view>

		<view class="btn-container dflex-b pos-f border-radius-big">
			<view v-if="is_mp" class="tac padding-tb-sm flex1 bg-main" @click="importAddr">{{ platform_name }}导入</view>
			<view class="tac padding-tb-sm flex1 bg-base" @click="addAddr('add')">添加地址</view>
		</view>
	</view>
</template>

<script>
	const __name = 'usemall-member-address';
	export default {
		data() {
			return {
				env: {},

				is_mp: false,
				platform: '',
				platform_name: '',
				platform_icon: '',

				source: 0,
				addressDatas: []
			};
		},
		onLoad(option) {
			this.$api.get_env((res) => {
				this.env = res;
				// console.log(this.env);
				this.is_mp = this.env.is_mp;
				this.platform = this.env.platform;
				this.platform_icon = this.env.platform_icon;
				this.platform_name = this.env.platform_name;
			});

			this.source = option.source || 0;
		},
		onShow() {
			this.loadData();
		},
		methods: {
			// 加载数据
			loadData() {
				// 收货人列表
				this.$db[__name].where('create_uid == $cloudEnv_uid').tolist({
					orderby: 'is_default desc'
				}).then(res => {
					if (res.code === 200) {
						this.addressDatas = res.datas;
						return;
					}
					this.$api.msg(res.msg);
				});
			},
			// 导入地址
			importAddr() {
				let _this = this;

				uni.chooseAddress({
					success(res) {
						let addr = {};

						addr.is_default = '否';
						addr.consignee = res.userName;
						addr.mobile = res.telNumber;
						addr.addr_detail = res.detailInfo;
						addr.province_name = res.provinceName;
						addr.city_name = res.cityName;
						addr.area_name = res.countyName || '';

						// #ifdef MP-ALIPAY
						addr.area_name = res.result.area;
						// #endif

						addr.address = `${addr.province_name}-${addr.city_name}-${addr.area_name}`;
						addr.addr_source = _this.$env.platform;

						if (!addr.mobile) {
							_this.$api.msg('收货人手机不存在')
							return;
						}
						console.log('uni chooseAddress', addr)
						_this.$db[__name].add(addr).then(res => {
							if (res.code === 200) {
								_this.$api.msg('导入成功');
								_this.loadData();
								return;
							}

							_this.$api.msg(res.msg);
						});

					},
					fail(err) {
						if (err.errMsg.indexOf('cancel') !== -1) {
							_this.$api.msg('已取消')
						} else {
							uni.showModal({
								content: '打开授权',
								success: e => {
									if (e.confirm) {
										uni.openSetting({

										})
									}
								}
							});
						}
					}
				})
			},
			// 默认地址
			setDefault(options) {
				uni.showModal({
					title: '提示',
					content: '设为默认',
					success: async (res) => {
						if (res.confirm) {
							// 把默认为是的改成 否
							await this.$db[__name]
								.where('create_uid == $env.uid && is_default == "是"')
								.update({
									is_default: '否'
								})
								.then(res => {

								});

							// 把当前 _id 改成 是
							await this.$db[__name]
								.update(options._id, {
									is_default: '是'
								})
								.then(res => {
									if (res.code === 200) {
										this.loadData();
									}
								});
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			// 选择地址
			selectAddr(options) {
				if (this.source == 1) {
					uni.$emit('__event_choice_address', options);
					uni.navigateBack();
				}
			},
			// 添加|编辑 收货人
			addAddr(type, options) {
				options = options || {
					id: 0
				};
				uni.navigateTo({
					url: `/pages/user/address/address-edit?type=${type}&id=${options._id}`
				});
			},
			// 删除收货人
			removeAddr(options) {
				let _this = this;
				uni.showModal({
					title: '提示',
					content: '删除收货人',
					success: async function(res) {
						if (res.confirm) {
							await _this.$db[__name].remove(options._id)
								.then(res => {
									if (res.code === 200) {
										_this.loadData();
									}
								});
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

	.desc {
		font-size: $font-lg;
	}

	.btn-container {
		left: 20rpx;
		right: 20rpx;
		bottom: 20rpx;
	}
</style>
