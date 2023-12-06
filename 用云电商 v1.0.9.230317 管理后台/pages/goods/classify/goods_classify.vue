<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container padding_b_0">
			<div class="dflex_wrap">
				<div class="dflex_vertical_c margin_r_40 margin_b_20">
					<div class="search_name">分类名称：</div>
					<el-input v-model="req.name" placeholder="请输入" class="search_input" @input="loadData"></el-input>
				</div>
				<el-button size="mini" class="search_btn margin_b_20 margin_r_40" @click="loadData">搜索</el-button>
			</div>
		</div>
		<div class="container use-table">
			<div class="dflex_sb margin_b_15">
				<div></div>
				<el-button class="add_btn pos_r padding0" icon="iconfont iconxinzeng" @click="toAdd">新增</el-button>
			</div>
			<el-table :height="tblHeight" :data="tableDatas" row-key="_id" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
				<el-table-column prop="name" label="分类名称" width="120"></el-table-column>
				<el-table-column label="排序" width="200" align="center">
					<template slot-scope="scope">
						<el-input-number size="small" :min="1" v-model="scope.row.sort" @change="sortChange(scope.row)" @blur="sortChange(scope.row)"></el-input-number>
					</template>
				</el-table-column>
				<el-table-column prop="_id" label="分类ID" align="center" width="250"></el-table-column>
				<el-table-column label="图片" align="center">
					<template slot-scope="scope">
						<el-image style="width: 100px; height: 80px;" :preview-src-list="scope.row.imgs" :src="scope.row.img" fit="contain"></el-image>
					</template>
				</el-table-column>
				<el-table-column prop="create_time" label="创建时间" align="center"></el-table-column>
				<el-table-column label="状态" align="center">
					<template slot-scope="scope">
						<el-tooltip :content="scope.row.state == '禁用' ? '点击启用' : '点击禁用'" placement="top" :hide-after="1000" :enterable="false" effect="light">
							<el-switch
								v-model="scope.row.state"
								active-color="#ff6a6c"
								inactive-color="#bbb"
								active-value="启用"
								inactive-value="禁用"
								@change="stateChange(scope.row)"
							></el-switch>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center">
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
		</div>
	</div>
</template>

<script>
const __name = 'usemall-goods-category';
export default {
	data() {
		return {
			req: {
				page: 1,
				rows: 500,
				orderby: 'sort asc',
				name: ''
			},
			tblHeight: 0,
			tableDatas: [],
			allTableDatas: []
		};
	},
	methods: {
		async loadData() {
			this.req.startWith = "pid == ''";
			if (this.req.name) {
				this.req.startWith = "/"+ this.req.name +"/.test(name)";
			}
			
			await this.$db[__name]
				.totree(this.req)
				.then(res => {
					if (res.code == 200) {
						let datas = [];
						res.datas.forEach((row, idx) => {
							row.create_time = new Date(row.create_time).format();
							if (row.children && row.children.length > 0) {
								row.children.forEach(c => {
									c.create_time = new Date(c.create_time).format();
								});
							}
							row.imgs = [row.img];
						});
						res.datas.forEach((row, idx) => {
							if (row.pid && res.datas.find(x => x._id == row.pid)) {
								return;
							}
							datas.push(row);
						});
						this.tableDatas = datas;
					}
				});
		},
		toAdd() {
			uni.navigateTo({
				url: `/pages/goods/classify/goods_classify_add_edit?tab=添加分类`,
				events: {
					refreshData: () => {
						this.loadData();
					}
				}
			});
		},
		toEdit(id) {
			uni.navigateTo({
				url: `/pages/goods/classify/goods_classify_add_edit?id=${id}&tab=编辑分类`,
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
		stateChange(row) {
			this.$db[__name].update(row._id, { state: row.state }).then(res => {
				if (res.code == 200) this.loadData();
			});
		},
		sortChange(row) {
			if (row.sort == '') {
				return;
			}

			this.$db[__name].update(row._id, { sort: row.sort }).then(res => {
				if (res.code == 200) this.loadData();
			});
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
