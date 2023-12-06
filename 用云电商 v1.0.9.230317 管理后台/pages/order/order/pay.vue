<template>
	<div class="container">
		<el-table height="500" :data="tableDatas" highlight-current-row>
			<el-table-column property="pay_no" label="支付编号" align="center"></el-table-column>
			<el-table-column property="pay_way" label="支付方式" align="center"></el-table-column>
			<el-table-column property="pay_state" label="支付状态" align="center"></el-table-column>
			<el-table-column property="pay_trade_type" label="支付类型" align="center"></el-table-column>
			<el-table-column property="pay_time" label="支付时间" align="center"></el-table-column>
		</el-table>
	</div>
</template>

<script>
const __name = 'usemall-order-pay';
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
							row.pay_time = new Date(row.pay_time).format();
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
