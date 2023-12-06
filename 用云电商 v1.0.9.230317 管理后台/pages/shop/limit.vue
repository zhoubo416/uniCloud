<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container_status dflex_vertical_c">
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
				<div></div>
				<el-button class="add_btn pos_r padding0" icon="iconfont iconxinzeng" @click="toAdd">新增</el-button>
			</div>
			<el-table :height="tblHeight" :data="tableDatas" highlight-current-row>
				<el-table-column label="排序" width="200" align="center">
					<template slot-scope="scope">
						<el-input-number size="small" :min="1" v-model="scope.row.sort" @change="sortChange(scope.row)" @blur="sortChange(scope.row)"></el-input-number>
					</template>
				</el-table-column>
				<el-table-column label="商品" width="330" align="center">
					<template slot-scope="scope">
						<div class="dflex_vertical_c">
							<el-image style="width: 100px;height: 100px;" :src="scope.row.img" :preview-src-list="scope.row.imgs" fit="contain"></el-image>
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
				<el-table-column label="限时精选" align="center">
					<template slot-scope="scope">
						<el-tooltip :content="scope.row.limited == '1' ? '点击取消限时精选' : '点击启用限时精选'" placement="top" :hide-after="1000" :enterable="false" effect="light">
							<el-switch
								v-model="scope.row.limited"
								active-color="#ff6a6c"
								inactive-color="#bbb"
								active-value="1"
								inactive-value="0"
								@change="limitedChange(scope.row)"
							></el-switch>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column label="标签" width="220" align="center">
					<template slot-scope="scope">
						<div class="left_just">
							<el-tag effect="plain" class="margin_t_5 margin_r_5" type="info" v-for="(item, i) in scope.row.tags" :key="i">{{ item }}</el-tag>
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
			<popupsGoods ref="child" @choiceGoods="choiceGoods"></popupsGoods>
		</div>
	</div>
</template>

<script>
import vCountup from 'vue-countupjs';
import popupsGoods from '@/components/popups_goods';
const __name = 'usemall-goods';
export default {
	components: { vCountup, popupsGoods },
	data() {
		return {
			state: '全部',
			stateObj: {
				待审核: 0,
				销售中: 0,
				已下架: 0,
				全部: 0
			},
			stateDatas: [],
			req: {
				limited: 1,
				page: 1,
				rows: 10,
				orderby: 'sort asc',
				name: '',
				state: ''
			},
			tblHeight: 0,
			tableDatas: [],
			tableTotal: 0
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
				.where({ limited: 1 })
				.whereif(this.req.state && this.req.state != '全部', { state: this.req.state })
				.whereif(this.req.name, { name: new RegExp(this.req.name) })
				.withgroup({ field: 'state', obj: this.stateObj })
				.totable(this.req)
				.then(res => {
					if (res.code == 200) {
						if (res.datas.group && res.datas.group.datas) {
							this.stateDatas = res.datas.group.datas;
						}

						res.datas.rows.forEach(row => {
							row.imgs = [row.img];
							row.limited = row.limited + '';
						});

						this.tableDatas = res.datas.rows;
						this.tableTotal = res.datas.total;
					}
				});
		},
		toAdd() {
			this.$refs.child.show({
				limited: 0
			});
		},
		choiceGoods(datas) {
			let ids = datas.map(x => x._id);
			if (ids && ids.length > 0) {
				this.$db[__name]
					.where(`in(_id, ${JSON.stringify(ids)})`)
					.update('', { limited: 1 })
					.then(res => {
						if (res.code == 200) this.loadData();
					});
			}
		},
		limitedChange(row) {
			this.$db[__name].update(row._id, { limited: parseInt(row.limited) }).then(res => {
				if (res.code == 200) this.loadData();
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

<style></style>
