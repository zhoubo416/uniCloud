<template>
	<div>
		<use-table ref="tbl"></use-table>
		<div class="container padding_b_0">
			<div class="dflex_wrap">
				<div class="dflex_vertical_c margin_r_40 margin_b_20">
					<div class="search_name">用户名称：</div>
					<el-input v-model="req.member_name" placeholder="请输入" @keyup.enter.native="loadData" class="search_input"></el-input>
				</div>
				<el-button size="mini" class="search_btn margin_b_20 margin_r_40" @click="loadData">搜索</el-button>
			</div>
		</div>
		<div class="container use-table">
			<el-table :height="tblHeight" :data="tableDatas" highlight-current-row>
				<el-table-column label="用户" align="center" width="200">
					<template slot-scope="scope">
						<div class="dflex_vertical_c">
							<el-image class="headimg_small" :src="scope.row.member_headimg" :preview-src-list="scope.row.imgs" fit="contain"></el-image>
							<div class="margin_l_5">{{ scope.row.member_name }}</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column property="review_content" label="评价内容" width="500" align="center"></el-table-column>
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
				<el-table-column property="create_time" label="评价时间" align="center"></el-table-column>
				<el-table-column label="状态" align="center" width="100">
					<template slot-scope="scope">
						<el-tooltip :content="scope.row.state == '显示' ? '隐藏' : '显示'" placement="top" :hide-after="1000" :enterable="false" effect="light">
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
				<el-table-column label="操作" align="center" fixed="right" width="100">
					<template slot-scope="scope">
						<div v-if="!scope.row.replay_content">
							<el-tooltip content="回复" placement="top" :hide-after="1000" :enterable="false" effect="light">
								<el-button type="text" icon="el-icon-chat-dot-round" class="bbb" @click="reply(scope.row._id)"></el-button>
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
		<el-drawer title="回复内容" :visible.sync="replyDrawer" direction="rtl" :append-to-body="true">
			<el-form class="add_edit" :model="form" :rules="rules" ref="ruleForm" label-width="100px">
				<el-form-item label="回复内容" prop="reply" ref="reply"><el-input type="textarea" :autosize="{ minRows: 3 }" v-model="form.reply"></el-input></el-form-item>
				<el-form-item>
					<el-button class="confirm_btn" @click="submitForm('ruleForm')">确 定</el-button>
					<el-button @click="replyDrawer = false">返回列表</el-button>
				</el-form-item>
			</el-form>
		</el-drawer>
	</div>
</template>

<script>
const __name = 'usemall-goods-comment';
export default {
	data() {
		return {
			req: {
				page: 1,
				rows: 10,
				orderby: 'sort asc',
				member_name: ''
			},
			colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
			replyDrawer: false,
			replyId: '',
			form: {
				reply: ''
			},
			rules: {
				reply: [
					{
						required: true,
						message: '请输入回复内容',
						trigger: 'change'
					}
				]
			},
			tblHeight: 0,
			tableDatas: [],
			tableTotal: 0
		};
	},
	methods: {
		async loadData() {
			await this.$db[__name]
				.whereif(this.req.member_name, { member_name: new RegExp(this.req.member_name) })
				.totable(this.req)
				.then(res => {
					if (res.code == 200) {
						res.datas.rows.forEach((row, idx) => {
							row.imgs = [row.member_headimg];
							row.create_time = new Date(row.create_time).format();
						});
						this.tableDatas = res.datas.rows;
						this.tableTotal = res.datas.total;
					}
				});
		},
		reply(id) {
			this.replyDrawer = true;
			this.replyId = id;
		},
		submitForm(formName) {
			this.$refs[formName].validate((valid, obj) => {
				this.$api.set_unvalidated_form_focus(this, obj);
				if (valid) {
					this.$db[__name].update(this.replyId, { replay_content: this.form.reply }).then(res => {
						if (res.code == 200) {
							this.replyDrawer = false;
							this.loadData();
						}
					});
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
.add_edit .el-textarea {
	width: 90%;
}
</style>
