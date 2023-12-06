<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container_status dflex_vertical_c">
			<div class="item_interval" v-for="(item, i) in stateDatas" :key="i">
				<el-button class="badge_txt" :class="{ active: item.name == state }" size="small" @click="cutSta(item)">
					{{ item.name }}</el-button>
				<v-countup class="badge" start-value="0" :end-value="item.cnt"></v-countup>
			</div>
		</div>
		<div class="container padding_b_0">
			<div class="dflex_wrap">
				<div class="dflex_vertical_c margin_r_40 margin_b_20">
					<div class="search_name">订单号：</div>
					<el-input v-model="req.order_id" placeholder="请输入" @input="loadData" type="number"
						class="search_input"></el-input>
				</div>
				<div class="dflex_vertical_c margin_r_40 margin_b_20" v-if="advancedSearch">
					<div class="search_name">下单时间：</div>
					<el-date-picker v-model="searchTime" type="daterange" align="right" unlink-panels
						range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd"
						value-format="yyyy-MM-dd" :picker-options="pickerOptions" class="search_start_end_time"
						@change="loadData"></el-date-picker>
				</div>
				<el-button size="mini" class="search_btn margin_b_20 margin_r_40" @click="loadData">搜索</el-button>
				<div class="search_advanced margin_b_20" @click="advancedSearch = !advancedSearch"
					v-if="!advancedSearch">高级筛选</div>
				<div class="search_common margin_b_20" @click="advancedSearch = !advancedSearch" v-if="advancedSearch">
					常用筛选</div>
			</div>
		</div>
		<div class="container use-table">
			<el-table ref="etbl" :height="tblHeight" :data="tableDatas" highlight-current-row>
				<el-table-column label="订单号" align="center" width="200">
					<template scope="scope">
						<div class="theme_color crpr" @click="toOrderDetail(scope.row.order_id)">
							{{ scope.row.order_id }}
						</div>
					</template>
				</el-table-column>
				<el-table-column label="下单人" align="center" width="180">
					<template slot-scope="scope">
						<div class="dflex_vertical_c">
							<el-image class="headimg_small"
								:src="scope.row.order_member_headimg || '/static/img/default.jpg'"
								:preview-src-list="scope.row.imgs" fit="cover"></el-image>
							<div class="margin_l_5">{{ scope.row.order_member_name || '用云会员' }}</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column property="order_member_mobile" label="下单人手机号" align="center" width="180">
				</el-table-column>
				<el-table-column property="create_time" label="下单时间" align="center" width="180"></el-table-column>
				<el-table-column property="order_total_money" label="订单总额" align="center" prop="order_total_money">
				</el-table-column>
				<el-table-column property="state" label="订单状态" align="center"></el-table-column>
				<el-table-column property="order_pay_way" label="支付方式" align="center" width="80"></el-table-column>
				<el-table-column property="order_consignee" label="收货人" align="center"></el-table-column>
				<el-table-column property="order_consignee_tel" label="收货人手机号" align="center"></el-table-column>
				<el-table-column property="order_from" label="订单来源" align="center"></el-table-column>
				<el-table-column label="操作" align="center" fixed="right" width="120">
					<template slot-scope="scope">
						<el-tooltip content="修改订单价格" placement="top" :hide-after="1000" :enterable="false"
							effect="light" v-if="scope.row.state == '待付款'">
							<el-button icon="iconfont iconxiugaijiage" circle @click="stateChange(scope.row, '待付款')">
							</el-button>
						</el-tooltip>
						<el-tooltip content="会员已支付" placement="top" :hide-after="1000" :enterable="false" effect="light"
							v-if="scope.row.state == '待发货'">
							<el-button icon="iconfont iconwlcx" circle @click="stateChange(scope.row, '待收货')">
							</el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination :current-page="req.page" :page-sizes="[10, 20, 30, 50, 100]" :page-size="req.rows"
				layout="total, sizes, prev, pager, next, jumper" :total="tableTotal" @size-change="sizeChange"
				@current-change="currentChange"></el-pagination>
		</div>
		<el-drawer title="发货" :visible.sync="expressDrawer" direction="rtl" :append-to-body="true"
			:wrapperClosable="false">
			<el-form class="add_edit" :model="expressForm" :rules="expressRules" ref="ruleForm" label-width="100px">
				<el-form-item label="快递公司">
					<el-select v-model="expressForm.order_express" placeholder="请选择" class="sele">
						<el-option v-for="(item, idx) in expressOptions" :key="idx" :label="item.label"
							:value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="快递单号" prop="order_express_no" ref="order_express_no">
					<el-input v-model="expressForm.order_express_no" placeholder="请输入快递单号" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-button round icon="el-icon-check" class="confirm_btn" @click="submitExpressForm('ruleForm')">提交
					</el-button>
					<el-button round icon="el-icon-back" @click="expressDrawer = false">返回</el-button>
				</el-form-item>
			</el-form>
		</el-drawer>
		<el-drawer title="改价" :visible.sync="priceDrawer" direction="rtl" :append-to-body="true"
			:wrapperClosable="false">
			<el-form class="add_edit" :model="priceForm" :rules="priceRules" ref="ruleForm" label-width="100px">
				<el-form-item label="价格" prop="order_actural_paid" ref="order_actural_paid">
					<el-input v-model.number="priceForm.order_actural_paid" placeholder="请输入价格" type="number" min="0"
						clearable></el-input>
					<div class="remark_txt">单位分 实际金额 {{ priceForm.order_actural_paid / 100 }} 元</div>
				</el-form-item>
				<el-form-item label="改价原因">
					<el-input type="textarea" placeholder="请输入改价原因" :autosize="{ minRows: 3 }"
						v-model="priceForm.remark"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button round icon="el-icon-check" class="confirm_btn" @click="submitPriceForm('ruleForm')">提交
					</el-button>
					<el-button round icon="el-icon-back" @click="priceDrawer = false">返回</el-button>
				</el-form-item>
			</el-form>
		</el-drawer>
	</div>
</template>

<script>
	import vCountup from 'vue-countupjs';
	const __name = 'usemall-order';
	export default {
		components: {
			vCountup
		},
		data() {
			return {
				state: '全部',
				searchTime: [],
				advancedSearch: false,
				stateObj: {
					待付款: 0,
					待发货: 0,
					待评价: 0,
					已完成: 0,
					已取消: 0,
					售后中: 0,
					售后结束: 0,
					全部: 0
				},
				stateDatas: [],
				pickerOptions: {
					disabledDate(time) {
						return time.getTime() > Date.now();
					},
					shortcuts: [{
							text: '最近一周',
							onClick(picker) {
								const end = new Date();
								const start = new Date();
								start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
								picker.$emit('pick', [start, end]);
							}
						},
						{
							text: '最近一个月',
							onClick(picker) {
								const end = new Date();
								const start = new Date();
								start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
								picker.$emit('pick', [start, end]);
							}
						},
						{
							text: '最近三个月',
							onClick(picker) {
								const end = new Date();
								const start = new Date();
								start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
								picker.$emit('pick', [start, end]);
							}
						}
					]
				},
				req: {
					page: 1,
					rows: 10,
					orderby: 'sort asc',
					order_id: '',
					begin_time: '',
					end_time: '',
					state: ''
				},
				tblHeight: 0,
				tableDatas: [],
				tableTotal: 0,
				priceDrawer: false,
				priceDataId: '',
				expressDrawer: false,
				expressDataId: '',
				expressOptions: [{
						value: '顺丰速运',
						label: '顺丰速运'
					},
					{
						value: '中通快递',
						label: '中通快递'
					},
					{
						value: '圆通快递',
						label: '圆通快递'
					},
					{
						value: '韵达快递',
						label: '韵达快递'
					},
					{
						value: '申通快递',
						label: '申通快递'
					},
					{
						value: '百世快递',
						label: '百世快递'
					}
				],
				priceForm: {
					order_actural_paid: 0,
					remark: ''
				},
				expressForm: {
					order_express: '顺丰速运',
					order_express_no: '',
					state: ''
				},
				orderData: {},
				user: {},
				priceRules: {
					order_actural_paid: [{
						required: true,
						message: '请输入价格',
						trigger: 'change'
					}]
				},
				expressRules: {
					order_express_no: [{
						required: true,
						message: '请输入快递单号',
						trigger: 'change'
					}]
				},
			};
		},
		onShow() {
			this.$refs.etbl && this.$refs.etbl.doLayout();
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

				this.req.begin_time = '';
				this.req.end_time = '';

				if (this.searchTime && this.searchTime.length > 0) {
					this.req.begin_time = this.searchTime[0].getTime();
					this.req.end_time = this.searchTime[1].getTime() + (60 * 60 * 24 - 1) * 1000;
				}

				await this.$db[__name]
					.where({
						is_delete: 0
					})
					.whereif(this.req.state && this.req.state != '全部', {
						state: this.req.state
					})
					.whereif(this.req.order_id, {
						order_id: new RegExp(this.req.order_id)
					})
					.whereif(this.searchTime && this.searchTime.length > 0, {
						create_time: this.$db.$cmd.gte(this.req.begin_time).and(this.$db.$cmd.lte(this.req
							.end_time))
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
								row.imgs = [row.order_member_headimg ||
									'/static/img/default.jpg'
								];
								row.create_time = new Date(row.create_time).format();
							});

							this.tableDatas = res.datas.rows;
							this.tableTotal = res.datas.total;
						}
					});
			},
			toOrderDetail(order_id) {
				uni.navigateTo({
					url: `/pages/order/order/detail?order_id=${order_id}&flag=order_list&tab=订单详情`,
					events: {
						refreshData: () => {
							this.loadData();
						}
					}
				});
			},
			stateChange(row, sta) {
				this.orderData = row;
				if (sta == '待付款') {
					this.priceForm.order_actural_paid = row.order_actural_paid * 100;
					this.priceForm.remark = '';
					this.priceDrawer = true;
					this.priceDataId = row._id;
					return;
				}

				if (sta == '待收货') {
					this.expressForm.order_express = '顺丰速运';
					this.expressForm.order_express_no = '';
					this.expressForm.state = sta;
					this.expressDrawer = true;
					this.expressDataId = row._id;
					return;
				}
			},
			submitForm(formName) {
				this.$refs[formName].validate((valid, obj) => {
					this.$api.set_unvalidated_form_focus(this, obj);
					if (valid) {
						this.$db[__name].update(this.dataId, this.form).then(res => {
							if (res.code == 200) {
								this.$message({
									message: '发货成功',
									type: 'success'
								});
								this.expressageDrawer = false;
								this.loadData();
							}
						});
					}
				});
			},
			submitPriceForm(formName) {
				this.$refs[formName].validate((valid, obj) => {
					this.$api.set_unvalidated_form_focus(this, obj);
					if (valid) {
						this.$db[__name].update(this.priceDataId, this.priceForm).then(res => {
							if (res.code == 200) {
								this.$message({
									message: '改价成功',
									type: 'success'
								});
								this.priceDrawer = false;
								this.$db[__log]
									.add({
										order_id: this.orderData.order_id,
										log_type: '改价',
										current_state: '待付款',
										prev_state: '待付款',
										ip: this.user.last_login_ip,
										remark: '上次价格: ' + this.orderData.order_actural_paid / 100 +
											'元' + ' 当前价格: ' + this.priceForm.order_actural_paid / 100 +
											'元',
										create_time: new Date().getTime(),
										create_uid: this.user._id,
										create_uname: this.user.username
									})
									.then(res => {
										this.loadData();
									});
							}
						});
					}
				});
			},
			submitExpressForm(formName) {
				this.$refs[formName].validate((valid, obj) => {
					this.$api.set_unvalidated_form_focus(this, obj);
					if (valid) {
						this.$db[__name].update(this.expressDataId, this.expressForm).then(res => {
							if (res.code == 200) {
								this.$message({
									message: '发货成功',
									type: 'success'
								});
								this.expressDrawer = false;
								this.$db[__log]
									.add({
										order_id: this.orderData.order_id,
										log_type: '发货',
										current_state: '待收货',
										prev_state: '待发货',
										ip: this.user.last_login_ip,
										remark: '快递公司: ' + this.expressForm.order_express + ' 快递单号: ' +
											this.expressForm.order_express_no,
										create_time: new Date().getTime(),
										create_uid: this.user._id,
										create_uname: this.user.username
									})
									.then(res => {
										this.loadData();
									});
							}
						});
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
			}
		},
		created() {
			this.loadData();
			window.addEventListener('resize', () => {
				this.$refs.etbl && this.$refs.etbl.doLayout();
			})
		},
		updated() {
			if (!this.tblHeight) {
				this.tblHeight = this.$refs.tbl.tblHeight;
			}
		}
	};
</script>

<style>
	.theme_color:hover {
		text-decoration: underline;
	}

	.add_edit .el-input,
	.add_edit .el-textarea {
		width: 90%;
	}
</style>
