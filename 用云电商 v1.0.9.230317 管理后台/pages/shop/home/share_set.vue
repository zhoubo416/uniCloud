<template>
	<div class="container add_edit">
		<el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px">
			<el-form-item label="分享标题" prop="share_title" ref="share_title"><el-input v-model="form.share_title"></el-input></el-form-item>
			<el-form-item label="分享图标">
				<uni-file-picker v-model="imageValue" fileMediatype="image" returnType="object" :image-styles="imageStyle" @success="imgUpload" @delete="imgDelete" />
			</el-form-item>
			<el-form-item label="分享描述"><el-input type="textarea" :autosize="{ minRows: 3 }" v-model="form.share_desc"></el-input></el-form-item>
			<el-form-item label="分享状态">
				<el-tooltip :content="form.state == '禁用' ? '点击启用' : '点击禁用'" placement="top" :hide-after="1000" :enterable="false" effect="light">
					<el-switch v-model="form.state" active-color="#ff6a6c" inactive-color="#bbb" active-value="启用" inactive-value="禁用"></el-switch>
				</el-tooltip>
			</el-form-item>
			<el-form-item><el-button class="confirm_btn" @click="submitForm('ruleForm')">提 交</el-button></el-form-item>
		</el-form>
	</div>
</template>

<script>
const __name = 'usemall-app-share';
export default {
	data() {
		return {
			dataId: '',
			form: {
				share_title: '',
				share_img: '',
				share_desc: '',
				state: '启用'
			},
			imageValue: null,
			imageStyle: {
				height: '150px',
				width: '150px'
			},
			rules: {
				share_title: [
					{
						required: true,
						message: '请输入分享标题',
						trigger: 'change'
					}
				]
			}
		};
	},
	methods: {
		async loadData() {
			await this.$db[__name].tofirst().then(res => {
				if (res.code == 200) {
					for (let item in this.form) {
						this.form[item] = res.datas[item];
					}
					this.dataId = res.datas._id;
					if (this.form.share_img != '') {
						this.imageValue = {};
						this.imageValue.url = this.form.share_img;
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
								this.$message({
									message: '操作成功',
									type: 'success'
								});
								this.loadData();
							}
						});
					} else {
						this.$db[__name].update(this.dataId, this.form).then(res => {
							if (res.code == 200) {
								this.$message({
									message: '操作成功',
									type: 'success'
								});
								this.loadData();
							}
						});
					}
				}
			});
		},
		imgUpload(e) {
			this.form.share_img = e.tempFilePaths[0];
		},
		imgDelete() {
			this.imageValue = null;
			this.form.share_img = '';
		}
	},
	created() {
		this.loadData();
	}
};
</script>

<style></style>
