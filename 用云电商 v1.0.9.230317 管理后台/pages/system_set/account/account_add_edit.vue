<template>
	<div class="container add_edit">
		<el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px">
			<el-form-item label="账号" prop="username" ref="username">
				<el-input v-model="form.username" placeholder="请输入账号" clearable></el-input>
			</el-form-item>
			<el-form-item label="密码" prop="password" ref="password" v-if="dataId === ''">
				<el-input v-model="form.password" show-password placeholder="请输入密码"></el-input>
			</el-form-item>
			<el-form-item label="角色" prop="role" ref="role">
				<el-select class="sele" multiple v-model="role" @change="roleAdd">
					<el-option v-for="(item, idx) in roleOptions" :key="idx" :label="item.role_id"
						:value="item.role_id"></el-option>
				</el-select>
				<div class="remark_txt">用户可拥有多种角色</div>
			</el-form-item>
			<el-form-item label="性别">
				<el-radio v-model="form.gender" label="0">未知</el-radio>
				<el-radio v-model="form.gender" label="1">男</el-radio>
				<el-radio v-model="form.gender" label="2">女</el-radio>
			</el-form-item>
			<el-form-item label="头像">
				<uni-file-picker v-model="imageValue" fileMediatype="image" returnType="object"
					:image-styles="imageStyle" @success="imgUpload" @delete="imgDelete" />
			</el-form-item>
			<el-form-item label="手机号">
				<el-input v-model="form.mobile" type="number" placeholder="请输入手机号" clearable></el-input>
			</el-form-item>
			<el-form-item label="备注">
				<el-input v-model="form.comment" placeholder="请输入备注" clearable></el-input>
			</el-form-item>
			<el-form-item label="状态">
				<el-switch v-model="form.status" active-color="#ff6a6c" inactive-color="#bbb" :active-value="0"
					:inactive-value="1"></el-switch>
			</el-form-item>
			<el-form-item>
				<el-button round icon="el-icon-check" class="confirm_btn" @click="submitForm('ruleForm')">提交</el-button>
				<el-button round icon="el-icon-back" @click="returnPage">返回</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
	import bus from '@/common/bus';
	const __name = 'uni-id-users';
	const __role = 'uni-id-roles';
	export default {
		data() {
			const validateUsername = async (rule, value, callback) => {
				if (!value) {
					return callback(new Error('请输入账号'));
				}
				let res = await this.$db[__name]
					.field('username')
					.where({
						_id: this.$db.$cmd.neq(this.dataId),
						username: value
					})
					.tofirst({
						loadding: false
					});
				if (res.datas) {
					callback(new Error(value + ' 账号已存在'));
					return;
				}

				callback();
			};
			return {
				dataId: '',
				roleOptions: [],
				role: [],
				form: {
					username: '',
					password: '',
					role: [],
					gender: '0',
					avatar: '',
					mobile: '',
					comment: '',
					status: 0
				},
				imageValue: null,
				imageStyle: {
					height: '150px',
					width: '150px'
				},
				rules: {
					username: [{
						required: true,
						validator: validateUsername,
						trigger: 'change'
					}],
					password: [{
						required: true,
						message: '请输入密码',
						trigger: 'change'
					}],
					role: [{
						required: true,
						message: '请选择角色',
						trigger: 'change'
					}]
				}
			};
		},
		methods: {
			async loadData() {
				await this.$db[__role].tolist({
					page: 1,
					rows: 500
				}).then(res => {
					if (res.code == 200) {
						this.roleOptions = res.datas;
					}
				});

				if (!this.dataId) {
					return;
				}

				await this.$db[__name]
					.field('username, role, gender, avatar, mobile, comment, status')
					.tofirst(this.dataId)
					.then(res => {
						if (res.code == 200) {
							for (let item in this.form) {
								this.form[item] = res.datas[item];
							}

							this.roleOptions.forEach(x => {
								if (res.datas.role.find(g => g == x.role_id)) {
									this.role.push(x.role_id);
								}
							});
							if (this.form.avatar) {
								this.imageValue = {};
								this.imageValue.url = this.form.avatar;
							}
						}
					});
			},
			submitForm(formName) {
				this.$refs[formName].validate((valid, obj) => {
					this.$api.set_unvalidated_form_focus(this, obj);
					if (valid) {
						if (!this.dataId) {
							this.$func.useadmin.call('user/add', this.form).then(res => {
								if (res.code == 200) {
									this.getOpenerEventChannel().emit('loadData');
									this.returnPage();
								}
							});
						} else {
							delete this.form.password;
							let userData = uni.getStorageSync('useadmin_user');
							this.form.dataId = this.dataId;
							this.$func.useadmin.call('user/edit', this.form).then(res => {
								if (res.code == 200) {
									if (userData._id == this.dataId) {
										userData.avatar = this.form.avatar;
										uni.setStorageSync('useadmin_user', userData);
										bus.$emit('setUserMsg');
									}
									this.getOpenerEventChannel().emit('loadData');
									this.returnPage();
								}
							});
						}
					}
				});
			},
			roleAdd() {
				this.form.role = [];
				this.roleOptions.forEach(x => {
					if (this.role.find(g => g == x.role_id)) {
						this.form.role.push(x.role_id);
					}
				});
			},
			imgUpload(e) {
				this.form.avatar = e.tempFilePaths[0];
			},
			imgDelete() {
				this.imageValue = null;
				this.form.avatar = '';
			},
			returnPage() {
				bus.$emit('closeTab');
				this.$router.push('/pages/system_set/account/account');
			}
		},
		created() {
			this.dataId = this.$route.query.id || '';
			this.loadData();
		}
	};
</script>

<style></style>
