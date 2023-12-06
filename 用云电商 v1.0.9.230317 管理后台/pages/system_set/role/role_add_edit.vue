<template>
	<div class="container add_edit">
		<el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px">
			<el-form-item label="角色标识" prop="role_id" ref="role_id"><el-input v-model="form.role_id" placeholder="请输入角色名称"></el-input></el-form-item>
			<el-form-item label="角色名称" prop="role_name" ref="role_name"><el-input v-model="form.role_name" placeholder="请输入角色名称"></el-input></el-form-item>
			<el-form-item label="备注"><el-input v-model="form.comment" placeholder="请输入备注"></el-input></el-form-item>
			<el-form-item>
				<el-button class="confirm_btn" @click="submitForm('ruleForm')">确 定</el-button>
				<el-button @click="returnPage">返回列表</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import bus from '@/common/bus';
const __name = 'uni-id-roles';
export default {
	data() {
		return {
			dataId: '',
			form: {
				role_id: '',
				role_name: '',
				comment: ''
			},
			rules: {
				role_id: [
					{
						required: true,
						message: '角色标识不能为空',
						trigger: 'change'
					}
				],
				role_name: [
					{
						required: true,
						message: '角色名称不能为空',
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
		returnPage() {
			bus.$emit('tab-close');
			this.$router.push('/pages/system_set/role/role');
		}
	},
	created() {
		this.dataId = this.$route.query.id || '';
		this.loadData();
	}
};
</script>

<style  ></style>
