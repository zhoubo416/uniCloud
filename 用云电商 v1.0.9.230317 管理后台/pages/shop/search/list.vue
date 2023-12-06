<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container padding_b_0">
			<div class="dflex_wrap">
				<div class="dflex_vertical_c margin_r_40 margin_b_20">
					<div class="search_name">关键字：</div>
					<el-input v-model="req.keyword" placeholder="请输入" @input="loadData" class="search_input"></el-input>
				</div>
				<el-button size="mini" class="search_btn margin_b_20 margin_r_40" @click="loadData">搜索</el-button>
			</div>
		</div>
		<div class="container use-table">
			<el-table :height="tblHeight" :data="tableDatas" highlight-current-row>
				<el-table-column property="_id" label="用户ID" align="center"></el-table-column>
				<el-table-column property="keyword" label="关键字" align="center"></el-table-column>
				<el-table-column property="search_cnt" label="搜索次数" align="center"></el-table-column>
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
const __name = 'usemall-search-history';
export default {
	data() {
		return {
			req: {
				page: 1,
				rows: 10,
				orderby: 'sort asc',
				keyword: ''
			},
			tblHeight: 0,
			tableDatas: [],
			tableTotal: 0
		};
	},
	methods: {
		async loadData() {
			await this.$db[__name]
				.whereif(this.req.keyword, { keyword: new RegExp(this.req.keyword) })
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
		this.loadData();
	},
	updated() {
		if (!this.tblHeight) {
			this.tblHeight = this.$refs.tbl.tblHeight;
		}
	}
};
</script>

<style  ></style>
