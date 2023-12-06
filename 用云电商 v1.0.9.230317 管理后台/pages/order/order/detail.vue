<template>
	<div>
		<div class="step_container">
			<div v-if="orderData.order_id && orderData.state != '已取消'" class="dflex">
				<div class="step dflex_d_c dflex_c pos_r" :class="active >= 1 ? 'active' : ''">
					<div class="circle dflex_c">
						<i class="iconfont" :class="active >= 1 ? 'iconwancheng' : 'iconshijian'"></i>
						<div class="line"></div>
					</div>
					<div class="title margin_t_5">提交订单</div>
					<div class="time margin_t_5" v-if="active >= 1">2020.09.30 12:08:57</div>
				</div>
				<div class="step dflex_d_c dflex_c pos_r" :class="active >= 2 ? 'active' : ''">
					<div class="circle dflex_c">
						<i class="iconfont" :class="active >= 2 ? 'iconwancheng' : 'iconshijian'"></i>
						<div class="line"></div>
					</div>
					<div class="title margin_t_5">已付款</div>
					<div class="time margin_t_5" v-if="active >= 2">2020.09.30 12:08:57</div>
				</div>
				<div class="step dflex_d_c dflex_c pos_r" :class="active >= 3 ? 'active' : ''">
					<div class="circle dflex_c">
						<i class="iconfont" :class="active >= 3 ? 'iconwancheng' : 'iconshijian'"></i>
						<div class="line"></div>
					</div>
					<div class="title margin_t_5">已发货</div>
					<div class="time margin_t_5" v-if="active >= 3">2020.09.30 12:08:57</div>
				</div>
				<div class="step dflex_d_c dflex_c pos_r" :class="active >= 4 ? 'active' : ''">
					<div class="circle dflex_c">
						<i class="iconfont" :class="active >= 4 ? 'iconwancheng' : 'iconshijian'"></i>
						<div class="line"></div>
					</div>
					<div class="title margin_t_5">已收货</div>
					<div class="time margin_t_5" v-if="active >= 4">2020.09.30 12:08:57</div>
				</div>
				<div class="step dflex_d_c dflex_c pos_r" :class="active >= 5 ? 'active' : ''">
					<div class="circle dflex_c"><i class="iconfont"
							:class="active >= 5 ? 'iconwancheng' : 'iconshijian'"></i></div>
					<div class="title margin_t_5">已评价</div>
					<div class="time margin_t_5" v-if="active >= 5">2020.09.30 12:08:57</div>
				</div>
			</div>
		</div>
		<div class="container margin_b_0">
			<h3 class="margin_b_20">基本信息</h3>
			<div class="dflex">
				<div>
					<div class="dflex table">
						<div class="table_title padding_l_10"></div>
						<div class="table_content padding_l_10"></div>
						<div class="table_title padding_l_10">订单编号</div>
						<div class="table_content padding_l_10">
							{{ orderData.order_id || '--' }}
							<span class="copy" v-if="orderData.order_id" @click="copy(orderData.order_id)">复制</span>
						</div>
						<div class="table_title padding_l_10">下单人openid</div>
						<div class="table_content padding_l_10">
							{{ orderData.order_member_openid || '--' }}
							<span class="copy" v-if="orderData.order_member_openid"
								@click="copy(orderData.order_member_openid)">复制</span>
						</div>
					</div>
					<div class="dflex table">
						<div class="table_title padding_l_10 border_top_none">下单人</div>
						<div class="table_content padding_l_10 border_top_none">
							<div class="dflex_vertical_c pos_a">
								<img class="headimg"
									:src="orderData.order_member_headimg || '/static/img/default.jpg'" />
								<div class="margin_l_10">
									<div>{{ orderData.order_member_name || '--' }}</div>
									<div class="margin_t_5">{{ orderData.order_member_mobile || '--' }}</div>
								</div>
							</div>
						</div>
						<div class="table_title padding_l_10">收货人</div>
						<div class="table_content padding_l_10">{{ orderData.order_consignee || '--' }}</div>
						<div class="table_title padding_l_10">收货人手机号</div>
						<div class="table_content padding_l_10">{{ orderData.order_consignee_tel || '--' }}</div>
					</div>
					<div class="dflex table">
						<div class="table_title padding_l_10 border_top_none"></div>
						<div class="table_content padding_l_10 border_top_none"></div>
						<div class="table_title padding_l_10">快递公司</div>
						<div class="table_content padding_l_10">{{ orderData.order_express || '--' }}</div>
						<div class="table_title padding_l_10">快递单号</div>
						<div class="table_content padding_l_10">
							{{ orderData.order_express_no || '--' }}
							<span class="copy" v-if="orderData.order_express_no"
								@click="copy(orderData.order_express_no)">复制</span>
						</div>
					</div>
					<div class="dflex table">
						<div class="table_title padding_l_10">支付编号</div>
						<div class="table_content padding_l_10">{{ orderData.order_pay_no || '--' }}</div>
						<div class="table_title padding_l_10">支付方式</div>
						<div class="table_content padding_l_10">{{ orderData.order_pay_way || '--' }}</div>
						<div class="table_title padding_l_10">支付渠道</div>
						<div class="table_content padding_l_10">{{ orderData.order_pay_original || '--' }}</div>
					</div>
					<div class="dflex table">
						<div class="table_title padding_l_10">支付状态</div>
						<div class="table_content padding_l_10">{{ orderData.order_pay_state || '--' }}</div>
						<div class="table_title padding_l_10">订单总金额</div>
						<div class="table_content padding_l_10">{{ orderData.order_total_money + '' || '--' }}</div>
						<div class="table_title padding_l_10">订单数量</div>
						<div class="table_content padding_l_10">{{ orderData.order_total_cnt + '' || '--' }}</div>
					</div>
					<div class="dflex table">
						<div class="table_title padding_l_10">订单方式</div>
						<div class="table_content padding_l_10">{{ orderData.order_way || '--' }}</div>
						<div class="table_title padding_l_10">订单信息</div>
						<div class="table_content padding_l_10">{{ orderData.order_info || '--' }}</div>
						<div class="table_title padding_l_10">订单类型</div>
						<div class="table_content padding_l_10">{{ orderData.order_type || '--' }}</div>
					</div>
					<div class="dflex table">
						<div class="table_title padding_l_10">订单折扣</div>
						<div class="table_content padding_l_10">{{ orderData.order_discount + '' || '--' }}</div>
						<div class="table_title padding_l_10">商品SKU数量</div>
						<div class="table_content padding_l_10">{{ orderData.order_sku_cnt + '' || '--' }}</div>
						<div class="table_title padding_l_10">出行人数量</div>
						<div class="table_content padding_l_10">{{ orderData.order_trip_cnt + '' || '--' }}</div>
					</div>
					<div class="dflex table">
						<div class="table_title padding_l_10">商品数量</div>
						<div class="table_content padding_l_10">{{ orderData.order_goods_cnt + '' || '--' }}</div>
						<div class="table_title padding_l_10">实际付款金额</div>
						<div class="table_content padding_l_10">{{ orderData.order_actural_paid + '' || '--' }}</div>
						<div class="table_title padding_l_10">来源</div>
						<div class="table_content padding_l_10">{{ orderData.order_from || '--' }}</div>
					</div>
					<div class="dflex table">
						<div class="table_title padding_l_10">退款状态</div>
						<div class="table_content padding_l_10">{{ orderData.order_refund_state || '--' }}</div>
						<div class="table_title padding_l_10">退款原因</div>
						<div class="table_content padding_l_10">{{ orderData.order_refund_reason || '--' }}</div>
						<div class="table_title padding_l_10">退款说明</div>
						<div class="table_content padding_l_10">{{ orderData.order_refund_desc || '--' }}</div>
					</div>
					<div class="dflex table">
						<div class="table_title padding_l_10">拒绝退款原因</div>
						<div class="table_content padding_l_10">{{ orderData.order_refund_remark || '--' }}</div>
						<div class="table_title padding_l_10">状态</div>
						<div class="table_content padding_l_10">{{ orderData.state || '--' }}</div>
						<div class="table_title padding_l_10">备注</div>
						<div class="table_content padding_l_10">{{ orderData.remark || '--' }}</div>
					</div>
				</div>
			</div>
		</div>
		<div class="detail pos_r margin_b_20">
			<el-tabs v-model="tab" @tab-click="cutTabs">
				<el-tab-pane label="收货人" name="consignee">
					<consignee :data="orderData"></consignee>
				</el-tab-pane>
				<el-tab-pane label="商品" name="goods">
					<goods v-if="tab == 'goods'"></goods>
				</el-tab-pane>
				<el-tab-pane label="日志" name="log">
					<log v-if="tab == 'log'"></log>
				</el-tab-pane>
				<el-tab-pane label="评价" name="evaluate">
					<evaluate v-if="tab == 'evaluate'"></evaluate>
				</el-tab-pane>
				<el-tab-pane label="支付" name="pay">
					<pay v-if="tab == 'pay'"></pay>
				</el-tab-pane>
			</el-tabs>
			<div class="btn pos_a"><el-button round icon="el-icon-back" @click="returnPage">返回列表</el-button></div>
		</div>
	</div>
</template>

<script>
	import bus from '@/common/bus';
	import consignee from './consignee';
	import goods from './goods';
	import log from './log';
	import evaluate from './evaluate';
	import pay from './pay';
	const __name = 'usemall-order';
	export default {
		components: {
			consignee,
			goods,
			log,
			evaluate,
			pay
		},
		data() {
			return {
				dataId: '',
				tab: 'consignee',
				active: 3,
				orderData: {}
			};
		},
		methods: {
			cutTabs(res) {
				uni.setStorage({
					key: 'order_detail_tab',
					data: res.name
				});
			},
			async loadData() {
				await this.$db[__name]
					.where({
						order_id: this.dataId
					})
					.tofirst()
					.then(res => {
						if (res.code == 200) {
							this.orderData = res.datas;
						}
					});
			},
			copy(data) {
				uni.setClipboardData({
					data: data,
					showToast: false,
					success: () => {
						this.$message({
							message: '复制成功',
							type: 'success'
						});
					}
				});
			},
			returnPage() {
				if (this.$route.query.flag == 'order_list') {
					bus.$emit('tab-close');
					this.$router.push('/pages/order/order/order_list');
				} else if (this.$route.query.flag == 'refunds_dispose') {
					bus.$emit('tab-close');
					this.$router.push('/pages/order/refunds_dispose');
				}
			}
		},
		created() {
			this.dataId = this.$route.query.order_id || '';
			this.loadData();
		},
		mounted() {
			this.tab = uni.getStorageSync('order_detail_tab') || 'consignee';
		}
	};
</script>

<style>
	.step_container {
		padding: 20px 0 40px 60px;
	}

	.step {
		margin-right: 140px;
	}

	.step .circle {
		border-radius: 50%;
		width: 60px;
		height: 60px;
		background: #dbdbdb;
		position: relative;
	}

	.step .circle .iconfont {
		color: #fff;
		font-size: 22px;
	}

	.step .title {
		font-size: 14px;
	}

	.step .time {
		font-size: 12px;
		color: #8a8a8a;
		position: absolute;
		width: 120px;
		bottom: -16px;
		left: 50%;
		transform: translateX(-50%);
	}

	.line {
		position: absolute;
		left: 80px;
		top: 30px;
		width: 100px;
		border-bottom: 1px solid #cdcdcd;
	}

	.step.active .circle {
		background: #ff6a6a;
	}

	.step.active .line {
		border-bottom: 1px solid #fe7171;
	}

	.table>div {
		border-top: 1px solid #ededed;
	}

	.table>div:nth-child(2n + 1) {
		background-color: #f6f6f6;
		font-weight: 800;
		border-left: 1px solid #ededed;
		border-right: 1px solid #ededed;
	}

	.table>div:last-child {
		border-right: 1px solid #ededed;
	}

	.table:last-child>div {
		border-bottom: 1px solid #ededed;
	}

	.table_title,
	.table_content {
		width: 120px;
		height: 46px;
		display: flex;
		align-items: center;
	}

	.table_content {
		width: 360px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.border_top_none {
		border-top: none !important;
	}

	.detail .btn {
		top: 7px;
		right: 0;
	}
</style>
