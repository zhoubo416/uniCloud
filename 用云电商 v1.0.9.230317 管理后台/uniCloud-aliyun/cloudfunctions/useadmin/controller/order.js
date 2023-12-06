'use strict';

const {
	Controller
} = require('uni-cloud-router');
const dbcmd = uniCloud.database().command;

module.exports = class OrderController extends Controller {
	// 同意退款
	async refund() {
		let response = {
			code: 1,
		};
		const start = new Date().getTime();
		const nowdate = start;

		const {
			id,
			order_id,
			remark,
			state
		} = this.ctx.data;
		// console.log('this.ctx.data', this.ctx.data);
		const uid = this.ctx.auth.uid;

		let where_obj = {
			is_delete: 0,
			state: '售后中',
			order_id: order_id,
		};

		// 1. 获取订单数据
		let orderRes = await this.db.collection('usemall-order')
			.where(where_obj)
			.field({
				order_actural_paid: true,
				order_id: true,
				state: true,
				is_fxs: true,
				is_settlement: true,
				order_fxs_uid: true,
				order_fxs_amount: true,
				order_member_name: true,
				order_member_openid: true,
				order_member_headimg: true,
				order_info: true,
				order_goods_cnt: true,
				create_uid: true,
			})
			.get();

		if (!(orderRes && orderRes.data && orderRes.data.length == 1)) {
			response.msg = `售后订单[${order_id}]不存在`;
			return response;
		}
		const order = orderRes.data[0];

		// 2. 修改订单数据
		const orderUpdateRes = await this.db.collection('usemall-order')
			.doc(order._id)
			.update({
				state: '售后结束',
				order_refund_state: state,
				order_pay_state: state,

				last_modify_time: nowdate,
				last_modify_uname: this.ctx.auth.userInfo.username,
				last_modify_uid: uid
			});

		if (orderUpdateRes && orderUpdateRes.updated == 1) {

			// 3. 修改退款申请数据 
			const refundUpdateRes = await this.db.collection('usemall-order-refund')
				.doc(id)
				.update({
					state: state,
					remark: remark,
					last_modify_time: nowdate,
					last_modify_uname: this.ctx.auth.userInfo.username,
					last_modify_uid: uid
				});

			// 4. 插入订单日志
			await this.db.collection('usemall-order-log').add({
				order_id: order.order_id,
				log_type: '退款处理',
				current_state: '售后结束',
				prev_state: order.state,
				ip: this.ctx.context.CLIENTIP,
				is_delete: 0,
				create_uid: uid,
				create_uname: this.ctx.auth.userInfo.username,
				create_time: nowdate
			});
			// 5. 修改用户消费金额
			const memberRes = await this.db.collection('usemall-member').doc(order.create_uid).update({
				member_monetary: this.db.command.inc(-order.order_actural_paid)
			});
		}

		response.datas = orderUpdateRes;

		const end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
	}

	// 拒绝退款
	async refuse() {
		let response = {
			code: 1,
		};
		const start = new Date().getTime();
		const nowdate = start;
	
		const {
			id,
			order_id,
			remark,
			state
		} = this.ctx.data;
		// console.log('this.ctx.data', this.ctx.data);
		const uid = this.ctx.auth.uid;
	
		let where_obj = {
			is_delete: 0,
			state: '售后中',
			order_id: order_id,
		};
	
		// 1. 获取订单数据
		let orderRes = await this.db.collection('usemall-order')
			.where(where_obj)
			.field({
				order_actural_paid: true,
				order_id: true,
				state: true,
				is_fxs: true,
				is_settlement: true,
				order_fxs_uid: true,
				order_fxs_amount: true,
				order_member_name: true,
				order_member_openid: true,
				order_member_headimg: true,
				order_info: true,
				order_goods_cnt: true,
				create_uid: true,
			})
			.get();
	
		if (!(orderRes && orderRes.data && orderRes.data.length == 1)) {
			response.msg = `售后订单[${order_id}]不存在`;
			return response;
		}
		const order = orderRes.data[0];
	
		// 2. 修改订单数据
		const orderUpdateRes = await this.db.collection('usemall-order')
			.doc(order._id)
			.update({
				state: '售后结束',
				order_refund_state: state,
				order_refund_remark: remark,
				last_modify_time: nowdate,
				last_modify_uname: this.ctx.auth.userInfo.username,
				last_modify_uid: uid
			});
	
		if (orderUpdateRes && orderUpdateRes.updated == 1) {
	
			// 3. 修改退款申请数据 
			const refundUpdateRes = await this.db.collection('usemall-order-refund')
				.doc(id)
				.update({
					state: state,
					remark: remark,
					last_modify_time: nowdate,
					last_modify_uname: this.ctx.auth.userInfo.username,
					last_modify_uid: uid
				});
	
			// 4. 插入订单日志
			await this.db.collection('usemall-order-log').add({
				order_id: order.order_id,
				log_type: '退款处理',
				current_state: '售后结束',
				prev_state: order.state,
				ip: this.ctx.context.CLIENTIP,
				is_delete: 0,
				create_uid: uid,
				create_uname: this.ctx.auth.userInfo.username,
				create_time: nowdate
			});
		}
	
		response.datas = orderUpdateRes;
	
		const end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
	}

}
