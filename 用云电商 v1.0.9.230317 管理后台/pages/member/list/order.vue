<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container member_order use-table">
			<div class="container_status dflex_vertical_c">
				<div class="item_interval" v-for="(item, i) in stateDatas" :key="i">
					<el-button class="badge_txt" :class="{ active: item.name == state }" size="small"
						@click="cutSta(item)">{{ item.name }}</el-button>
					<v-countup class="badge" start-value="0" :end-value="item.cnt"></v-countup>
				</div>
			</div>
			<el-table row-key="_id" ref="etbl" :expand-row-keys="expandKeys" show-summary :summary-method="getSummaries"
				:height="tblHeight" :data="tableDatas" highlight-current-row>
				<el-table-column type="expand" width="70">
					<template slot-scope="props">
						<el-form label-position="left" inline>
							<div class="order_detail margin_b_20" v-for="(item, i) in props.row.order_details" :key="i">
								<div class="dflex_vertical_c padding_10">
									<el-image style="width: 90px;" :src="item.goods_img" :preview-src-list="item.imgs"
										fit="contain"></el-image>
									<div class="order_detail_right margin_l_10 dflex_d_c dflex_sb">
										<div>{{ item.goods_name }}</div>
										<div class="dflex">
											<div class="bbb margin_r_30">×{{ item.goods_num }}</div>
											<div class="bbb margin_l_30">{{ item.goods_sku_name }}</div>
										</div>
										<div class="dflex_e">
											<div class="price margin_r_5">{{ item.goods_price / 100 }}</div>
											<div class="m_price">{{ item.goods_market_price / 100 }}</div>
										</div>
									</div>
								</div>
							</div>
						</el-form>
					</template>
				</el-table-column>
				<el-table-column label="买家" align="center" width="300">
					<template slot-scope="scope">
						<div class="dflex_vertical_c">
							<el-image class="headimg_small"
								:src="scope.row.order_member_headimg || '/static/img/default.jpg'"
								:preview-src-list="scope.row.imgs" fit="contain"></el-image>
							<div class="margin_l_10">
								<div class="left_just">{{ scope.row.order_member_name }}</div>
								<div>{{ scope.row.order_id }}</div>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column property="create_time" label="下单时间" align="center"></el-table-column>
				<el-table-column label="订单总额" prop="order_total_money" align="center">
					<template slot-scope="scope">
						<div class="price">{{ scope.row.order_total_money / 100 }}</div>
					</template>
				</el-table-column>
				<el-table-column property="order_total_cnt" label="商品数" align="center"></el-table-column>
				<el-table-column property="order_from" label="订单来源" align="center"></el-table-column>
				<el-table-column property="state" label="订单状态" align="center"></el-table-column>
				<el-table-column property="order_pay_way" label="支付方式" align="center"></el-table-column>
			</el-table>
			<el-pagination :current-page="req.page" :page-sizes="[10, 20, 30, 50, 100]" :page-size="req.rows"
				layout="total, sizes, prev, pager, next, jumper" :total="tableTotal" @size-change="sizeChange"
				@current-change="currentChange"></el-pagination>
		</div>
	</div>
</template>

<script>
	import vCountup from 'vue-countupjs';
	const __name = 'usemall-order, usemall-order-detail';
	export default {
		components: {
			vCountup
		},
		data() {
			return {
				dataId: '',
				state: '全部',
				stateObj: {
					待付款: 0,
					待发货: 0,
					待评价: 0,
					已完成: 0,
					已取消: 0,
					全部: 0
				},
				stateDatas: [],
				req: {
					page: 1,
					rows: 10,
					orderby: 'create_time desc',
					state: ''
				},
				tblHeight: 0,
				tableDatas: [],
				tableTotal: 0,
				expandKeys: []
			};
		},
		methods: {
			async loadData() {
				this.stateDatas = [];
				for (let key in this.stateObj) {
					this.stateDatas.push({
						name: key,
						cnt: this.stateObj[key]
					});
				}

				this.$db[__name]
					.where({
						is_delete: 0,
						create_uid: this.dataId
					})
					.whereif(this.req.state && this.req.state != '全部', {
						state: this.req.state
					})
					.withgroup({
						field: 'state',
						obj: this.stateObj
					})
					.totable(this.req)
					.then(res => {
						if (res.code == 200) {
							if (res.datas.group && res.datas.group.datas) {
								this.stateDatas = res.datas.group.datas;
							}

							res.datas.rows.forEach((row, idx) => {
								if (idx == 0) {
									this.expandKeys.push(row._id);
								}
								row.imgs = [row.order_member_headimg];
								row.create_time = new Date(row.create_time).format();
								row.order_details = row.order_id['usemall-order-detail'];
								row.order_details.every(x => (x.imgs = [x.goods_img]));
								row.order_id = row.order_details[0].order_id;
							});
							this.tableDatas = res.datas.rows;
							this.tableTotal = res.datas.total;
						}
					});
			},
			cutSta(item) {
				this.state = item.name;
				this.req.state = item.name;

				this.loadData();
			},
			sizeChange(size) {
				this.req.rows = size;
				this.loadData();
			},
			currentChange(current) {
				this.req.page = current;
				this.loadData();
			},
			getSummaries(param) {
				const {
					columns,
					data
				} = param;
				const sums = [];
				columns.forEach((column, index) => {
					if (index === 0) {
						sums[index] = '合计';
						return;
					}

					if (!column.property) return;

					if (index === 3) {
						const values = data.map(item => item[column.property] / 100);
						let totalMoney = eval(values.join('+'));
						if (typeof totalMoney === 'number') {
							sums[index] = `${totalMoney.toFixed(2)} 元`;
							let timer = setTimeout(() => {
								document.querySelector(
										'.el-table__footer .has-gutter  td:nth-child(4) div').classList
									.add('price');
								this.$refs.etbl.doLayout();
							}, 0);
						}
						return;
					}

					if (index === 4) {
						const values = data.map(item => item[column.property]);

						sums[index] = `${eval(values.join('+'))} 单`;
						return;
					}

					sums[index] = 'N/A';
				});

				return sums;
			}
		},
		created() {
			this.dataId = this.$route.query.id || '';
			this.loadData();
		},
		updated() {
			if (!this.tblHeight) {
				this.tblHeight = this.$refs.tbl.tblHeight;
			}
		}
	};
</script>

<style>
	.member_order .badge_txt {
		background-color: #fff;
	}

	.member_order .badge_txt:hover {
		background-color: #fff !important;
	}

	.order_detail {
		background-color: #f6f6f6;
	}

	.order_detail:last-child {
		border: 0;
		padding: 0;
		margin: 0;
	}

	.order_detail_right {
		height: 6.25rem;
	}
</style>
