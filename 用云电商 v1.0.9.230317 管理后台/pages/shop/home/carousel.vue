<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container padding_b_0">
			<div class="dflex_wrap">
				<div class="dflex_vertical_c margin_r_40 margin_b_20">
					<div class="search_name">跳转地址：</div>
					<el-input v-model="req.url" placeholder="请输入" @input="loadData" class="search_input"></el-input>
				</div>
				<div class="dflex_vertical_c margin_r_40 margin_b_20" v-if="advancedSearch">
					<div class="search_name">跳转类型：</div>
					<el-select v-model="req.type" class="search_input" @change="loadData">
						<el-option v-for="(item, idx) in typeOptions" :key="idx" :label="item.label"
							:value="item.value"></el-option>
					</el-select>
				</div>
				<div class="dflex_vertical_c margin_r_40 margin_b_20" v-if="advancedSearch">
					<div class="search_name">状态：</div>
					<el-select v-model="req.state" class="search_input" @change="loadData">
						<el-option v-for="(item, idx) in stateOptions" :key="idx" :label="item.label"
							:value="item.value"></el-option>
					</el-select>
				</div>
				<el-button size="mini" class="search_btn margin_b_20 margin_r_40" @click="loadData">搜索</el-button>
				<div class="search_advanced margin_b_20" @click="advancedSearch = !advancedSearch"
					v-if="!advancedSearch">高级筛选</div>
				<div class="search_common margin_b_20" @click="advancedSearch = !advancedSearch" v-if="advancedSearch">
					常用筛选</div>
			</div>
		</div>
		<div class="container use-table">
			<div class="dflex_sb margin_b_15 ">
				<div>
					<el-button class="batch_btn padding0" @click="removes">删除</el-button>
				</div>
				<el-button class="add_btn pos_r padding0" icon="iconfont iconxinzeng" @click="toAdd">新增</el-button>
			</div>
			<el-table :height="tblHeight" :data="tableDatas" @selection-change="selectionChange" highlight-current-row>
				<el-table-column type="selection"></el-table-column>
				<el-table-column label="排序" width="200" align="center">
					<template slot-scope="scope">
						<el-input-number size="small" :min="1" v-model="scope.row.sort" @change="sortChange(scope.row)"
							@blur="sortChange(scope.row)"></el-input-number>
					</template>
				</el-table-column>
				<el-table-column property="img" label="图片" align="center">
					<template slot-scope="scope">
						<el-image style="width: 120px;height: 40px;" :src="scope.row.img" :preview-src-list="scope.row.imgs"
							fit="contain"></el-image>
					</template>
				</el-table-column>
				<el-table-column property="type" label="跳转类型" align="center"></el-table-column>
				<el-table-column property="url" label="跳转地址" width="250" align="center"></el-table-column>
				<el-table-column property="state" label="状态" align="center">
					<template slot-scope="scope">
						<el-tooltip :content="scope.row.state == '启用' ? '点击禁用' : '点击启用'" placement="top"
							:hide-after="1000" :enterable="false" effect="light">
							<el-switch v-model="scope.row.state" active-color="#ff6a6c" inactive-color="#bbb"
								active-value="启用" inactive-value="禁用" @change="stateChange(scope.row)"></el-switch>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column property="remark" label="备注" align="center"></el-table-column>
				<el-table-column label="操作" align="center" fixed="right">
					<template slot-scope="scope">
						<el-tooltip content="编辑" placement="top" :hide-after="1000" :enterable="false" effect="light">
							<el-button type="text" icon="iconfont iconbianji" class="bbb"
								@click="toEdit(scope.row._id)"></el-button>
						</el-tooltip>
						<el-tooltip content="删除" placement="top" :hide-after="1000" :enterable="false" effect="light">
							<el-button type="text" icon="iconfont iconshanchu" class="bbb"
								@click="remove(scope.row._id)"></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination :current-page="req.page" :page-sizes="[10, 20, 30, 50, 100]" :page-size="req.rows"
				layout="total, sizes, prev, pager, next, jumper" :total="tableTotal" @size-change="sizeChange"
				@current-change="currentChange"></el-pagination>
		</div>
	</div>
</template>

<script>
	const __name = 'usemall-app-carousel';
	export default {
		data() {
			return {
				advancedSearch: false,
				typeOptions: [{
						value: '',
						label: '全部'
					},
					{
						value: '网页',
						label: '网页'
					},
					{
						value: '页面',
						label: '页面'
					}
				],
				stateOptions: [{
						value: '',
						label: '全部'
					},
					{
						value: '启用',
						label: '启用'
					},
					{
						value: '禁用',
						label: '禁用'
					}
				],
				req: {
					page: 1,
					rows: 10,
					orderby: 'sort asc',
					url: '',
					type: '',
					state: ''
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
					.whereif(this.req.url, {
						url: new RegExp(this.req.url)
					})
					.whereif(this.req.type, {
						type: this.req.type
					})
					.whereif(this.req.state, {
						state: this.req.state
					})
					.totable(this.req)
					.then(res => {
						if (res.code == 200) {
							res.datas.rows.forEach((row, idx) => {
								row.imgs = [row.img];
							});
							this.tableDatas = res.datas.rows;
							this.tableTotal = res.datas.total;
						}
					});
			},
			toAdd() {
				uni.navigateTo({
					url: `/pages/shop/home/carousel_add_edit?tab=添加轮播图`,
					events: {
						refreshData: () => {
							this.loadData();
						}
					}
				});
			},
			toEdit(id) {
				uni.navigateTo({
					url: `/pages/shop/home/carousel_add_edit?id=${id}&tab=编辑轮播图`,
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
					this.$message('请勾选需要删除的数据！');
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
			stateChange(row) {
				this.$db[__name].update(row._id, {
					state: row.state
				}).then(res => {
					if (res.code == 200) this.loadData();
				});
			},
			sortChange(row) {
				if (row.sort == '') {
					return;
				}

				this.$db[__name].update(row._id, {
					sort: row.sort
				}).then(res => {
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
		},
		updated() {
			if (!this.tblHeight) {
				this.tblHeight = this.$refs.tbl.tblHeight;
			}
		}
	};
</script>

<style></style>
