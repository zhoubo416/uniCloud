<template>
	<div class="container add_edit">
		<el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px">
			<el-form-item label="商品分类">
				<tree-select class="sele" ref="tree" :data="goodsOptions" :defaultProps="defaultProps"
					:checkedKeys="defaultCheckedKeys" nodeKey="_id" @popoverHide="popoverHide"></tree-select>
			</el-form-item>
			<el-form-item label="导航名称" prop="name" ref="name">
				<el-input v-model="form.name" placeholder="请输入名称"></el-input>
			</el-form-item>
			<el-form-item label="轮播图片">
				<uni-file-picker v-model="imageValue" fileMediatype="image" returnType="object"
					:image-styles="imageStyle" @success="imgUpload" @delete="imgDelete" />
			</el-form-item>
			<el-form-item label="跳转类型">
				<el-radio-group v-model="form.type">
					<el-radio label="页面">页面</el-radio>
					<el-radio label="网页">网页</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="地址">
				<el-select v-model="mpPageUrl" placeholder="请选择" :disabled="form.type == '网页'" class="sele"
					@change="urlChange">
					<el-option v-for="(item, idx) in urlOptions" :key="idx" :label="item.name + ' ' + item.url"
						:value="item._id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="跳转地址" prop="url" ref="url">
				<el-input v-model="form.url" placeholder="自动获取上面选中的值"></el-input>
				<div class="remark_txt">{{ remark }}</div>
			</el-form-item>
			<el-form-item label="排序">
				<el-input type="number" v-model.number="form.sort" min="0" placeholder="请输入排序"></el-input>
			</el-form-item>
			<el-form-item label="备注">
				<el-input v-model="form.remark" placeholder="请输入备注"></el-input>
			</el-form-item>
			<el-form-item label="状态">
				<el-switch v-model="form.state" active-color="#ff6a6c" inactive-color="#bbb" active-value="启用"
					inactive-value="禁用"></el-switch>
			</el-form-item>
			<el-form-item>
				<el-button class="confirm_btn" @click="submitForm('ruleForm')">确 定</el-button>
				<el-button @click="returnPage">返回列表</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
	import bus from '@/common/bus';
	import TreeSelect from '../../../components/tree_select';
	const __goodsCategory = 'usemall-goods-category';
	const __mpPage = 'usemall-app-wxmini-page';
	const __name = 'usemall-app-category';
	export default {
		components: {
			TreeSelect
		},
		data() {
			return {
				dataId: '',
				form: {
					cid: '',
					name: '',
					img: '',
					type: '页面',
					url: '',
					sort: 0,
					remark: '',
					state: '启用'
				},
				imageValue: null,
				imageStyle: {
					height: '150px',
					width: '150px'
				},
				goodsOptions: [],
				defaultProps: {
					children: 'children',
					label: 'name'
				},
				defaultCheckedKeys: [],
				urlOptions: [],
				remark: '',
				mpPageUrl: '',
				rules: {
					name: [{
						required: true,
						message: '请输入导航名称',
						trigger: 'change'
					}],
					url: [{
						required: true,
						message: '请输入地址',
						trigger: 'change'
					}]
				}
			};
		},
		methods: {
			async loadData() {
				await this.$db[__goodsCategory].totree({
					orderby: 'sort asc',
					startWith: 'pid == ""'
				}).then(res => {
					if (res.code == 200) {
						this.goodsOptions = res.datas;
					}
				});

				await this.$db[__mpPage].tolist().then(res => {
					if (res.code == 200) {
						res.datas.forEach(data => {
							this.urlOptions.push(data);
						});
					}
				});

				if (!this.dataId) {
					return;
				}

				await this.$db[__name].tofirst(this.dataId).then(res => {
					if (res.code == 200) {
						for (let item in this.form) {
							this.form[item] = res.datas[item];
						}
						if (this.form.img) {
							this.imageValue = {};
							this.imageValue.url = this.form.img;
						}
					}
				});
			},
			submitForm(formName) {
				this.form.cid = this.form.cid || '';
				this.$refs[formName].validate((valid, obj) => {
					// 默认获取第一个未验证 form 属性名
					this.$api.set_unvalidated_form_focus(this, obj);
					if (valid) {
						if (!this.dataId) {
							this.$db[__name].add(this.form).then(res => {
								if (res.code == 200) {
									this.getOpenerEventChannel().emit('loadData');
									this.returnPage();
								}
							});
						} else {
							this.$db[__name].update(this.dataId, this.form).then(res => {
								if (res.code == 200) {
									this.getOpenerEventChannel().emit('loadData');
									this.returnPage();
								}
							});
						}
					}
				});
			},
			imgUpload(e) {
				this.form.img = e.tempFilePaths[0];
			},
			imgDelete() {
				this.imageValue = null;
				this.form.img = '';
			},
			popoverHide(checkedIds, checkedData) {
				this.form.cid = checkedIds;
				this.form.name = checkedData.name;
				this.form.img = checkedData.img;
				this.imageValue = {};
				this.imageValue.url = checkedData.img;
			},
			returnPage() {
				bus.$emit('tab-close');
				this.$router.push('/pages/shop/classify/classify_navigation');
			},
			urlChange(data) {
				let obj = this.urlOptions.find(x => x._id == data);
				this.form.url = obj.url;
				this.remark = obj.remark;
			}
		},
		created() {
			this.dataId = this.$route.query.id || '';
			this.loadData();
		}
	};
</script>

<style>
	.el-tree.common-tree.el-tree--highlight-current {
		width: initial !important;
	}
</style>

<style></style>
