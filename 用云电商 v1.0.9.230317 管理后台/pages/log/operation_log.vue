<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container padding_b_0">
			<div class="dflex_wrap">
				<div class="dflex_vertical_c margin_r_40 margin_b_20">
					<div class="search_name">类型：</div>
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
			<el-table :height="tblHeight" :data="tableDatas" highlight-current-row>
				<el-table-column property="user_id" label="设备ID" align="center"></el-table-column>
				<el-table-column label="类型" align="center">
					<template slot-scope="scope">
						<div>{{ scope.row.type == 'login' ? '登录' : '退出' }}</div>
					</template>
				</el-table-column>
				<el-table-column label="状态" align="center">
					<template slot-scope="scope">
						<div>{{ scope.row.state == '1' ? '成功' : '失败' }}</div>
					</template>
				</el-table-column>
				<el-table-column property="create_date" label="操作时间" align="center"></el-table-column>
			</el-table>
			<el-pagination :current-page="req.page" :page-sizes="[10, 20, 30, 50, 100]" :page-size="req.rows"
				layout="total, sizes, prev, pager, next, jumper" :total="tableTotal" @size-change="sizeChange"
				@current-change="currentChange"></el-pagination>
		</div>
	</div>
</template>

<script>
	const __name = 'uni-id-log';
	export default {
		data() {
			return {
				advancedSearch: false,
				typeOptions: [{
						value: '',
						label: '全部'
					},
					{
						value: 'login',
						label: '登录'
					},
					{
						value: 'logout',
						label: '登出'
					}
				],
				stateOptions: [{
						value: '',
						label: '全部'
					},
					{
						value: '1',
						label: '成功'
					},
					{
						value: '0',
						label: '失败'
					}
				],
				req: {
					page: 1,
					rows: 20,
					orderby: 'sort asc',
					name: '',
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
					.whereif(this.req.type, {
						type: this.req.type
					})
					.whereif(this.req.state, {
						state: parseInt(this.req.state)
					})
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
