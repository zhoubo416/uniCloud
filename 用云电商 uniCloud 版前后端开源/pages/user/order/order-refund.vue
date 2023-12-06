<template>
	<view>
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

		<!-- 退款区 -->
		<view class="padding-lr-xs padding-bottom-sm">
			<use-list-title title="货物状态" type="round" color="#333" :tip="goods_state" iconfont=" "
				@goto="openActionSheet(1)"></use-list-title>
		</view>
		<view class="padding-lr-xs">
			<use-list-title title="退款原因" type="round" color="#333" :tip="reason" iconfont=" "
				@goto="openActionSheet(2)"></use-list-title>
		</view>

		<view class="refund-area padding margin-lr margin-tb-sm bg-main border-radius">
			<view class="dflex-b">
				<text class="item margin-right-sm">退款金额：</text>
				<text class="price">{{refund_money / 100}}</text>
			</view>
		</view>

		<!-- 上传凭证 -->
		<view class="padding margin-lr margin-tb-sm bg-main border-radius">
			<!-- 退款说明 -->
			<textarea v-model="desc" class="ft-black w-full margin-0 padding-0 fs-sm"
				placeholder="请填写退款说明（选填）"></textarea>

			<!-- 上传图片 -->
			<use-upload class="pos-r" @upload="refundImgs"></use-upload>
		</view>

		<!-- 提交操作 -->
		<view class="padding w-full margin-top">
			<view class="dflex-b border-radius-big">
				<view class="tac padding-tb-sm flex1 bg-base" @click="submit">提交申请</view>
			</view>
		</view>

		<!-- 用云版权 -->
		<use-copyright></use-copyright>

		<!-- 操作菜单 -->
		<use-action-sheet v-model="actionSheetShow" :list="actionSheetList" :tips="actionSheetTips"
			@click="actionSheetClick" @close="actionSheetClose"></use-action-sheet>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				issubmit: false,
				goods_state: '请选择',
				reason: '请选择',
				desc: '', // 退款说明
				// 订单ID
				order_id: '',
				// 退款金额
				refund_money: 0,

				// 商品数据
				order_detail: [],
				// 订单数据
				order_data: {},

				postData: {
					order_id: '',
					goods_state: '',
					reason: '',
					desc: '',
					imgs: [],
					refund_money: 0,
				},

				actionSheetShow: false,
				actionSheetList: [],
				actionSheetTips: {
					text: "退出登录 | 切换账号",
					color: "#9a9a9a",
					size: 24
				},
			};
		},
		onUnload() {
			uni.$emit('__event_order', 'refresh');
		},
		onLoad(option) {
			this.order_id = option.order_id;
			if (!this.order_id) {
				this.$api.msg('订单编号不存在');
			}
			this.loadData();
		},
		methods: {
			async loadData() {
				let _this = this;
				await this.$func.usemall.call('order/detail', {
					order_id: _this.order_id
				}).then(res => {
					if (res.code === 200) {
						_this.order_data = res.datas.order;
						_this.order_detail = res.datas.order_detail;

						// 退款金额为实付款金额
						_this.refund_money = _this.order_data.order_actural_paid;
					}
				})
			},
			refundImgs(options) {
				let imgs = [];

				options.forEach((_) => {
					imgs.push(_.url);
				});

				if (imgs.length > 0) this.postData.imgs = imgs;

				console.log('refundImgs', this.postData.imgs);
			},
			submit() {
				if (!this.postData.goods_state) {
					this.$api.msg('请选择货物状态');
					return;
				}
				if (!this.postData.reason) {
					this.$api.msg('请选择退款原因');
					return;
				}

				if (this.issubmit) return;

				this.issubmit = true;

				this.postData.order_id = this.order_id;
				this.postData.refund_money = this.refund_money;
				this.postData.desc = this.desc;

				let _this = this;
				uni.showModal({
					title: '提示',
					content: '申请退款',
					success: function(res) {
						if (res.confirm) {

							_this.$func.usemall.call('order/refund', _this.postData).then(res => {
								if (res.code === 200) {
									_this.$api.msg('提交成功');
									//setTimeout(() => {
									_this.issubmit = false;
									uni.navigateBack({});
									//}, 1000);
									return;
								}
								_this.$api.msg(res.msg);
								_this.issubmit = false;
							});
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});

			},
			// 打开操作菜单
			openActionSheet(idx) {

				let type = '';
				let actionSheetList = [];

				switch (idx) {
					case 1:
						type = "货物状态";
						this.actionSheetTips.text = "请选择" + type;
						actionSheetList = [{
							text: "已收到货",
							color: "#333",
							type: type
						}, {
							text: "未收到货",
							color: "#333",
							type: type
						}, ];

						break;
					case 2:
						type = "退款原因";
						this.actionSheetTips.text = "请选择" + type;
						actionSheetList = [{
							text: "未发货不要了",
							color: "#333",
							type: type
						}, {
							text: "拍错了，重新下单",
							color: "#333",
							type: type
						}, {
							text: "换一家，质量不好",
							color: "#333",
							type: type
						}, {
							text: "其他",
							color: "#333",
							type: type
						}, ];

						break;
				}

				this.actionSheetShow = true;
				this.actionSheetList = actionSheetList;
			},
			// 关闭操作菜单
			actionSheetClose() {
				console.log(this.actionSheetShow);
			},
			// 点击操作菜单
			actionSheetClick(index) {
				let item = this.actionSheetList[index];

				switch (item.type) {
					case '货物状态':
						this.goods_state = item.text;
						this.postData.goods_state = item.text;
						break;
					case '退款原因':
						this.reason = item.text;
						this.postData.reason = item.text;
						break;
				}
			},
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

	/* 退款区 */
	.refund-area {
		line-height: 60rpx;

		.desc {
			line-height: 60rpx;
		}
	}
</style>
