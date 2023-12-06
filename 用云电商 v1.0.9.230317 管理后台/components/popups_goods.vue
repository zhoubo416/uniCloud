<template>
	<el-dialog width="70%" class="goods_popups" title="选择商品" :visible.sync="goodsDialog" :append-to-body="true">
		<div class="dflex_sb">
			<div></div>
			<div class="dflex_vertical_c margin_b_20">
				<div class="search_name">商品名称：</div>
				<el-input v-model="req.name" placeholder="请输入" class="search_input" @input="search" clearable></el-input>
			</div>
		</div>
		<el-table ref="goods" height="60vh" :data="tableDatas" highlight-current-row @selection-change="selectionChange" @row-click="choice">
			<el-table-column type="selection"></el-table-column>
			<el-table-column label="商品" width="400" align="center">
				<template slot-scope="scope">
					<div class="dflex_vertical_c">
						<el-image class="e_table_side_img100 margin_r_10" :src="scope.row.img" fit="cover"></el-image>
						<div class="left_just">
							<div class="ellipsis">{{ scope.row.name }}</div>
							<div class="ellipsis">{{ scope.row.name_pw }}</div>
						</div>
					</div>
				</template>
			</el-table-column>
			<el-table-column label="价格" align="center">
				<template slot-scope="scope">
					<div class="price">{{ scope.row.price / 100 }}</div>
					<div class="m_price">{{ scope.row.market_price / 100 }}</div>
				</template>
			</el-table-column>
			<el-table-column property="state" label="状态" align="center"></el-table-column>
			<el-table-column label="数据统计" align="left" width="100">
				<template slot-scope="scope">
					<div class="left_just">
						<div>已售数:{{ scope.row.sale_cnt }}</div>
						<div>访问数:{{ scope.row.visit_cnt }}</div>
						<div>收藏数:{{ scope.row.collect_cnt }}</div>
						<div>分享数:{{ scope.row.share_cnt }}</div>
					</div>
				</template>
			</el-table-column>
			<el-table-column label="标签" align="center" width="220">
				<template slot-scope="scope">
					<el-tag effect="plain" type="info" class="margin_r_5 margin_t_5" v-for="(item, i) in scope.row.tags" :key="i">{{ item }}</el-tag>
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
		<div class="btn pos_a">
			<el-button class="confirm_btn" @click="confirm">确 定</el-button>
			<el-button @click="goodsDialog = false">取 消</el-button>
		</div>
	</el-dialog>
</template>

<script>
const __name = 'usemall-goods';
export default {
	data() {
		return {
			goodsDialog: false,
			where_obj: {},
			req: {
				page: 1,
				rows: 10,
				orderby: 'sort asc',
				name: ''
			},
			tableDatas: [],
			tableTotal: 0,
			selectDatas: []
		};
	},
	methods: {
		async loadData() {
			await this.$db[__name]
				.whereif(this.req.name, { name: new RegExp(this.req.name) })
				.where(this.where_obj)
				.totable(this.req)
				.then(res => {
					if (res.code == 200) {
						this.tableDatas = res.datas.rows;
						this.tableTotal = res.datas.total;
					}
				});
		},
		search() {
			this.req.page = 1;
			this.loadData();
		},
		show(data) {
			for (const key in data) {
				if (data.hasOwnProperty(key)) {
					this.where_obj[key] = data[key];
				}
			}
			this.goodsDialog = true;
			this.loadData();
		},
		choice(row) {
			this.$refs.goods.toggleRowSelection(row);
		},
		selectionChange(val) {
			this.selectDatas = val;
		},
		confirm() {
			if (this.selectDatas.length <= 0) {
				this.$message('请选择商品');
				return;
			}

			this.$emit('choiceGoods', this.selectDatas);
			this.goodsDialog = false;
		},
		sizeChange(size) {
			this.req.rows = size;
			this.loadData();
		},
		currentChange(current) {
			this.req.page = current;
			this.loadData();
		}
	}
};
</script>

<style>
.goods_popups .btn {
	bottom: 20px;
	right: 20px;
}
</style>
