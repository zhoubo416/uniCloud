'use strict';

const uidObj = require('uni-id');
const {
	Controller
} = require('uni-cloud-router');

module.exports = class MemberController extends Controller {

	// 注册 
	async register() {
		let response = { code: 1, msg: '账号注册失败', datas: {} };
		const { 
			username, 
			password, 
			code, 
			user 
		} = this.ctx.data;
		
		// 验证验证码有效性
		const vcRes = await this.validateSmsCode({
			mobile: username,
			code: code,
			type: "register"
		});
		if (vcRes.data.length !== 1) {
			response.datas = vcRes;
			response.msg = '验证码错误或已失效';
			return response;
		}
		
		const res = await uidObj.register({
			username,
			password,
			role: ['member']
		});
		
		if (res.code == 0) {
			let citys = [user.country, user.province, user.city];
			let nickname = user.nickName;
			if (res.username.length == 11) {
				nickname = '用云-' + res.username.substr(7, 4);
			}
			
			let member = {
				member_name: res.username || user.nickName,
				member_password: res.password || '',
				member_mobile: res.username,
				member_access_token: res.token,
				member_nickname: nickname,
				member_gender: user.gender || 0,
				member_headimg: user.avatarUrl || '',
				member_weixin_headimg: user.avatarUrl || '',
				member_city: citys.filter(x => x).join('-') || '',
			}
			
			const vcid = vcRes.data[0]._id;
			// 验证码已验证
			await this.db.collection('opendb-verify-codes').doc(vcid).update({ state: 1 });
			
			response.datas.user = res;
			response.datas.member = await this.memberLogin(res, member);
		} else {
			response.datas = res;
			response.msg = res.message;
			return response;
		}
		
		response.code = 0;
		response.msg = '注册成功';
		
		return response;
	}

	// 登录
	async login() {
		let response = {
			code: 1,
			member: {},
			user: {},
			msg: null
		};
		
		const {
			username,
			password
		} = this.ctx.data
		
		try{
			const res = await uidObj.login({
				username,
				password,
				needPermission: true
			})
			console.log(res);
			
			if (!(res && res.uid)) {
				response.msg = '账号密码不存在';
				return response;
			}
			
			let member = {
				member_access_token: res.token,
				member_password: res.password || '',
				member_mobile: res.username,
			}
			
			response.code = 0;
			response.member = await this.memberLogin(res, member);
			response.user = res;
		} catch(e) {
			//TODO handle the exception
			response.msg = e.message;
			console.log('catch', e);
		}
		
		return response;
	}

	// 注销
	async logout() {
		const res = await uidObj.logout(this.ctx.event.uniIdToken);
		return res;
	}

	// 验证码
	async sendSmsCode() {
		const { mobile, type } = this.ctx.data;
		
		// 如果验证码类型为 注册，验证手机账号是否已存在
		// 如果验证码类型为 忘记密码，验证手机账号是否存在
		let userRes = {};
		switch (type){
			case 'register':		// 注册
				userRes = await this.db.collection('uni-id-users')
					.where({ 
						username: mobile,
						role: 'member'
					})
					.field({
						username: true
					})
					.get();
				// console.log('userRes', userRes);
				if (userRes && userRes.data.length === 1) {
					return { code: 1, msg: '手机号已存在' };
				}
				break;
			case 'forgot-password':	// 忘记密码
				userRes = await this.db.collection('uni-id-users')
					.where({ 
						username: mobile,
						role: 'member'
					})
					.field({
						username: true
					})
					.get();
				// console.log('userRes', userRes);
				if (!(userRes && userRes.data.length === 1)) {
					return { code: 1, msg: '手机号不存在' };
				}
				break;
			default:
				break;
		}

		const res = await uidObj.sendSmsCode({
			...this.ctx.data,
			code: Math.floor(Math.random() * 1000000) + "",
			templateId: uidObj.config['service']['smscode']['templateId']
		});

		return res;
	}

	// 手机号+验证码 登录|注册
	async loginBySms() {
		this.ctx.data.role = ['member'];
		const res = await uidObj.loginBySms(this.ctx.data);
		console.log(res);
		return res;
	}

	// 微信小程序登录
	async loginByWeixin() {
		let response = {
			code: 1,
			member: {},
			user: {},
			msg: null
		};
		try {
			this.ctx.data.role = ['member'];
			const res = await uidObj.loginByWeixin(this.ctx.data);
			
			let member = {
				member_name: res.username || res.userInfo.nickname,
				member_access_token: res.token,
				member_session_key: res.sessionKey || '',
				member_nickname: res.userInfo.nickname || res.username,
				member_gender: res.userInfo.gender || 0,
				member_headimg: res.userInfo.avatar || '',
				member_weixin_headimg: res.userInfo.avatar || '',
				member_city: res.userInfo.comment || '',
				member_openid: res.openid || '',
			}
			
			response.code = 0;
			response.member = await this.memberLogin(res, member);
			response.user = res;
			
		} catch(e) {
			//TODO handle the exception
			response.msg = e;
			console.log('catch', e);
		}
		
		return response;
	}
	
	// 支付宝小程序登录
	async loginByAlipay() {
		let response = {
			code: 1,
			member: {},
			user: {},
			msg: null
		};
		try {
			this.ctx.data.role = ['member'];
			const res = await uidObj.loginByAlipay(this.ctx.data);
			
			let member = {
				member_name: res.username || res.userInfo.nickname,
				member_access_token: res.token,
				member_session_key: res.sessionKey || '',
				member_nickname: res.userInfo.nickname || res.username,
				member_gender: res.userInfo.gender || 0,
				member_headimg: res.userInfo.avatar || '',
				member_weixin_headimg: res.userInfo.avatar || '',
				member_city: res.userInfo.comment || '',
				member_openid: res.openid || '',
			}
			
			response.code = 0;
			response.member = await this.memberLogin(res, member);
			response.user = res;
			
		} catch(e) {
			//TODO handle the exception
			response.msg = e;
			console.log('catch', e);
		}
		
		return response;
	}
	
	// 验证验证码有效性
	async validateSmsCode(param) {
		const vcRes = await this.db.collection('opendb-verify-codes').where({
			...param,
			state: 0,
			expired_at: this.db.command.gte(Date.now())
		}).get();
		
		console.log("vcRes: ",vcRes, param);
		return vcRes;
	}
	// 忘记密码
	async forgotPassword() {
		let response = { code: 1, msg: '账号不存在' };
		
		const {
			mobile,
			password,
			code
		} = this.ctx.data;
		
		// 验证验证码有效性
		const vcRes = await this.validateSmsCode({
			mobile: mobile,
			code: code,
			type: "forgot-password"
		});
		if (vcRes.data.length !== 1) {
			response.datas = vcRes;
			response.msg = '验证码错误或已失效';
			return response;
		}
		
		// 加密密码
		const encryptPwd = await uidObj.encryptPwd(password);
		if (!(encryptPwd && encryptPwd.passwordHash)) {
			response.msg = '密码修改失败';
			return response;
		}
		
		// 修改密码
		response.datas = await this.db.collection('uni-id-users').where({
			username: mobile
		}).update({
			password: encryptPwd.passwordHash
		});
		
		if (response.datas.updated === 1) {
			const vcid = vcRes.data[0]._id;
			// 验证码已验证
			await this.db.collection('opendb-verify-codes').doc(vcid).update({ state: 1 });
			
			response.code = 0;
			response.msg = '密码修改成功';
			return response;
		}
		
		return response;
	}

	// 获取数据
	async data() {
		let response = {
			code: 1,
			member: {},
			stats: {}
		};
		uniCloud.logger.info(this.ctx.event);
		let uid = '';
		if (this.ctx.event.uniIdToken) {
			// 已登录，获取当前登录 uid
			const userRes = await uidObj.checkToken(this.ctx.event.uniIdToken);
			if (userRes.code == 0) {
				uid = userRes.uid;
			}
		}
		if (!uid) {
			response.msg = '当前未登录'
			return response;
		}
		const $ = this.db.command.aggregate;
		// 我的订单
		const orderRes = await this.db.collection('usemall-order').aggregate()
			.match({
				create_uid: $.eq(uid)
			})
			.group({
				_id: '$state',
				num: $.sum(1)
			})
			.end();

		// 我的足迹
		const browsing = await this.db.collection('usemall-goods-history').where({
			create_uid: uid
		}).count();
		// 我的收藏
		const collect = await this.db.collection('usemall-member-collect').where({
			create_uid: uid
		}).count();
		// todo: 优惠券
		
		const memberRes = await this.db.collection('usemall-member').doc(uid)
			.field({
				member_session_key: false,
				member_password: false
			}).get();
		let memberData = {};
		if (memberRes && memberRes.data.length === 1) {
			memberData = memberRes.data[0];
		}
		response.member = memberData;

		response.stats = {
			order: orderRes.data,
			browsing: browsing.total,
			collect: collect.total
		}
		response.code = 0;

		return response;
	}

	// 修改数据
	async update() {
		const user = await uidObj.checkToken(this.ctx.event.uniIdToken);
		if (user && user.code == 0) {
			const { 
				nickname,
				gender,
				avatar,
				comment
			} = this.ctx.data;
			await this.db.collection('uni-id-users').doc(user.uid).update(this.ctx.data);
			await this.db.collection('usemall-member').doc(user.uid).update({
				member_nickname: nickname,
				member_gender: gender,
				member_headimg: avatar,
				member_weixin_headimg: avatar,
				member_city: comment
			});
		}

		return user;
	}

	// 收藏
	async collect() {
		const user = await uidObj.checkToken(this.ctx.event.uniIdToken);
		if (user && user.code == 0) {
			// 
			const {
				goods_id,
				state
			} = this.ctx.data;

			let obj_id = user.uid + goods_id;
			return await this.db.collection('usemall-member-collect').doc(obj_id).set({
				goods: goods_id,
				state,
				create_uid: user.uid,
				create_time: new Date().getTime()
			});
		}

		return user;
	}

	// 写入会员登录数据
	async memberLogin(res, member) {
		// 
		if (res.code == 0) {
			let obj_id = res.uid;

			this.db.collection('usemall-member').doc(obj_id).update({

				...member,
				member_login_cnt: this.db.command.inc(1),
				member_login_current_ip: this.ctx.data.ip || this.ctx.context.CLIENTIP,
				
				version: this.db.command.inc(1),
				last_modify_uid: res.uid,
				last_modify_time: new Date().getTime()
			}).then(res => {
				if (res && res.updated <= 0) {
					this.db.collection('usemall-member').doc(obj_id).set({

						...member,
						member_guid: obj_id,
						member_uuid: res.unionid,
						member_coupon_cnt: 0,
						member_amount: 0,
						member_monetary: 0,
						member_login_cnt: 1,
						member_login_first_ip: this.ctx.data.ip || this.ctx.context.CLIENTIP,
						member_login_first_time: new Date().getTime(),
						is_plus: '会员',
						remark: '',
						version: 1,
						state: '已审核',
						create_uid: res.uid,
						create_time: new Date().getTime()
					});
				}
			});
		}

		// 日志记录
		this.uidlog(res);

		const memberRes = await this.db.collection('usemall-member').doc(res.uid)
			.field({
				member_session_key: false,
				member_password: false
			}).get();
		console.log('memberRes', memberRes);
		let memberData = {};
		if (memberRes && memberRes.data.length === 1) {
			memberData = memberRes.data[0];
		}

		return memberData;
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

	// 我的优惠券
	async coupon() {
		
		let response = {
			code: 1,
			datas: []
		};
		
		let start = new Date().getTime();
		// 请求参数
		const req = this.ctx.data;
		
		let {
			page,
			rows,
			state
		} = req;
		
		response.datas = [{
			state,
			"type": "满减",
			"name": "满100减9.9",
			"price": 9.90,
			"member_type": "所有人",
			"order_amount": 100.00,
			"per_max": 1,
			"start_time": "2021-06-10 00:00",
			"end_time": "2021-12-31 00:00",
			"sort": 0,
			"create_time": "2021-06-10 07:45:32"
		}, {
			state,
			"type": "折扣",
			"name": "满100打8折",
			"price": 0.80,
			"member_type": "所有人",
			"order_amount": 100.00,
			"per_max": 1,
			"start_time": "2021-06-10 00:00",
			"end_time": "2021-12-31 00:00",
			"sort": 0,
			"create_time": "2021-06-10 07:46:19",
		},{
			state,
			"type": "满减",
			"name": "满100减9.9",
			"price": 9.90,
			"member_type": "所有人",
			"order_amount": 100.00,
			"per_max": 1,
			"start_time": "2021-06-10 00:00",
			"end_time": "2021-12-31 00:00",
			"sort": 0,
			"create_time": "2021-06-10 07:45:32"
		}, {
			state,
			"type": "折扣",
			"name": "满100打8折",
			"price": 0.80,
			"member_type": "所有人",
			"order_amount": 100.00,
			"per_max": 1,
			"start_time": "2021-06-10 00:00",
			"end_time": "2021-12-31 00:00",
			"sort": 0,
			"create_time": "2021-06-10 07:46:19",
		},{
			state,
			"type": "满减",
			"name": "满100减9.9",
			"price": 9.90,
			"member_type": "所有人",
			"order_amount": 100.00,
			"per_max": 1,
			"start_time": "2021-06-10 00:00",
			"end_time": "2021-12-31 00:00",
			"sort": 0,
			"create_time": "2021-06-10 07:45:32"
		}, {
			state,
			"type": "折扣",
			"name": "满100打8折",
			"price": 0.80,
			"member_type": "所有人",
			"order_amount": 100.00,
			"per_max": 1,
			"start_time": "2021-06-10 00:00",
			"end_time": "2021-12-31 00:00",
			"sort": 0,
			"create_time": "2021-06-10 07:46:19",
		}];
		
		let end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
		
	}
}
