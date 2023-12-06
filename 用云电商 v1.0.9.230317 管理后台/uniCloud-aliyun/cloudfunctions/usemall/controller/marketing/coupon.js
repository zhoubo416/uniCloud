'use strict';

const uidObj = require('uni-id');
const {
	Controller
} = require('uni-cloud-router');
const dbcmd = uniCloud.database().command;

module.exports = class CouponController extends Controller {

	// 领取优惠券
	async receive() {
		let response = {
			code: 1,
			datas: [],
			msg: '开发中'
		};


		return response;
	}

	// 列表
	async list() {
		let response = {
			code: 1,
			datas: []
		};

		let start = new Date().getTime();
		// 请求参数
		const req = this.ctx.data;

		let {
			page,
			rows
		} = req;

		response.datas = [{
			"type": "满减",
			"name": "满100减9.9",
			"price": 9.90,
			"member_type": "所有人",
			"order_amount": 100.00,
			"per_max": 1,
			"start_time": "2021-06-10 00:00",
			"end_time": "2021-12-31 00:00",
			"state": "运营中",
			"sort": 0,
			"create_time": "2021-06-10 07:45:32"
		}, {
			"type": "折扣",
			"name": "满100打8折",
			"price": 0.80,
			"member_type": "所有人",
			"order_amount": 100.00,
			"per_max": 1,
			"start_time": "2021-06-10 00:00",
			"end_time": "2021-12-31 00:00",
			"state": "运营中",
			"sort": 0,
			"create_time": "2021-06-10 07:46:19",
		},{
			"type": "满减",
			"name": "满100减9.9",
			"price": 9.90,
			"member_type": "所有人",
			"order_amount": 100.00,
			"per_max": 1,
			"start_time": "2021-06-10 00:00",
			"end_time": "2021-12-31 00:00",
			"state": "运营中",
			"sort": 0,
			"create_time": "2021-06-10 07:45:32"
		}, {
			"type": "折扣",
			"name": "满100打8折",
			"price": 0.80,
			"member_type": "所有人",
			"order_amount": 100.00,
			"per_max": 1,
			"start_time": "2021-06-10 00:00",
			"end_time": "2021-12-31 00:00",
			"state": "运营中",
			"sort": 0,
			"create_time": "2021-06-10 07:46:19",
		},{
			"type": "满减",
			"name": "满100减9.9",
			"price": 9.90,
			"member_type": "所有人",
			"order_amount": 100.00,
			"per_max": 1,
			"start_time": "2021-06-10 00:00",
			"end_time": "2021-12-31 00:00",
			"state": "运营中",
			"sort": 0,
			"create_time": "2021-06-10 07:45:32"
		}, {
			"type": "折扣",
			"name": "满100打8折",
			"price": 0.80,
			"member_type": "所有人",
			"order_amount": 100.00,
			"per_max": 1,
			"start_time": "2021-06-10 00:00",
			"end_time": "2021-12-31 00:00",
			"state": "运营中",
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
