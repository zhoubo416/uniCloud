'use strict';

const uidObj = require('uni-id');
const uidPay = require('uni-pay');
const db = uniCloud.database();

exports.main = async (event, context) => {
	let response = {
		mpserverlessComposedResponse: true,
		statusCode: 200,
		headers: {
			'content-type': 'text/xml;charset=utf-8'
		},
		body: `<xml><return_code><![CDATA[FAILD]]></return_code><return_msg><![CDATA[异常回调]]></return_msg></xml>`
	};
	
	const path = event.path;
	let res = {};
	let payObj = {
		name: '微信支付',
		way: 'wxpay'
	};
	switch(path) {
		case '/':
		case '/wxpay':
			const uniWxpayIns = uidPay.initWeixin(uidObj.config['mp-weixin']['pay']);
			res = await uniWxpayIns.verifyPaymentNotify(event);
			
			break;
		case '/alipay':
			const uniAlipayIns = uidPay.initAlipay(uidObj.config['mp-alipay']['pay']);
			res = await uniAlipayIns.verifyPaymentNotify(event);
			
			payObj.name = '支付宝支付';
			payObj.way = 'alipay';
			break;
		default:
			break;
	}
	
	// 根据商户订单号,判断支付金额是否一致
	// 根据商户订单号 
	// 	1.修改订单状态为 待发货
	// 	2.修改订单支付数据
	// 根据订单获取下单人
	// 根据下单人累计消费金额
	// 根据订单设置,如果为支付成功后扣减库存,则扣减对应商品扣除
	// 修改订单支付数据
	// 写入订单日志
	
	if (res && ( res.returnCode == 'SUCCESS' || res.resultCode == 'SUCCESS')) {
		const {
			outTradeNo,
			totalFee,
			transactionId,
			openid
		} = res;
		
		let orderRes = await db.collection('usemall-order')
			.where({ is_delete: 0, order_id: outTradeNo })
			.get();
		
		if (!(orderRes && orderRes.data && orderRes.data.length == 1)) {
			uniCloud.logger.info(`订单[${outTradeNo}]不存在`);
			return response;
		}
		const order = orderRes.data[0];
		
		if (order.order_actural_paid != totalFee) {
			uniCloud.logger.info(`订单[${outTradeNo}]支付金额不一致，[${order.order_actural_paid}] != [${totalFee}]`);
			return response;
		}
		const uid = order.create_uid;
		
		// todo 开启事务
		
		// 更改订单状态
		await db.collection('usemall-order').doc(order._id).update({
			last_modify_time: new Date().getTime(),
			last_modify_uid: payObj.way,
			last_modify_uname: payObj.name,
			
			version: db.command.inc(1),
			state: '待发货',
			order_pay_state: '已付款',
			order_pay_no: transactionId,
			order_pay_way: payObj.name,
		});
		
		// 修改订单支付数据
		await db.collection('usemall-order-pay').where({ order_id: order.order_id }).update({
			version: db.command.inc(1),
			pay_state: '已付款',
			pay_notify: event,
			pay_time: new Date().getTime(),
			pay_no: transactionId,
			pay_openid: openid
		});
		
		// 订单详情 
		const orderDetailRes = await db.collection('usemall-order-detail').where({ order_id: order.order_id }).get(); 
		if (orderDetailRes && orderDetailRes.data) {
			for (let i = 0; i < orderDetailRes.data.length; i++) {
				let x = orderDetailRes.data[i];
				// 扣减库存
				// todo 扣减SKU库存
				await db.collection('usemall-goods')
					.where({_id: x.goods_id, stock_num: db.command.gte(x.goods_num)})
					.update({
						stock_num: db.command.inc(-x.goods_num),
						sale_cnt: db.command.inc(x.goods_num)
					});
			}
		}
		
		// 修改下单人 累计消费
		const memberRes = await db.collection('usemall-member').doc(uid).update({
			member_monetary: db.command.inc(totalFee)
		});
		
		// 订单日志
		let order_log = {
			order_id: order.order_id,
			log_type: '订单支付',
			current_state: '待发货',
			prev_state: '待付款',
			ip: event.headers['x-real-ip'],
			is_delete: 0,
			create_uid: uid,
			create_time: new Date().getTime()
		};
		await db.collection('usemall-order-log').add(order_log);
		
		if (payObj.way == 'wxpay') {
			response.body = `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`;
		}
		else if (payObj.way == 'alipay') {
			response.headers['content-type'] = 'text/plain';
			response.body = 'success';
		}
		
	}
	
	uniCloud.logger.info(res);
	uniCloud.logger.info(response);
	
	return response;
};
