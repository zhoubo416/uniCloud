<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container use-table">
			<el-table :data="tableDatas" highlight-current-row>
				<el-table-column property="address" label="收货地址" align="center"></el-table-column>
				<el-table-column property="addr_detail" label="详细收货地址" align="center"></el-table-column>
				<el-table-column property="mobile" label="收货人手机号" align="center"></el-table-column>
				<el-table-column property="consignee" label="收货人名称" align="center"></el-table-column>
				<el-table-column property="remark" label="备注" align="center"></el-table-column>
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
	</div>
</template>

<script>
const __name = 'usemall-member-address';
export default {
	data() {
		return {
			dataId: '',
			req: {
				page: 1,
				rows: 10,
				orderby: 'sort asc'
			},
			tblHeight: 0,
			tableDatas: [],
			tableTotal: 0
		};
	},
	methods: {
		async loadData() {
			await this.$db[__name].where({ create_uid: this.dataId }).totable(this.req).then(res => {
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

<style></style>
