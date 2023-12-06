<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container container_status dflex_vertical_c">
			<div class="item_interval" v-for="(item, i) in stateDatas" :key="i">
				<el-button class="badge_txt" :class="{ active: item.name == state }" size="small" @click="cutSta(item)">{{ item.name }}</el-button>
				<v-countup class="badge" start-value="0" :end-value="item.cnt"></v-countup>
			</div>
		</div>
		<div class="container padding_b_0">
			<div class="dflex_wrap">
				<div class="dflex_vertical_c margin_r_40 margin_b_20">
					<div class="search_name">商品名称：</div>
					<el-input v-model="req.name" placeholder="请输入" @input="loadData" class="search_input"></el-input>
				</div>
				<el-button size="mini" class="search_btn margin_b_20 margin_r_40" @click="loadData">搜索</el-button>
			</div>
		</div>
		<div class="container use-table">
			<div class="dflex_sb margin_b_15">
				<div><el-button class="batch_btn padding0" @click="removes">删除</el-button></div>
				<el-button class="add_btn pos_r padding0" icon="iconfont iconxinzeng" @click="toAdd">新增</el-button>
			</div>
			<el-table :height="tblHeight" :data="tableDatas" @selection-change="selectionChange" highlight-current-row>
				<el-table-column type="selection"></el-table-column>
				<el-table-column label="排序" width="200" align="center">
					<template slot-scope="scope">
						<el-input-number size="small" :min="1" v-model="scope.row.sort" @change="sortChange(scope.row)" @blur="sortChange(scope.row)"></el-input-number>
					</template>
				</el-table-column>
				<el-table-column label="商品" width="330" align="center">
					<template slot-scope="scope">
						<div class="dflex_vertical_c">
							<el-image style="width: 100px;height: 80px;" :src="scope.row.img" :preview-src-list="scope.row.imgs" fit="contain"></el-image>
							<div class="left_just margin_l_10">
								<div class="ellipsis">{{ scope.row.name }}</div>
								<div class="ellipsis">{{ scope.row.name_pw }}</div>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="价格" align="center">
					<template slot-scope="scope">
						<div class="price">{{ scope.row.price / 100}}</div>
						<div class="m_price">{{ scope.row.market_price / 100}}</div>
					</template>
				</el-table-column>
				<el-table-column label="限时精选" align="center">
					<template slot-scope="scope">
						<el-tooltip :content="scope.row.limited == '1' ? '取消限时精选' : '启用限时精选'" placement="top" :hide-after="1000" :enterable="false" effect="light">
							<el-switch
								v-model="scope.row.limited"
								active-color="#ff6a6c"
								inactive-color="#bbb"
								active-value="1"
								inactive-value="0"
								@change="limitedChang(scope.row)"
							></el-switch>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column label="热门推荐" align="center">
					<template slot-scope="scope">
						<el-tooltip :content="scope.row.hot == '1' ? '取消热门推荐' : '启用热门推荐'" placement="top" :hide-after="1000" :enterable="false" effect="light">
							<el-switch
								v-model="scope.row.hot"
								active-color="#ff6a6c"
								inactive-color="#bbb"
								active-value="1"
								inactive-value="0"
								@change="hotChang(scope.row)"
							></el-switch>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column property="state" label="状态" align="center"></el-table-column>
				<el-table-column label="数据统计" align="left" width="150">
					<template slot-scope="scope">
						<div class="left_just">
							<div>已售数:{{ scope.row.sale_cnt }}</div>
							<div>访问数:{{ scope.row.visit_cnt }}</div>
							<div>收藏数:{{ scope.row.collect_cnt }}</div>
							<div>分享数:{{ scope.row.share_cnt }}</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" fixed="right" width="120">
					<template slot-scope="scope">
						<div>
							<el-tooltip content="上架" placement="top" :hide-after="1000" :enterable="false" effect="light" v-if="scope.row.state == '待审核'">
								<el-button icon="iconfont iconshangjia" circle @click="staUp(scope.row._id)"></el-button>
							</el-tooltip>
							<el-tooltip content="下架" placement="top" :hide-after="1000" :enterable="false" effect="light" v-if="scope.row.state == '销售中'">
								<el-button icon="iconfont iconxiajia1" circle @click="staOut(scope.row._id)"></el-button>
							</el-tooltip>
							<el-tooltip content="编辑" placement="top" :hide-after="1000" :enterable="false" effect="light">
								<el-button icon="iconfont iconbianji" circle @click="toEdit(scope.row._id)"></el-button>
							</el-tooltip>
						</div>
						<div class="margin_t_10">
							<el-tooltip content="删除" placement="top" :hide-after="1000" :enterable="false" effect="light" v-if="scope.row.state == '已下架' || scope.row.state == '待审核'">
								<el-button icon="iconfont iconshanchu" circle @click="remove(scope.row._id)"></el-button>
							</el-tooltip>
							<el-tooltip content="评价" placement="top" :hide-after="1000" :enterable="false" effect="light" v-if="scope.row.state == '销售中'">
								<el-button icon="iconfont iconpingjia1" circle @click="toEvaluate(scope.row._id)"></el-button>
							</el-tooltip>
							<el-tooltip content="二维码" placement="top" :hide-after="1000" :enterable="false" effect="light" v-if="scope.row.state == '销售中'"><el-button icon="iconfont iconerweima" circle @click="qrCode"></el-button></el-tooltip>
							<el-tooltip content="预览" placement="top" :hide-after="1000" :enterable="false" effect="light" v-if="scope.row.state == '待审核'">
								<el-button icon="el-icon-view" circle @click="preview(scope.row._id)"></el-button>
							</el-tooltip>
						</div>
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
	</div>
</template>

<script>
import vCountup from 'vue-countupjs';
const __name = 'usemall-goods';
const __goodsCategory = 'usemall-goods-category';
export default {
	components: { vCountup },
	data() {
		return {
			state: '全部',
			classOptions: [],
			stateObj: {
				待审核: 0,
				销售中: 0,
				已下架: 0,
				全部: 0
			},
			stateDatas: [],
			req: {
				page: 1,
				rows: 10,
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
			this.stateDatas = [];
			for (let key in this.stateObj) {
				this.stateDatas.push({
					name: key,
					cnt: this.stateObj[key]
				});
			}

			await this.$db[__name]
				.whereif(this.req.state && this.req.state != '全部', { state: this.req.state })
				.whereif(this.req.name, { name: new RegExp(this.req.name) })
				.withgroup({ field: 'state', obj: this.stateObj })
				.totable(this.req)
				.then(res => {
					if (res.code == 200) {
						if (res.datas.group && res.datas.group.datas) {
							this.stateDatas = res.datas.group.datas;
						}

						res.datas.rows.forEach((row, idx) => {
							row.imgs = [row.img];
							row.limited = row.limited + '';
							row.hot = row.hot + '';
						});
						this.tableDatas = res.datas.rows;
						this.tableTotal = res.datas.total;
					}
				});
		},
		cutSta(item) {
			this.state = item.name;
			this.req.state = item.name;

			this.loadData();
		},
		toAdd() {
			uni.navigateTo({
				url: `/pages/goods/list/goods_list_add_edit?tab=添加商品`,
				events: {
					refreshData: () => {
						this.loadData();
					}
				}
			});
		},
		staUp(id) {
			this.$confirm('此操作将上架此商品!', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.$db[__name].update(id, { state: '销售中' }).then(res => {
					if (res.code == 200) this.loadData();
				});
			});
		},
		staOut(id) {
			this.$confirm('此操作将下架此商品!', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.$db[__name].update(id, { state: '已下架' }).then(res => {
					if (res.code == 200) this.loadData();
				});
			});
		},
		toEdit(id) {
			uni.navigateTo({
				url: `/pages/goods/list/goods_list_add_edit?id=${id}&tab=编辑商品`,
				events: {
					refreshData: () => {
						this.loadData();
					}
				}
			});
		},
		toEvaluate(id) {
			uni.navigateTo({
				url: `/pages/goods/list/evaluate_add?id=${id}&tab=添加评价`
			});
		},
		qrCode() {
			this.$message('正在开发中...');
		},
		preview() {
			this.$notify.info({
				title: '消息',
				message: '正在开发中...'
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
		sortChange(row) {
			if (row.sort == '') {
				return;
			}

			this.$db[__name].update(row._id, { sort: row.sort }).then(res => {
				if (res.code == 200) this.loadData();
			});
		},
		limitedChang(row) {
			this.$db[__name].update(row._id, { limited: parseInt(row.limited) }).then(res => {
				if (res.code == 200) this.loadData();
			});
		},
		hotChang(row) {
			this.$db[__name].update(row._id, { hot: parseInt(row.hot) }).then(res => {
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
		this.$db[__goodsCategory].totree({ orderby: 'sort asc', startWith: 'pid == ""', loadding: false }).then(res => {
			if (res.code == 200) {
				this.classOptions = res.datas;
			}
		});

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
