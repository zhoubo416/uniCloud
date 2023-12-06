<template>
	<div class="container">
		<el-table height="500" :data="tableDatas" highlight-current-row>
			<el-table-column property="order_id" label="订单号" align="center"></el-table-column>
			<el-table-column label="商品" width="330" align="center">
				<template slot-scope="scope">
					<div class="dflex_vertical_c">
						<el-image style="width: 100px;height: 80px;" :src="scope.row.goods_img" :preview-src-list="scope.row.imgs" fit="contain"></el-image>
						<div class="left_just margin_l_10">
							<div class="ellipsis">{{ scope.row.goods_name }}</div>
							<div class="ellipsis">{{ scope.row.goods_name_pw }}</div>
						</div>
					</div>
				</template>
			</el-table-column>
			<el-table-column label="商品SKU" align="center">
				<template slot-scope="scope">
					<div class="dflex_c">{{ scope.row.goods_sku_name }}</div>
				</template>
			</el-table-column>
			<el-table-column label="价格" align="center">
				<template slot-scope="scope">
					<div class="price">{{ scope.row.goods_price / 100 }}</div>
					<div class="m_price">{{ scope.row.goods_market_price / 100 }}</div>
				</template>
			</el-table-column>
			<el-table-column property="create_time" label="下单时间" align="center"></el-table-column>
		</el-table>
	</div>
</template>

<script>
const __name = 'usemall-order-detail';
export default {
	data() {
		return {
			dataId: '',
			tableDatas: []
		};
	},
	methods: {
		async loadData() {
			await this.$db[__name]
				.where({ order_id: this.dataId })
				.tolist()
				.then(res => {
					if (res.code == 200) {
						res.datas.forEach((row, idx) => {
							row.imgs = [row.goods_img];
							row.create_time = new Date(row.create_time).format();
						});
						this.tableDatas = res.datas;
					}
				});
		}
	},
	created() {
		this.dataId = this.$route.query.order_id || '';
		this.loadData();
	}
};
</script>

<style></style>
