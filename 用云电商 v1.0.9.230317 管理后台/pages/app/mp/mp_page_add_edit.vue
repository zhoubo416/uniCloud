<template>
	<div class="container add_edit">
		<el-form :model="form" :rules="rules" ref="ruleForm" label-width="80px">
			<el-form-item label="页面名称" prop="name" ref="name"><el-input v-model="form.name" placeholder="请输入名称"></el-input></el-form-item>
			<el-form-item label="跳转类型">
				<el-radio-group v-model="form.type">
					<el-radio label="页面">页面</el-radio>
					<el-radio label="网页">网页</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="url地址" prop="url" ref="url"><el-input v-model="form.url" placeholder="请输入地址"></el-input></el-form-item>
			<el-form-item label="排序"><el-input v-model.number="form.sort" type="number" min="0" placeholder="请输入排序"></el-input></el-form-item>
			<el-form-item label="备注"><el-input v-model="form.remark" placeholder="请输入备注"></el-input></el-form-item>
			<el-form-item label="状态">
				<el-switch v-model="form.state" active-color="#ff6a6c" inactive-color="#bbb" active-value="启用" inactive-value="禁用"></el-switch>
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
const __name = 'usemall-app-wxmini-page';
export default {
	data() {
		return {
			dataId: '',
			form: {
				name: '',
				type: '页面',
				url: '',
				sort: 0,
				remark: '',
				state: '启用'
			},
			rules: {
				name: [
					{
						required: true,
						message: '请输入页面名称',
						trigger: 'change'
					}
				],
				url: [
					{
						required: true,
						message: '请选择跳转地址',
						trigger: 'change'
					}
				]
			}
		};
	},
	methods: {
		async loadData() {
			if (!this.dataId) {
				return;
			}

			await this.$db[__name].tofirst(this.dataId).then(res => {
				if (res.code == 200) {
					for (let item in this.form) {
						this.form[item] = res.datas[item];
					}
				}
			});
		},
		submitForm(formName) {
			this.$refs[formName].validate((valid, obj) => {
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
		returnPage() {
			bus.$emit('tab-close');
			this.$router.push('/pages/app/mp/mp_page');
		}
	},
	created() {
		this.dataId = this.$route.query.id || '';
		this.loadData();
	}
};
</script>

<style  ></style>
