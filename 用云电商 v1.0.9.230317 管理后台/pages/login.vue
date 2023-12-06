<template>
	<div class="login dflex_c dflex_d_c">
		<el-image style="width: 50px;height: 50px;" src="/static/img/login_log.jpg" fit="contain"></el-image>
		<div class="title">用云电商</div>
		<el-form :model="form" :rules="rules" ref="ruleForm" class="login_form">
			<el-form-item prop="username" ref="username"><el-input v-model="form.username" placeholder="账号" @keyup.enter.native="enter"></el-input></el-form-item>
			<el-form-item prop="password" ref="password">
				<el-input v-model="form.password" placeholder="密码" show-password @keyup.enter.native="submitForm('ruleForm')"></el-input>
			</el-form-item>
			<div class="login_btn dflex_c margin_t_50 crpr" @click="submitForm('ruleForm')">登 录</div>
		</el-form>
	</div>
</template>

<script>
import config from '@/admin.config.js';
import bus from '@/common/bus';
export default {
	data() {
		return {
			form: {
				username: '',
				password: ''
			},
			loading: false,
			rules: {
				username: [
					{
						required: true,
						message: '账号不可以为空',
						trigger: ['blur', 'keyup']
					}
				],
				password: [
					{
						required: true,
						message: '密码不可以为空',
						trigger: 'change'
					}
				]
			},
			business_data: {}
		};
	},
	methods: {
		enter() {
			if (this.form.username) {
				this.$refs.password.$el.querySelector('input').focus();
			}
		},
		submitForm(formName) {
			this.$refs[formName].validate((valid, obj) => {
				this.$api.set_unvalidated_form_focus(this, obj);
				if (valid) {
					if (this.loading) {
						return;
					}
					let data = this.form;

					this.loading = true;

					this.$func.useadmin
						.call('user/login', data)
						.then(res => {
							if (res.code == 200) {
								
								uni.setStorage({
									key: 'useadmin_last_username',
									data: data.username
								});
								
								uni.setStorage({
									key: 'useadmin_user',
									data: res.datas.userInfo
								})
								uni.setStorage({
									key: 'uni_id_token',
									data: res.datas.token
								});
								uni.setStorage({
									key: 'uni_id_token_expired',
									data: res.datas.tokenExpired
								});
								uni.redirectTo({
									url: config.index.url
								});
								this.$message.success('登录成功');
								bus.$emit('loginIn');
								return;
							}

							this.$message.error(res.msg);
						})
						.finally(err => {
							this.loading = false;
						});
				}
			});
		}
	},
	mounted() {
		this.$refs.username.$el.querySelector('input').focus();
		uni.getStorage({
			key: 'useadmin_last_username',
			success: res => {
				this.form.username = res.data;
				this.$refs.password.$el.querySelector('input').focus();
			}
		});
		document.getElementsByTagName('html')[0].style.cssText =
			'--status-bar-height:0px; --top-window-height:0px; --window-left:0px; --window-right:0px; --window-margin:0px; --window-top:calc(var(--top-window-height) + 0px); --window-bottom:0px;';
	}
};
</script>

<style>
page {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: url('/static/img/login_bg.png');
	background-size: cover;
	padding: 0;
	margin-top: 0;
}

.login {
	width: 880px;
	height: 560px;
	background: #fff;
	box-shadow: 0 0 30px rgba(0, 0, 0, 0.16);
	border-radius: 20px;
}

.title {
	font-size: 22px;
	font-weight: 800;
	margin-bottom: 100px;
}

>>> .login_form .el-input__inner {
	border: none;
	border-bottom: 1px solid #d9d9d9;
	border-radius: 0;
	padding-left: 6px;
	font-size: 14px;
	width: 260px;
	color: #ff6a6c;
}


.login_btn {
	width: 260px;
	height: 40px;
	background-color: #ff6a6c;
	border-radius: 4px;
	font-size: 18px;
	font-weight: 800;
	color: #fff;
}
</style>
