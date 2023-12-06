<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container padding_b_0">
			<div class="dflex_wrap">
				<div class="dflex_vertical_c margin_r_40 margin_b_20">
					<div class="search_name">会员名称：</div>
					<el-input v-model="req.name" placeholder="请输入" @input="loadData" class="search_input"></el-input>
				</div>
				<div class="dflex_vertical_c margin_r_40 margin_b_20" v-if="advancedSearch">
					<div class="search_name">订单编号：</div>
					<el-input v-model="req.order_id" placeholder="请输入" @input="loadData" class="search_input"></el-input>
				</div>
				<el-button size="mini" class="search_btn margin_b_20 margin_r_40" @click="loadData">搜索</el-button>
				<div class="search_advanced margin_b_20" @click="advancedSearch = !advancedSearch" v-if="!advancedSearch">高级筛选</div>
				<div class="search_common margin_b_20" @click="advancedSearch = !advancedSearch" v-if="advancedSearch">常用筛选</div>
			</div>
		</div>
		<div class="container use-table">
			<el-table :height="tblHeight" :data="tableDatas" highlight-current-row>
				<el-table-column label="订单编号" align="center">
					<template scope="scope">
						<div class="theme_color crpr" @click="toOrderDetail(scope.row.order_id)">{{ scope.row.order_id }}</div>
					</template>
				</el-table-column>
				<el-table-column label="会员" align="center">
					<template slot-scope="scope">
						<div class="dflex_vertical_c">
							<el-image
								class="headimg_small"
								:src="scope.row.member_headimg || '/static/img/default.jpg'"
								:preview-src-list="scope.row.imgs"
								fit="contain"
							></el-image>
							<div class="margin_l_5">{{ scope.row.member_name }}</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column property="reason" label="退款原因" align="center"></el-table-column>
				<el-table-column property="desc" label="退款说明" align="center"></el-table-column>
				<el-table-column property="remark" label="备注" align="center"></el-table-column>
				<el-table-column property="state" label="状态" align="center"></el-table-column>
				<el-table-column label="操作" align="center" fixed="right">
					<template slot-scope="scope">
						<div v-if="scope.row.state == '处理中'">
							<el-tooltip content="同意退款" placement="top" :hide-after="1000" :enterable="false" effect="light">
								<el-button type="text" icon="el-icon-check" class="bbb" @click="refunded(scope.row._id, scope.row.order_id)"></el-button>
							</el-tooltip>
							<el-tooltip content="拒绝退款" placement="top" :hide-after="1000" :enterable="false" effect="light">
								<el-button type="text" icon="el-icon-close" class="bbb" @click="refuseRefund(scope.row._id, scope.row.order_id)"></el-button>
							</el-tooltip>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				:current-page="req.page"
				:page-sizes="[10, 20, 30, 50, 100]"
				:page-size="req.rows"
				layout="total, sizes, prev, pager, next, jumper"
				:total="tableTotal"
				@size-change="sizeChange"
				@current-change="currentChange"
			></el-pagination>
		</div>
		<el-drawer title="拒绝原因" :visible.sync="refundDrawer" :wrapperClosable="false" direction="rtl" :append-to-body="true">
			<el-form class="add_edit" :model="form" :rules="rules" ref="ruleForm" label-width="100px">
				<el-form-item label="拒绝原因" prop="refund" ref="refund"><el-input type="textarea" :autosize="{ minRows: 3 }" v-model="form.refund"></el-input></el-form-item>
				<el-form-item>
					<el-button class="confirm_btn" @click="submitForm('ruleForm')">确 定</el-button>
					<el-button @click="refundDrawer = false">返回列表</el-button>
				</el-form-item>
			</el-form>
		</el-drawer>
	</div>
</template>

<script>
const __name = 'usemall-order-refund';
export default {
	data() {
		return {
			advancedSearch: false,
			req: {
				page: 1,
				rows: 10,
				orderby: 'sort asc',
				name: '',
				order_id: ''
			},
			refundDrawer: false,
			refundId: '',
			orderId: '',
			form: {
				refund: ''
			},
			rules: {
				refund: [
					{
						required: true,
						message: '请输入拒绝原因',
						trigger: 'change'
					}
				]
			},
			tblHeight: 0,
			tableDatas: [],
			tableTotal: 0
		};
	},
	methods: {
		async loadData() {
			await this.$db[__name]
				.whereif(this.req.name, { name: new RegExp(this.req.name) })
				.whereif(this.req.order_id, { order_id: new RegExp(this.req.order_id) })
				.totable(this.req)
				.then(res => {
					if (res.code == 200) {
						res.datas.rows.forEach((row, idx) => {
							row.imgs = [row.member_headimg];
						});
						this.tableDatas = res.datas.rows;
						this.tableTotal = res.datas.total;
					}
				});
		},
		toOrderDetail(order_id) {
			uni.navigateTo({
				url: `/pages/order/order/detail?order_id=${order_id}&flag=refunds_dispose&tab=订单详情`,
				events: {
					refreshData: () => {
						this.loadData();
					}
				}
			});
		},
		refunded(id, orderId) {
			this.$confirm('此操作将同意退款！', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.$func.useadmin.call('order/refund', { id: id, order_id: orderId, remark: '退款成功', state: '已退款' }).then(res => {
					if (res.code == 200) {
						this.loadData();
					}
				});
			});
		},
		refuseRefund(id, orderId) {
			this.refundDrawer = true;
			this.refundId = id;
			this.orderId = orderId;
		},
		submitForm(formName) {
			this.$refs[formName].validate((valid, obj) => {
				// 默认获取第一个未验证 form 属性名
				this.$api.set_unvalidated_form_focus(this, obj);
				if (valid) {
					this.$func.useadmin.call('order/refuse', { id: this.refundId, order_id: this.orderId, remark: this.form.refund, state: '拒绝退款' }).then(res => {
						if (res.code == 200) {
							this.refuseDrawer = false;
							this.loadData();
						}
					});
				}
			});
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
.add_edit .el-textarea {
	width: 90%;
}
</style>
