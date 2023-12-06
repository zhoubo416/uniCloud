<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container member_coupon use-table">
			<div class="container_status dflex_vertical_c" v-if="tableDatas.dynamic">
				<div class="item_interval" v-for="(item, i) in badge" :key="i">
					<el-button class="badge_txt" :class="{ active: item.name == state }" size="small" @click="cutSta(item)">{{ item.name }}</el-button>
					<span class="badge" v-if="item.cnt > 0">{{ item.cnt }}</span>
				</div>
			</div>
			<el-table :height="tblHeight" :data="tableDatas" highlight-current-row>
				<el-table-column property="id" label="ID" align="center"></el-table-column>
				<el-table-column property="name" label="优惠券名称" align="center"></el-table-column>
				<el-table-column property="type" label="优惠券类型" align="center"></el-table-column>
				<el-table-column property="price" label="面值" align="center"></el-table-column>
				<el-table-column property="member_type" label="用户类型" align="center"></el-table-column>
				<el-table-column property="order_amount" label="订单金额" align="center"></el-table-column>
				<el-table-column property="per_max" label="会员可领数" align="center">
					<template slot-scope="scope">
						<div v-if="scope.row.per_max == 0">不限</div>
						<div v-else>{{ scope.row.per_max }}张</div>
					</template>
				</el-table-column>
				<el-table-column property="num" label="发行数量" align="center"></el-table-column>
				<el-table-column label="生效时间" align="center">
					<template slot-scope="scope">
						<div>{{ scope.row.start_time.substring(0, 10) }}</div>
					</template>
				</el-table-column>
				<el-table-column property="end_time" label="过期时间" align="center">
					<template slot-scope="scope">
						<div>{{ scope.row.end_time.substring(0, 10) }}</div>
					</template>
				</el-table-column>
				<el-table-column property="receive_type" label="领取方式" align="center"></el-table-column>
				<el-table-column property="state" label="状态" align="center"></el-table-column>
				<el-table-column property="remark" label="备注" align="center"></el-table-column>
			</el-table>
			<!-- 分页 -->
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
export default {
	data() {
		return {
			badge: [],
			state: '全部',
			req: {
				page: 1,
				rows: 10,
				orderby: 'sort asc',
				state: '',
				member_guid: '',
				member_id: ''
			},
			tblHeight: 0,
			tableDatas: [],
			tableTotal: 0
		};
	},
	methods: {
		loadData() {
			this.req.member_guid = this.$route.query.member_guid;
			this.req.member_id = this.$route.query.member_id;
			this.$axios
				.get('member/coupon', {
					params: this.req
				})
				.then(res => {
					if (res.code == 200) {
						this.tableDatas = res.datas;
						this.badge = [];
						for (const key in res.datas.dynamic) {
							this.badge.push({
								cnt: res.datas.dynamic[key],
								name: key
							});
						}
					}
				});
		},
		cutSta(item) {
			this.state = item.name;
			this.req.state = item.name;

			this.loadData();
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

<style>
.member_coupon .badge_txt {
	background-color: #fff;
}

.member_coupon .badge_txt:hover {
	background-color: #fff !important;
}
</style>

<style scoped></style>
