<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container padding_b_0">
			<div class="dflex_wrap">
				<div class="dflex_vertical_c margin_r_40 margin_b_20">
					<div class="search_name">用户名称：</div>
					<el-input v-model="req.username" placeholder="请输入" @input="loadData" class="search_input">
					</el-input>
				</div>
				<div class="dflex_vertical_c margin_r_40 margin_b_20" v-if="advancedSearch">
					<div class="search_name">性别：</div>
					<el-select v-model="req.gender" class="search_input" @change="loadData">
						<el-option v-for="(item, idx) in genderOptions" :key="idx" :label="item.label"
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
			<div class="dflex_sb margin_b_15">
				<div>
					<el-button class="batch_btn padding0" @click="removes">删除</el-button>
				</div>
				<el-button class="add_btn pos_r padding0" icon="iconfont iconxinzeng" @click="toAdd">新增</el-button>
			</div>
			<el-table :height="tblHeight" :data="tableDatas" @selection-change="selectionChange" highlight-current-row>
				<el-table-column type="selection"></el-table-column>
				<el-table-column label="用户" align="center">
					<template slot-scope="scope">
						<div class="dflex_vertical_c">
							<el-image style="width:40px;height: 40px;border-radius: 50%;"
								:src="scope.row.avatar || '/static/img/default.jpg'"
								:preview-src-list="scope.row.imgs" fit="cover"></el-image>
							<div class="margin_l_5">{{ scope.row.username }}</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column property="user_role_names" label="角色" align="center">
					<template slot-scope="scope">
						<el-tag type="info" class="margin_t_5 margin_r_5" size="medium"
							v-for="(item, i) in scope.row.role" :key="i">{{ item }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column property="mobile" label="手机号" align="center"></el-table-column>
				<el-table-column property="gender" label="性别" align="center"></el-table-column>
				<el-table-column property="register_ip" label="IP" align="center" width="200"></el-table-column>
				<el-table-column property="register_date" label="创建时间" align="center" width="200"></el-table-column>
				<el-table-column property="comment" label="备注" align="center"></el-table-column>
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
	const __name = 'uni-id-users';
	export default {
		data() {
			return {
				advancedSearch: false,
				genderOptions: [{
						value: '',
						label: '全部'
					},
					{
						value: '0',
						label: '未知'
					},
					{
						value: '1',
						label: '男'
					},
					{
						value: '2',
						label: '女'
					}
				],
				req: {
					page: 1,
					rows: 10,
					orderby: 'sort asc',
					username: '',
					gender: ''
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
					.where({
						role: this.$db.$cmd.neq('member')
					})
					.whereif(this.req.username, {
						username: new RegExp(this.req.username)
					})
					.whereif(this.req.gender, {
						gender: this.req.gender
					})
					.field('avatar, username, role, mobile, gender, register_ip, register_date, comment')
					.totable(this.req)
					.then(res => {
						if (res.code == 200) {
							res.datas.rows.forEach((row, idx) => {
								row.imgs = [row.avatar];
								row.register_date = new Date(row.register_date).format();
								switch (row.gender) {
									case '1':
										row.gender = '男';
										break;
									case '2':
										row.gender = '女';
										break;
									default:
										row.gender = '未知';
										break;
								}
							});
							this.tableDatas = res.datas.rows;
							this.tableTotal = res.datas.total;
						}
					});
			},
			toAdd() {
				uni.navigateTo({
					url: `/pages/system_set/account/account_add_edit?tab=添加账号`,
					events: {
						refreshData: () => {
							this.loadData();
						}
					}
				});
			},
			toEdit(id) {
				uni.navigateTo({
					url: `/pages/system_set/account/account_add_edit?id=${id}&tab=编辑账号`,
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
