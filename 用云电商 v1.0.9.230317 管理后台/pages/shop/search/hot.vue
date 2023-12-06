<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container padding_b_0">
			<div class="dflex_wrap">
				<div class="dflex_vertical_c margin_r_40 margin_b_20">
					<div class="search_name">关键字：</div>
					<el-input v-model="req.keyword" placeholder="请输入" @keyup.enter.native="loadData" @input="loadData" class="search_input"></el-input>
				</div>
				<el-button size="mini" class="search_btn margin_b_20 margin_r_40" @click="loadData">搜索</el-button>
			</div>
		</div>
		<div class="container use-table">
			<div class="dflex_sb margin_b_15">
				<div><el-button class="batch_btn padding0" @click="removes">删除</el-button></div>
				<el-button class="add_btn pos_r padding0" icon="iconfont iconxinzeng" @click="toAdd">新增</el-button>
			</div>
			<el-table :data="tableDatas" @selection-change="selectionChange" highlight-current-row>
				<el-table-column type="selection"></el-table-column>
				<el-table-column label="排序" width="200" align="center">
					<template slot-scope="scope">
						<el-input-number size="small" :min="1" v-model="scope.row.sort" @change="sortChange(scope.row)" @blur="sortChange(scope.row)"></el-input-number>
					</template>
				</el-table-column>
				<el-table-column property="_id" label="用户ID" align="center"></el-table-column>
				<el-table-column property="keyword" label="关键字" align="center"></el-table-column>
				<el-table-column property="search_cnt" label="搜索次数" align="center"></el-table-column>
				<el-table-column property="create_time" label="创建时间" align="center"></el-table-column>
				<el-table-column label="操作" align="center" fixed="right">
					<template slot-scope="scope">
						<el-tooltip content="编辑" placement="top" :hide-after="1000" :enterable="false" effect="light">
							<el-button type="text" icon="iconfont iconbianji" class="bbb" @click="toEdit(scope.row._id)"></el-button>
						</el-tooltip>
						<el-tooltip content="删除" placement="top" :hide-after="1000" :enterable="false" effect="light">
							<el-button type="text" icon="iconfont iconshanchu" class="bbb" @click="remove(scope.row._id)"></el-button>
						</el-tooltip>
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
	</div>
</template>

<script>
const __name = 'usemall-search-hot';
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
			tableTotal: 0,
			selectDatas: []
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
		toAdd() {
			uni.navigateTo({
				url: `/pages/shop/search/hot_add_edit?tab=添加热门`,
				events: {
					refreshData: () => {
						this.loadData();
					}
				}
			});
		},
		toEdit(id) {
			uni.navigateTo({
				url: `/pages/shop/search/hot_add_edit?id=${id}&tab=编辑热门`,
				events: {
					refreshData: () => {
						this.loadData();
					}
				}
			});
		},
		remove(id) {
			this.$confirm('此操作将永久删除该数据！', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.$db[__name].remove(id).then(res => {
					if (res.code == 200) {
						this.loadData();
					}
				});
			});
		},
		selectionChange(datas) {
			this.selectDatas = datas;
		},
		removes() {
			if (this.selectDatas.length <= 0) {
				this.$message('请勾选需要删除的数据');
				return;
			}
		
			let ids = this.selectDatas.map(x => x._id);
		
			this.$confirm('此操作将永久删除勾选数据！', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.$db[__name]
					.where({
						_id: this.$db.$cmd.in(ids)
					})
					.remove()
					.then(res => {
						if (res.code == 200) {
							this.loadData();
						}
					});
			});
		},
		sortChange(row) {
			if (row.sort == '') {
				return;
			}
		
			this.$db[__name].update(row._id, { sort: row.sort }).then(res => {
				if (res.code == 200) this.loadData();
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
	}
};
</script>

<style  ></style>
