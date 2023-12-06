<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container use-table">
			<el-table :height="tblHeight" :data="tableDatas" highlight-current-row>
				<el-table-column label="商品" align="center">
					<template slot-scope="scope">
						<div class="dflex_vertical_c">
							<el-image style="width: 100px;height: 80px;" :src="scope.row.goods.img" :preview-src-list="scope.row.imgs" fit="contain"></el-image>
							<div class="left_just">
								<div class="ellipsis">{{ scope.row.goods.name }}</div>
								<div class="ellipsis">{{ scope.row.goods.name_pw }}</div>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="价格" align="center">
					<template slot-scope="scope">
						<div class="price">{{ scope.row.goods.price / 100}}</div>
						<div class="m_price">{{ scope.row.goods.market_price / 100}}</div>
					</template>
				</el-table-column>
				<el-table-column property="create_time" label="收藏时间" align="center"></el-table-column>
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
const __name = 'usemall-member-collect, usemall-goods';
export default {
	data() {
		return {
			dataId: '',
			req: {
				page: 1,
				rows: 10,
				orderby: 'create_time desc'
			},
			tblHeight: 0,
			tableDatas: [],
			tableTotal: 0
		};
	},
	methods: {
		async loadData() {
			this.$db[__name]
				.where({ create_uid: this.dataId })
				.field('create_time, last_modify_time, goods.name, goods.name_pw, goods.img, goods.price, goods.market_price')
				.totable(this.req)
				.then(res => {
						if (res.code == 200) {
							res.datas.rows.forEach(x => {
								x.goods = x.goods[0] || {};
								x.imgs = [x.goods.img];
								x.create_time = new Date(x.create_time).format();
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
		this.dataId = this.$route.query.id || '';
		this.tblHeight = 0;
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
