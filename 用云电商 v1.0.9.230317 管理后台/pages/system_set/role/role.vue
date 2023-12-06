<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container padding_b_0">
			<div class="dflex_wrap">
				<div class="dflex_vertical_c margin_r_40 margin_b_20">
					<div class="search_name">角色名称：</div>
					<el-input v-model="req.role_name" placeholder="请输入" class="search_input" @input="loadData"></el-input>
				</div>
				<el-button size="mini" class="search_btn margin_b_20 margin_r_40" @click="loadData">搜索</el-button>
			</div>
		</div>
		<div class="container use-table">
			<div class="dflex_sb margin_b_15">
				<div><el-button class="batch_btn padding0" @click="removes">删除</el-button></div>
				<el-button class="add_btn pos_r padding0" icon="iconfont iconxinzeng" @click="toAdd">新增</el-button>
			</div>
			<el-table :height="tblHeight" :data="tableDatas" @selection-change="selectionChange" highlight-current-row>
				<el-table-column type="selection"></el-table-column>
				<el-table-column property="_id" label="ID" width="250" align="center"></el-table-column>
				<el-table-column property="role_id" label="角色标识" width="100" align="center"></el-table-column>
				<el-table-column property="role_name" label="角色名称" align="center"></el-table-column>
				<el-table-column property="comment" label="备注" align="center"></el-table-column>
				<el-table-column property="create_date" label="创建时间" align="center"></el-table-column>
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
const __name = 'uni-id-roles';
export default {
	data() {
		return {
			defaultOptions: [
				{
					value: '',
					label: '全部'
				},
				{
					value: '是',
					label: '是'
				},
				{
					value: '否',
					label: '否'
				}
			],
			req: {
				page: 1,
				rows: 10,
				orderby: 'sort asc',
				role_name: ''
			},
			tblHeight: 0,
			tableDatas: [],
			tableTotal: 0,
			selectDatas: [],
			id: '',
			autDrawer: false
		};
	},
	methods: {
		async loadData() {
			await this.$db[__name]
				.whereif(this.req.role_name, { role_name: new RegExp(this.req.role_name) })
				.totable(this.req)
				.then(res => {
					if (res.code == 200) {
						res.datas.rows.forEach((row, idx) => {
							row.create_date = new Date(row.create_date).format();
						});
						this.tableDatas = res.datas.rows;
						this.tableTotal = res.datas.total;
					}
				});
		},
		toAdd() {
			uni.navigateTo({
				url: `/pages/system_set/role/role_add_edit?tab=添加角色`,
				events: {
					refreshData: () => {
						this.loadData();
					}
				}
			});
		},
		toEdit(id) {
			uni.navigateTo({
				url: `/pages/system_set/role/role_add_edit?id=${id}&tab=编辑角色`,
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

<style></style>
