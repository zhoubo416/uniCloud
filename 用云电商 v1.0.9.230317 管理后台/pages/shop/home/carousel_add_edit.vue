<template>
	<div class="container add_edit">
		<el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px">
			<el-form-item label="轮播图片">
				<uni-file-picker v-model="imageValue" fileMediatype="image" returnType="object"
					:image-styles="imageStyle" @success="imgUpload" @delete="imgDelete" />
			</el-form-item>
			<el-form-item label="跳转类型">
				<el-radio-group v-model="form.type">
					<el-radio label="网页">网页</el-radio>
					<el-radio label="页面">页面</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="地址">
				<el-select v-model="mpPageUrl" placeholder="请选择" class="sele" @change="urlChange">
					<el-option v-for="(item, idx) in urlOptions" :key="idx" :label="item.name + ' ' + item.url"
						:value="item._id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="跳转地址">
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
	const __name = 'usemall-app-carousel';
	const __mpPage = 'usemall-app-wxmini-page';
	export default {
		data() {
			return {
				dataId: '',
				form: {
					img: '',
					type: '网页',
					url: '',
					sort: 0,
					remark: '',
					state: '启用'
				},
				imageValue: null,
				imageStyle: {
					height: '200px',
					width: '500px'
				},
				urlOptions: [],
				remark: '',
				mpPageUrl: '',
				rules: {}
			};
		},
		methods: {
			async loadData() {
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
				this.$router.push('/pages/shop/home/page');
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

<style></style>
