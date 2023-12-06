'use strict';

const uidObj = require('uni-id');
const {
	Controller
} = require('uni-cloud-router');

module.exports = class MemberController extends Controller {

	// 注册 
	async register() {
		this.ctx.data.role = ['admin'];
		const res = await uidObj.register(this.ctx.data);

		return res;
	}

	// 添加账号
	async add() {
		let response = {
			code: 1,
		};
		const encResult = await uidObj.encryptPwd(this.ctx.data.password);
		this.ctx.data.password = encResult.passwordHash;
		this.ctx.data.password_secret_version = encResult.version;
		this.ctx.data.register_date = new Date().getTime();
		this.ctx.data.register_ip = this.ctx.context.CLIENTIP;

		// 写入账号添加数据
		response.datas = await this.db.collection('uni-id-users').add(this.ctx.data);
		response.code = 0;

		return response;
	}

	// 编辑账号
	async edit() {
		let response = {
			code: 1,
		};
		let _id = this.ctx.data.dataId;

		delete this.ctx.data.dataId;
		// 编辑账号添加数据
		response.datas = await this.db.collection('uni-id-users').doc(_id).update(this.ctx.data);
		response.code = 0;

		return response;
	}


	// 登录
	async login() {
		const {
			username,
			password
		} = this.ctx.data

		const res = await uidObj.login({
			username,
			password,
			needPermission: true
		})
		console.log(res);

		// 日志记录
		await this.uidlog(res);
		return res;
	}

	// 登出
	async logout() {
		const res = await uniID.logout(this.ctx.event.uniIdToken)
		return res
	}

	//修改密码
	async updatePwd() {

		const {
			oldPassword,
			newPassword,
			passwordConfirmation
		} = this.ctx.data
		// 校验新密码与确认新密码是否一致
		const payload = await uidObj.checkToken(this.ctx.event.uniIdToken)
		if (payload.code) {
			return payload
		}

		const res = await uidObj.updatePwd({
			uid: payload.uid,
			oldPassword,
			newPassword
		})
		return res
	}

	// 注销
	async logout() {
		const res = await uidObj.logout(this.ctx.event.uniIdToken);
		return res;
	}

	// 验证码
	async sendSmsCode() {

		const res = await uidObj.sendSmsCode({
			mobile: this.ctx.data.mobile,
			type: this.ctx.data.type,
			code: Math.floor(Math.random() * 1000000),
			templateId: '11878'
		});

		return res;
	}

	// 手机号+验证码 登录|注册
	async loginBySms() {
		this.ctx.data.role = ['admin'];
		const res = await uidObj.loginBySms(this.ctx.data);
		console.log(res);

		return res;
	}

	// 修改数据
	async update() {
		const user = await uidObj.checkToken(this.ctx.event.uniIdToken);
		if (user && user.code == 0) {
			const res = await this.db.collection('uni-id-users').doc(user.uid).update(this.ctx.data);
		}

		return user;
	}

	// 日志记录
	async uidlog(res, type = 'login') {
		let data = {
			deviceId: this.ctx.data.deviceId || this.ctx.context.DEVICEID,
			ip: this.ctx.data.ip || this.ctx.context.CLIENTIP,
			type,
			ua: this.ctx.context.CLIENTUA,
			create_date: Date.now()
		};

		Object.assign(data, res.code === 0 ? {
			user_id: res.uid,
			state: 1
		} : {
			state: 0
		});

		return this.db.collection('uni-id-log').add(data);
	}

}
