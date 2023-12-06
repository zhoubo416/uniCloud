<template>
	<div>
		<el-row :gutter="16">
			<el-col :span="8">
				<div class="left_content dflex_c">
					<div class="detail_left center_just">
						<el-image class="headimg" :src="memberData.member_headimg || '/static/img/default.jpg'"
							:preview-src-list="memberData.imgs" fit="contain"></el-image>
						<div>{{ memberData.member_name }}</div>
					</div>
					<div class="detail_right">
						<div class="dflex margin_b_10">
							<div class="detail_title right_just">性别：</div>
							<div>{{ memberData.member_gender }}</div>
						</div>
						<div class="dflex margin_b_10">
							<div class="detail_title right_just">城市：</div>
							<div>{{ memberData.member_city }}</div>
						</div>
						<div class="dflex margin_b_10">
							<div class="detail_title right_just">登录ip：</div>
							<div>{{ memberData.member_login_current_ip }}</div>
						</div>
						<div class="dflex margin_b_10">
							<div class="detail_title right_just">注册时间：</div>
							<div>{{ memberData.create_time }}</div>
						</div>
						<div class="dflex">
							<div class="detail_title right_just">上次登录时间：</div>
							<div>{{ memberData.last_modify_time }}</div>
						</div>
					</div>
				</div>
			</el-col>
			<el-col :span="16">
				<div class="right_content dflex">
					<div class="dflex_vertical_c order">
						<div class="circle_txt dflex_c margin_r_20">券</div>
						<div>
							<div class="order_title">优惠券</div>
							<v-countup class="order_data" start-value="0" :end-value="memberData.member_coupon_cnt">
							</v-countup>
						</div>
					</div>
					<div class="dflex_vertical_c order">
						<div class="circle_txt dflex_c margin_r_20">金</div>
						<div>
							<div class="order_title">累计消费</div>
							<v-countup class="order_data" start-value="0" :end-value="memberData.member_monetary"
								decimals="2"></v-countup>
						</div>
					</div>
					<div class="dflex_vertical_c order">
						<div class="circle_txt dflex_c margin_r_20">登</div>
						<div>
							<div class="order_title">登录次数</div>
							<v-countup class="order_data" start-value="0" :end-value="memberData.member_login_cnt">
							</v-countup>
						</div>
					</div>
					<div class="dflex_vertical_c order">
						<div class="circle_txt dflex_c margin_r_20">充</div>
						<div>
							<div class="order_title">充值金额</div>
							<v-countup class="order_data" start-value="0" :end-value="memberData.member_amount">
							</v-countup>
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
		<div class="detail pos_r">
			<el-tabs v-model="tab" @tab-click="cutTabs">
				<el-tab-pane :label="`订单 ${totalObj.order_cnt || 0}`" name="order">
					<order v-if="tab == 'order'"></order>
				</el-tab-pane>
				<el-tab-pane :label="`足迹 ${totalObj.footprint_cnt || 0}`" name="footprint">
					<footprint v-if="tab == 'footprint'"></footprint>
				</el-tab-pane>
				<el-tab-pane :label="`收藏 ${totalObj.collect_cnt || 0}`" name="collect">
					<collect v-if="tab == 'collect'"></collect>
				</el-tab-pane>
				<el-tab-pane :label="`地址 ${totalObj.address_cnt || 0}`" name="consigneeAddress">
					<consigneeAddress v-if="tab == 'consigneeAddress'"></consigneeAddress>
				</el-tab-pane>
			</el-tabs>
			<div class="btn pos_a">
				<el-button round icon="el-icon-back" @click="returnPage">返回列表</el-button>
			</div>
		</div>
	</div>
</template>

<script>
	import bus from '@/common/bus';
	import vCountup from 'vue-countupjs';
	import order from './order';
	import footprint from './footprint';
	import collect from './collect';
	import consigneeAddress from './consignee_address';
	const __name = 'usemall-member';
	export default {
		components: {
			vCountup,
			order,
			footprint,
			collect,
			consigneeAddress
		},
		data() {
			return {
				dataId: '',
				tab: '',
				req: {
					page: 1,
					rows: 10,
					orderby: 'sort asc'
				},
				memberData: {
					imgs: []
				},
				totalObj: {
					address_cnt: 0,
					collect_cnt: 0,
					footprint_cnt: 0,
					order_cnt: 0
				}
			};
		},
		methods: {
			cutTabs(res) {
				uni.setStorage({
					key: 'member_detail_tab',
					data: res.name
				});
			},
			async loadData() {
				await this.$db[__name].tofirst(this.dataId).then(res => {
					if (res.code == 200) {
						res.datas.imgs = [res.datas.member_headimg ||
							'/static/img/default.jpg'
						];
						switch (res.datas.member_gender) {
							case 1:
								res.datas.member_gender = '男';
								break;
							case 2:
								res.datas.member_gender = '女';
								break;
							default:
								res.datas.member_gender = '未知';
								break;
						}
						if (res.datas.create_time) {
							res.datas.create_time = new Date(res.datas.create_time).format();
						}
						if (res.datas.last_modify_time) {
							res.datas.last_modify_time = new Date(res.datas.last_modify_time).format();
						}
						this.memberData = res.datas;
					}
				});
				let start = new Date().getTime();
				const totalDatas = await Promise.all([
					this.$db['usemall-order']
					.collection()
					.where({
						is_delete: 0,
						create_uid: this.dataId
					})
					.count(),
					this.$db['usemall-goods-history']
					.collection()
					.where({
						create_uid: this.dataId
					})
					.count(),
					this.$db['usemall-member-collect']
					.collection()
					.where({
						create_uid: this.dataId
					})
					.count(),
					this.$db['usemall-member-address']
					.collection()
					.where({
						create_uid: this.dataId
					})
					.count()
				]);

				this.totalObj.order_cnt = totalDatas[0].result.total;
				this.totalObj.footprint_cnt = totalDatas[1].result.total;
				this.totalObj.collect_cnt = totalDatas[2].result.total;
				this.totalObj.address_cnt = totalDatas[3].result.total;
			},
			returnPage() {
				bus.$emit('tab-close');
				this.$router.push('/pages/member/list/member_list');
			}
		},
		created() {
			this.dataId = this.$route.query.id || '';
			this.loadData();
		},
		mounted() {
			this.tab = uni.getStorageSync('member_detail_tab') || 'order';
		}
	};
</script>

<style>
	.left_content,
	.right_content {
		background-color: #fff;
		height: 200px;
		border-radius: 10px;
	}

	.detail_left {
		margin: 0 80px 0 0;
	}

	.detail_title {
		color: #8a8a8a;
		width: 8.125rem;
	}

	.order {
		margin-left: 80px;
	}

	.circle_txt {
		font-size: 24px;
		color: #fff;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background-color: #ff6b6b;
	}

	.order_title {
		font-size: 14px;
	}

	.order_data {
		font-size: 28px;
	}

	.detail .btn {
		transform: translate(-0, -50%);
		top: 50%;
		right: 0;
	}
</style>
