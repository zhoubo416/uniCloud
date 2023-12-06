const uidObj = require('uni-id');
const kd100Url = 'https://poll.kuaidi100.com/poll/query.do';

const { Service } = require('uni-cloud-router')

module.exports = class ExpressService extends Service {

	constructor(ctx) {
		super(ctx)
	}
	
	// 快递100 实时快递查询
	async kd100Query({ com, num }) {
		try{
			const kd100Config = uidObj.config['kd100'];
			let data = {
				customer: kd100Config.customer,
				param: {
					com: com,
					num: num
				}
			};
			
			data.param = JSON.stringify(data.param);
			
			const str = data.param + kd100Config.key + data.customer;
			const sign = this.service.md5.hex(str).toUpperCase();
			
			data.sign = sign;
			
			const res = await this.curl(kd100Url, {
				nestedQuerystring: true,
				method: 'post',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				dataType: 'json',
				data: data
			});
			
			return res.data;
		}catch(e){
			console.log(e);
		}
		
		return {};
	}
	
	// 获取快递100 对应的快递公司编码
	getKd100Com(name) {
		switch (name) {
			case '圆通速递':
				return 'yuantong';
			case '韵达快递':
				return 'yunda';
			case '中通快递':
				return 'zhongtong';
			case '顺丰速运':
				return 'shunfeng';
			case '申通快递':
				return 'shentong';
			case '百世快递':
				return 'huitongkuaidi';
			case '邮政快递':
				return 'youzhengguonei';
			case '京东物流':
				return 'jd';
			case '众邮快递':
				return 'zhongyouex';
			case '德邦快递':
				return 'debangkuaidi';
			default:
				this.throw('快递公司未入驻');
		}
	}
	
}
