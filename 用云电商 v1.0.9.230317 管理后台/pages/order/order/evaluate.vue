<template>
	<div class="container">
		<el-table height="500" :data="tableDatas" highlight-current-row>
			<el-table-column property="order_id" label="订单编号" align="center"></el-table-column>
			<el-table-column property="review_content" label="评价内容" align="center"></el-table-column>
			<el-table-column label="评价图片" width="300" align="center">
				<template slot-scope="scope">
					<div class="dflex">
						<div class="margin_r_10" v-for="(item, i) in scope.row.review_imgs" :key="i">
							<el-image style="width: 100px; height: 80px;" :preview-src-list="scope.row.review_imgs" :src="item" fit="contain"></el-image>
						</div>
					</div>
				</template>
			</el-table-column>
			<el-table-column label="商品评分" align="center">
				<template slot-scope="scope">
					<el-rate v-model="scope.row.review_cnt" :colors="colors" disabled show-text :texts="['差评', '中评', '中评', '好评', '好评']"></el-rate>
				</template>
			</el-table-column>
			<el-table-column property="replay_content" label="商家回复" align="center"></el-table-column>
			<el-table-column property="create_time" label="评价时间" align="center"></el-table-column>
			<el-table-column property="state" label="状态" align="center"></el-table-column>
			<el-table-column label="操作" align="center" fixed="right">
				<template slot-scope="scope">
					<el-tooltip :content="scope.row.state == '显示' ? '隐藏' : '显示'" placement="top">
						<el-switch
							v-model="scope.row.state"
							active-color="#ff6a6c"
							inactive-color="#bbb"
							active-value="显示"
							inactive-value="隐藏"
							@change="stateChange(scope.row)"
						></el-switch>
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
</template>

<script>
const __name = 'usemall-goods-comment';
export default {
	data() {
		return {
			dataId: '',
			req: {
				page: 1,
				rows: 10,
				orderby: 'sort asc'
			},
			tableDatas: [],
			tableTotal: 0,
			colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
		};
	},
	methods: {
		async loadData() {
			await this.$db[__name]
				.where({ order_id: this.dataId })
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
		stateChange(row) {
			this.$db[__name].update(row._id, { state: row.state }).then(res => {
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
		this.dataId = this.$route.query.order_id || '';
		this.loadData();
	}
};
</script>

<style></style>
