<template>
	<div class="container">
		<el-table height="500" :data="tableData" highlight-current-row>
			<el-table-column property="order_consignee_addr" label="收货地址" align="center"></el-table-column>
			<el-table-column property="order_consignee_addr_detail" label="详细收货地址" align="center"></el-table-column>
			<el-table-column property="order_consignee_tel" label="收货人手机号" align="center"></el-table-column>
			<el-table-column property="order_consignee" label="收货人名称" align="center"></el-table-column>
		</el-table>
	</div>
</template>

<script>
export default {
	data() {
		return {
			tableData: []
		};
	},
	props: {
		data: Object
	},
	watch: {
		data(newVal) {
			this.tableData.push(newVal);
		}
	}
};
</script>

<style></style>
