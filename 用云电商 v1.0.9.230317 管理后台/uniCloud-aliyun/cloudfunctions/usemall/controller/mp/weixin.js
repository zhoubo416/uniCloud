'use strict';

const uidPay = require('uni-pay');
const {
	Controller
} = require('uni-cloud-router');

module.exports = class WeixinController extends Controller {

	// 微信支付回调
	async notify() {

		const uniPayIns = uidPay.initWeixin({
			appId: 'your appId',
			mchId: 'your mchId',
			key: 'you parterner key'
		});

		let res = await uniPayIns.verifyPaymentNotify(this.ctx.event);
		
		// 根据商户订单号,判断支付金额是否一致
		// 根据商户订单号 
		// 	1.修改订单状态为 待发货
		// 	2.修改订单支付数据
		// 根据订单获取下单人
		// 根据下单人累计消费金额
		// 根据订单设置,如果为支付成功后扣减库存,则扣减对应商品扣除
		// 写入订单支付数据
		// 写入订单日志
		
		
		if (res.returnCode == 'SUCCESS') {
			return {
				statusCode: 200,
				headers: {
					'content-type': 'text/xml;charset=utf-8'
				},
				body: `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`
			}
		}

		return {
			statusCode: 200,
			headers: {
				'content-type': 'text/xml;charset=utf-8'
			},
			body: `<xml><return_code><![CDATA[FAILD]]></return_code><return_msg><![CDATA[异常回调]]></return_msg></xml>`
		};
	}

}
