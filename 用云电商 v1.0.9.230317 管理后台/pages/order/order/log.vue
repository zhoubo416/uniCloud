<template>
	<div class="container">
		<el-table height="500" :data="tableDatas" highlight-current-row>
			<el-table-column property="order_id" label="订单ID" align="center"></el-table-column>
			<el-table-column property="log_type" label="操作类型" align="center"></el-table-column>
			<el-table-column property="current_state" label="当前状态" align="center"></el-table-column>
			<el-table-column property="prev_state" label="上个状态" align="center"></el-table-column>
			<el-table-column property="create_time" label="创建时间" align="center"></el-table-column>
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
</template>

<script>
const __name = 'usemall-order-log';
export default {
	data() {
		return {
			dataId: '',
			req: {
				page: 1,
				rows: 10,
				orderby: 'sort asc'
			},
			tableDatas: [],
			tableTotal: 0,
		};
	},
	methods: {
		async loadData() {
			await this.$db[__name]
				.where({ order_id: this.dataId })
				.totable(this.req)
				.then(res => {
					if (res.code == 200) {
						res.datas.rows.forEach((row, idx) => {
							row.create_time = new Date(row.create_time).format();
						});
						this.tableDatas = res.datas.rows;
						this.tableTotal = res.datas.total;
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
		this.dataId = this.$route.query.order_id || '';
		this.loadData();
	}
};
</script>

<style></style>
