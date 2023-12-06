<template>
	<div>
		<el-header height="60px" class="header dflex_b" ref="change">
			<div class="crpr" @click="foldChange">
				<i v-if="!fold" class="el-icon-s-fold"></i>
				<i v-else class="el-icon-s-unfold"></i>
			</div>
			<div class="dflex_vertical_c sele_none">
				<el-link v-if="!false" class="crpr" href="https://www.use-cloud.com" target="_blank">用云电商 v{{ adminVersion }}</el-link>
				<div @click="informDrawer = true" class="margin_l_50 crpr">
					<el-badge :value="informDatas.length"><i class="iconfont icontongzhi"></i></el-badge>
				</div>
				<el-dropdown class="crpr margin_l_50" @command="handleCommand">
					<div class="dflex_vertical_c">
						<el-image
							class="headimg_mini"
							:src="user.avatar || '/static/img/default.jpg'"
							:preview-src-list="user.avatars"
							fit="cover"
						></el-image>
						<div class="margin_l_10">{{ user.username || '用云电商' }}</div>
					</div>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item class="el-icon-edit-outline dflex" command="pwdChange"><div class="margin_l_5">修改密码</div></el-dropdown-item>
						<el-dropdown-item class="el-icon-switch-button dflex" command="logOut"><div class="margin_l_5">安全退出</div></el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</div>
		</el-header>
		<el-drawer title="通知" :visible.sync="informDrawer" direction="rtl" :append-to-body="true">
			<el-tooltip content="双击已读" placement="top" :hide-after="1000" :enterable="false" effect="light" v-for="(item, i) in informDatas" :key="i">
				<div v-if="!item.read" :ref="item.ref" class="inform crpr margin_lr_20 margin_b_20 padding_20 animated" :class="{ fadeOut: item.read == 1 }" @dblclick="read(i)">
					<div class="dflex_sb dflex_vertical_c">
						<div>{{ item.title + i }}</div>
						<div class="bbb margin_t_10">{{ item.time }}</div>
					</div>
					<div class="bbb margin_t_15">{{ item.content }}</div>
				</div>
			</el-tooltip>
		</el-drawer>
		<el-drawer title="修改密码" :visible.sync="pwdDrawer" direction="rtl" :append-to-body="true" :wrapperClosable="false">
			<el-form class="add_edit" :model="form" :rules="rules" ref="ruleForm" label-width="100px">
				<el-form-item label="原密码" prop="oldPassword" ref="oldPassword"><el-input v-model="form.oldPassword" show-password></el-input></el-form-item>
				<el-form-item label="新密码" prop="newPassword" ref="newPassword"><el-input v-model="form.newPassword" show-password></el-input></el-form-item>
				<el-form-item label="确认密码" prop="passwordConfirmation" ref="passwordConfirmation">
					<el-input v-model="form.passwordConfirmation" show-password></el-input>
				</el-form-item>
				<el-form-item>
					<el-button class="confirm_btn" @click="submitForm('ruleForm')">确 定</el-button>
					<el-button @click="pwdDrawer = false">关 闭</el-button>
				</el-form-item>
			</el-form>
		</el-drawer>
		<tab></tab>
	</div>
</template>

<script>
import bus from '@/common/bus';
import tab from '@/windows/components/tab.vue';
import { version } from '@/package.json';
export default {
	components: {
		tab
	},
	data() {
		const pass = (rule, value, callback) => {
			if (value === '') {
				callback(new Error('请输入密码'));
			} else {
				if (this.form.passwordConfirmation !== '') {
					this.$refs.ruleForm.validateField('passwordConfirmation');
				}
				callback();
			}
		};
		const checkPass = (rule, value, callback) => {
			if (value === '') {
				callback(new Error('请再次输入密码'));
			} else if (value !== this.form.newPassword) {
				callback(new Error('两次输入密码不一致!'));
			} else {
				callback();
			}
		};
		const validateLength = {
			min: 3,
			max: 20,
			message: '长度在 3 到 20 个字符',
			trigger: 'change'
		};
		return {
			adminVersion: version,
			fold: false,
			user: {},
			informDrawer: false,
			pwdDrawer: false,
			form: {
				oldPassword: '',
				newPassword: '',
				passwordConfirmation: ''
			},
			rules: {
				oldPassword: [
					{
						required: true,
						message: '请输入原密码',
						trigger: 'change'
					},
					validateLength
				],
				newPassword: [{ required: true, validator: pass, trigger: 'change' }, validateLength],
				passwordConfirmation: [{ required: true, validator: checkPass, trigger: 'change' }, validateLength]
			},
			informDatas: [
				{
					title: '小程序"用云电商"代码发布审核结果',
					ref: 'read0',
					read: 0,
					time: '2020-05-16 00:00',
					content: '你的小程序"用云电商"，提审时间2020-05-08 21:18:05，版本审核未通过。'
				}
			]
		};
	},
	methods: {
		handleCommand(command) {
			if (command == 'logOut') {
				this.$confirm('此操作将退出后台系统, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.$func.useadmin.call('user/logout').then(res => {
						if (res.code == 200) {
							bus.$emit("logOut")
							uni.removeStorageSync('uni_id_token');
							uni.removeStorageSync('uni_id_token_expired');
							uni.removeStorageSync('sys-tags');
							this.$message({
								type: 'success',
								message: '登出成功!'
							});
							uni.redirectTo({
								url: '/pages/login'
							});
						}
					});
				});
			} else if (command == 'pwdChange') {
				this.form.oldPassword = '';
				this.form.newPassword = '';
				this.form.passwordConfirmation = '';
				this.pwdDrawer = true;
			}
		},
		foldChange() {
			this.fold = !this.fold;

			if (this.fold) {
				this.$refs.change.$el.style.left = '64px';
				document.getElementsByTagName('uni-main')[0].style.left = '64px';
				document.getElementsByTagName('uni-main')[0].style.position = 'fixed';
			} else {
				this.$refs.change.$el.style.left = 'var(--window-left)';
				document.getElementsByTagName('uni-main')[0].style.left = 'var(--window-left)';
				const timer = setTimeout(() => {
					clearTimeout(timer);
					document.getElementsByTagName('uni-main')[0].style.position = '';
				}, 300);
			}

			bus.$emit('fold', this.fold);
		},
		submitForm(formName) {
			this.$refs[formName].validate((valid, obj) => {
				// 默认获取第一个未验证 form 属性名
				this.$api.set_unvalidated_form_focus(this, obj);
				if (valid) {
					this.$func.useadmin.call('user/updatePwd', this.form).then(res => {
						if (res.code == 200) {
							this.pwdDrawer = false;
							uni.redirectTo({
								url: `/pages/login`
							});
							return;
						}
						this.$message.error(res.msg);
					});
				}
			});
		},
		read(index) {
			this.informDatas[index].read = 1;
		},
		setUserMsg() {
			this.user = this.user = uni.getStorageSync('useadmin_user') || {};
			if (this.user.avatar) {
				this.user.avatars = [this.user.avatar];
				return;
			}

			this.user.avatars = ['/static/img/default.jpg'];
		}
	},
	created() {
		this.setUserMsg();

		bus.$on('setUserMsg', () => {
			this.setUserMsg();
		});

		bus.$on('loginIn', () => {
			this.setUserMsg();
		});
	}
};
</script>

<style>
>>> .el-drawer__body {
	overflow: overlay;
}

>>> .el-link.el-link--default:hover {
	color: #ff6a6c;
}

>>> .el-link.is-underline:hover:after {
	border-bottom: 1px solid #ff6a6c;
}

.header {
	position: fixed;
	top: 0;
	left: 180px;
	right: 0;
	background-color: #fff;
	transition: all 0.3s ease-in-out;
}

.icontongzhi {
	font-size: 24px;
}

.inform {
	background-color: #f5f5f5;
	border-radius: 10px;
}

.add_edit .el-input {
	width: 90%;
}
</style>
