<template>
	<div class="container add_edit">
		<el-form :model="form" ref="ruleForm" :rules="rules" label-width="100px">
			<el-form-item label="上级分类">
				<el-select class="sele" v-model="form.pid" placeholder="请选择" :disabled="dataId != ''">
					<el-option v-for="(item, idx) in classData" :key="idx" :label="item.name" :value="item._id">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="分类名称" prop="name" ref="name">
				<el-input v-model="form.name" placeholder="分类名称"></el-input>
			</el-form-item>
			<el-form-item label="图标">
				<uni-file-picker v-model="imageValue" fileMediatype="image" returnType="object"
					:image-styles="imageStyle" @success="imgUpload" @delete="imgDelete" />
			</el-form-item>
			<el-form-item label="排序">
				<el-input v-model.number="form.sort" type="number" min="0"></el-input>
				<div class="remark_txt">此处排序将决定前端模块的位置，数字越小，位置越前</div>
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
	const __name = 'usemall-goods-category';
	export default {
		props: {},
		data() {
			return {
				dataId: '',
				form: {
					sort: 0,
					pid: '',
					name: '',
					img: '',
					state: '启用'
				},
				imageValue: null,
				imageStyle: {
					height: '150px',
					width: '150px'
				},
				classData: [],
				rules: {
					name: [{
						required: true,
						message: '请输入分类名称',
						trigger: 'change'
					}]
				}
			};
		},
		methods: {
			async loadData() {
				await this.$db[__name]
					.where({
						pid: ''
					})
					.tolist({
						page: 1,
						rows: 500
					})
					.then(res => {
						if (res.code == 200) {
							this.classData = res.datas.filter(x => !x.pid);
							this.classData.unshift({
								_id: '',
								name: '请选择'
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
			returnPage() {
				bus.$emit('tab-close');
				this.$router.push('/pages/goods/classify/goods_classify');
			}
		},
		created() {
			this.dataId = this.$route.query.id || '';
			this.loadData();
		}
	};
</script>

<style></style>
