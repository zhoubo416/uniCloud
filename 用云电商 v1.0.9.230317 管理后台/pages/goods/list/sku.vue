<template>
	<div class="container add_edit">
		<el-form label-width="150px">
			<div>
				<h3 class="margin_b_20">SKU</h3>
				<div>
					<el-form-item label="开启SKU">
						<el-switch @change="open_switch_sku" v-model="switch_sku" active-color="#ff6a6c"
							inactive-color="#dcdfe6"></el-switch>
					</el-form-item>
					<el-form-item label="编辑SKU" v-if="switch_sku">
						<div>
							<el-checkbox @change="open_spec" class="margin_r_10" v-model="checked_spec"></el-checkbox>
							<el-input v-model="spec_s" placeholder="规格"></el-input>
						</div>
						<div class="dflex margin_t_20">
							<el-tag type="info" class="tag-new-tag" :key="idx" v-for="(tag, idx) in dynamicTags_spec"
								:closable="checked_spec" :disable-transitions="false" @close="handleClose_spec(tag)">
								{{ tag }}
							</el-tag>
							<el-input class="input-new-tag" v-if="inputVisible_spec" v-model="inputValue_spec"
								ref="saveTagInput_spec" @keyup.enter.native="handleInputConfirm_spec"
								@blur="handleInputConfirm_spec"></el-input>
							<el-button :disabled="!checked_spec" v-else class="button-new-tag" size="small"
								@click="showInput_spec">添加</el-button>
						</div>
					</el-form-item>
					<el-form-item v-if="switch_sku">
						<el-table :data="tableSkuData" border>
							<el-table-column label="价格" align="center">
								<template slot-scope="scope">
									<el-input class="sort-container" type="number" v-model.number="scope.row.price">
									</el-input>
								</template>
							</el-table-column>
							<el-table-column label="库存" align="center">
								<template slot-scope="scope">
									<el-input class="sort-container" type="number" v-model.number="scope.row.stock_num">
									</el-input>
								</template>
							</el-table-column>
							<el-table-column v-if="checked_spec" prop="spec" :label="spec_s" align="center">
							</el-table-column>
						</el-table>
					</el-form-item>
				</div>
			</div>
		</el-form>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				switch_sku: true,
				skus: [],
				goods: {},
				dynamicTags_spec: [],
				inputVisible_spec: false,
				inputValue_spec: '',
				checked_spec: true,
				spec_s: '规格',
				tableData: [],
				tableSkuData: []
			};
		},
		watch: {
			checked_spec: function(arrs) {
				for (var i = 0; i < arrs.length; i++) {
					for (var j = i + 1; j < arrs.length; j++) {
						if (arrs[i] == arrs[j]) {
							//第一个等同于第二个，splice方法删除第二个
							arrs.splice(j, 1);
							j--;
						}
					}
				}
			}
		},
		methods: {
			submitData(callback) {
				this.skus = [];

				this.tableSkuData.forEach(x => {
					this.skus.push(x);
				});

				if (typeof callback === 'function') {
					callback(
						this.skus,
						JSON.stringify({
							spec_s: this.spec_s,
							spec: this.dynamicTags_spec
						})
					);
				}
			},
			getData(callback) {
				this.submitData(callback);
			},
			setData(res) {
				this.form = res.goods;

				let skus = JSON.parse(this.form.skus);
				this.spec_s = skus.spec_s;

				this.tableSkuData = res.goods_sku;

				this.dynamicTags_spec = skus.spec;

				this.checked_spec = this.dynamicTags_spec.length > 0;
			},
			setGoods(res) {
				this.goods = res;
			},
			affirm() {
				// 规格
				if (this.dynamicTags_spec.length > 0) {
					this.dynamicTags_spec.forEach((spec, spec_idx) => {
						if (!this.tableSkuData.find(x => x.spec == spec))
							this.tableSkuData.push({
								price: this.goods.price,
								stock_num: this.goods.stock_num,
								spec: spec,
								spec_s: spec_idx
							});
					});

					this.tableSkuData = this.tableSkuData.filter(x => this.dynamicTags_spec.find(s => s == x.spec));
				}
			},
			handleClose_spec(tag) {
				this.dynamicTags_spec.splice(this.dynamicTags_spec.indexOf(tag), 1);
				this.tableSkuData.splice(this.tableSkuData.findIndex(x => x.spec == tag), 1);
			},
			showInput_spec() {
				this.inputVisible_spec = true;
				this.$nextTick(() => {
					this.$refs.saveTagInput_spec.$refs.input.focus();
				});
			},
			handleInputConfirm_spec() {
				if (this.inputValue_spec) {
					if (this.dynamicTags_spec.find(x => x == this.inputValue_spec)) {
						this.$message({
							message: this.inputValue_spec + '已存在',
							type: 'warning'
						});
						return;
					}
					this.dynamicTags_spec.push(this.inputValue_spec);
					this.affirm();
				}
				this.inputVisible_spec = false;
				this.inputValue_spec = '';
			},
			open_spec() {
				if (this.checked_spec) return;
				this.$confirm(`此操作将清除【${this.spec_s}】数据, 是否继续?`, '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
					.then(() => {
						this.$message({
							type: 'success',
							message: '清除成功!'
						});
						this.dynamicTags_spec = [];
						this.tableSkuData = [];
					})
					.catch(() => {
						this.checked_spec = true;
					});
			},
			open_switch_sku() {
				if (this.switch_sku) return;
				this.$confirm(`此操作将清除数据, 是否继续?`, '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
					.then(() => {
						this.$message({
							type: 'success',
							message: '清除成功!'
						});
						this.dynamicTags_spec = [];
						this.tableData = [];
						this.tableSkuData = [];
					})
					.catch(() => {
						this.switch_sku = true;
					});
			}
		}
	};
</script>

<style>
	input[type='file'] {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		width: 100%;
		cursor: pointer;
		opacity: 0;
		z-index: 99;
	}
</style>

<style>
	.tag-new-tag {
		margin-left: 24px;
	}

	.button-new-tag,
	.input-new-tag {
		margin-left: 24px;
		height: 32px;
		margin-top: 0;
	}

	.input-new-tag {
		width: 100px;
		line-height: 32px;
	}

	>>>.input-new-tag .el-input__inner {
		height: 100%;
	}

	.el-button--small {
		border: 1px solid #dcdfe6;
	}
</style>
