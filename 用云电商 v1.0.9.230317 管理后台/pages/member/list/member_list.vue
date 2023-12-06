<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container padding_b_0">
			<div class="dflex_wrap">
				<div class="dflex_vertical_c margin_r_40 margin_b_20">
					<div class="search_name">会员名称：</div>
					<el-input v-model="req.member_name" placeholder="请输入" class="search_input" @input="search"
						clearable></el-input>
				</div>
				<div class="dflex_vertical_c margin_r_40 margin_b_20" v-if="advancedSearch">
					<div class="search_name">性别：</div>
					<el-select v-model="req.member_gender" class="search_input" @change="search">
						<el-option v-for="(item, idx) in genderOptions" :key="idx" :label="item.label"
							:value="item.value"></el-option>
					</el-select>
				</div>
				<div class="dflex_vertical_c margin_r_40 margin_b_20" v-if="advancedSearch">
					<div class="search_name">注册时间：</div>
					<el-date-picker v-model="searchTime" type="daterange" align="right" unlink-panels
						range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd"
						:picker-options="pickerOptions" class="search_start_end_time" @change="search"></el-date-picker>
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
				<el-table-column label="会员" align="center">
					<template slot-scope="scope">
						<div class="dflex_vertical_c">
							<el-image class="headimg_small"
								:src="scope.row.member_headimg || '/static/img/default.jpg'"
								:preview-src-list="scope.row.imgs" fit="cover"></el-image>
							<div class="margin_l_5">{{ scope.row.member_name || '用云会员' }}</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column property="is_plus" label="是否会员" align="center"></el-table-column>
				<el-table-column property="member_gender" label="性别" align="center"></el-table-column>
				<el-table-column property="member_login_cnt" label="登录次数" width="100" align="center"></el-table-column>
				<el-table-column property="member_mobile" label="手机号" align="center"></el-table-column>
				<el-table-column property="member_city" label="城市" align="center"></el-table-column>
				<el-table-column property="member_monetary" label="累计消费" align="center"></el-table-column>
				<el-table-column property="create_time" label="注册时间" align="center"></el-table-column>
				<el-table-column label="操作" align="center" fixed="right">
					<template slot-scope="scope">
						<el-tooltip content="详情" placement="top" :hide-after="1000" :enterable="false" effect="light">
							<el-button type="text" icon="iconfont iconxiangqing1" class="bbb"
								@click="toDetail(scope.row._id)"></el-button>
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
	const __name = 'usemall-member';
	export default {
		data() {
			return {
				advancedSearch: false,
				searchTime: [],
				genderOptions: [{
						value: '',
						label: '全部'
					},
					{
						value: '男',
						label: '男'
					},
					{
						value: '女',
						label: '女'
					}
				],
				req: {
					page: 1,
					rows: 10,
					orderby: 'sort asc',
					member_name: '',
					member_gender: '',
					begin_time: '',
					end_time: ''
				},
				tblHeight: 0,
				tableDatas: [],
				tableTotal: 0,
				pickerOptions: {
					disabledDate(time) {
						return time.getTime() > Date.now();
					},
					shortcuts: [{
							text: '最近一周',
							onClick(picker) {
								const end = new Date();
								const start = new Date();
								start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
								picker.$emit('pick', [start, end]);
							}
						},
						{
							text: '最近一个月',
							onClick(picker) {
								const end = new Date();
								const start = new Date();
								start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
								picker.$emit('pick', [start, end]);
							}
						},
						{
							text: '最近三个月',
							onClick(picker) {
								const end = new Date();
								const start = new Date();
								start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
								picker.$emit('pick', [start, end]);
							}
						}
					]
				}
			};
		},
		methods: {
			async loadData() {
				this.req.begin_time = '';
				this.req.end_time = '';

				if (this.searchTime && this.searchTime.length > 0) {
					this.req.begin_time = this.searchTime[0].getTime();
					this.req.end_time = this.searchTime[1].getTime();
				}

				await this.$db[__name]
					.whereif(this.req.member_name, {
						member_name: new RegExp(this.req.member_name)
					})
					.whereif(this.req.member_gender || this.req.member_gender === 0, {
						member_gender: this.req.member_gender
					})
					.whereif(this.searchTime && this.searchTime.length > 0, {
						create_time: this.$db.$cmd.gte(this.req.begin_time).and(this.$db.$cmd.lte(this.req
							.end_time))
					})
					.totable(this.req)
					.then(res => {
						if (res.code == 200) {
							res.datas.rows.forEach((row, idx) => {
								row.imgs = [row.member_headimg ||
									'/static/img/default.jpg'
								];
								row.create_time = new Date(row.create_time).format();
							});
							this.tableDatas = res.datas.rows;
							this.tableTotal = res.datas.total;
						}
					});
			},
			toDetail(id) {
				uni.navigateTo({
					url: `/pages/member/list/detail?id=${id}&tab=会员详情`,
					events: {
						refreshData: () => {
							this.loadData();
						}
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
