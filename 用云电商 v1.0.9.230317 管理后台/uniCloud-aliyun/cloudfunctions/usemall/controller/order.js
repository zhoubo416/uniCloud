'use strict';

const uidObj = require('uni-id');
const uidPay = require('uni-pay');
const {
	Controller
} = require('uni-cloud-router');
const dbcmd = uniCloud.database().command;

module.exports = class OrderController extends Controller {

	// 创建订单
	async create() {
		// 判断是否登录
		// 判断收货人是否存在
		// 判断下单来源 (1.从商品详情下单 2.从购物车下单)
		// 	判断商品是否存在
		// 	判断商品状态是否为 销售中
		// 	判断商品库存是否满足下单数
		// 	判断购物车商品是否存在
		// 	判断购物车商品状态是否为 销售中
		// 	判断购物车商品库存是否满足下单数
		// 写入订单数据
		// 根据订单设置,如果为下单成功后扣减库存,则扣减对应商品扣除
		// 写入订单详情数据
		// 写入订单支付数据
		// 写入订单日志

		let response = {
			code: 1,
			goods: {},
			goods_detail: {},
			goods_skus: []
		};

		const start = new Date().getTime();

		let uid = '';
		let user = {
			openid: '',
			name: '',
			headimg: '',
			mobile: ''
		};
		if (this.ctx.event.uniIdToken) {
			// 已登录，获取当前登录 uid
			const userRes = await uidObj.checkToken(this.ctx.event.uniIdToken);
			if (userRes.code == 0) {
				uid = userRes.uid;
				if (userRes.userInfo.wx_openid) {
					user.openid = userRes.userInfo.wx_openid['mp-weixin'];
				}
				user.name = userRes.userInfo.username || userRes.userInfo.nickname;
				user.headimg = userRes.userInfo.avatar;
				user.mobile = userRes.userInfo.mobile || '';
			}
		}
		if (!uid) {
			response.msg = '当前未登录'
			return response;
		}

		const {
			cart_ids,
			goods_id,
			goods_num,
			goods_sku_id,
			addr_id,
			order_from,
			order_desc
		} = this.ctx.data;

		const addrRes = await this.db.collection('usemall-member-address').doc(addr_id).get();
		if (!(addrRes && addrRes.data.length === 1)) {
			response.msg = '请选择收货人';
			return response;
		}
		const addr = addrRes.data[0];
		if (addr.create_uid != uid) {
			response.msg = '收货人与当前账号不一致';
			return response;
		}

		let goods = [];
		let goods_sku = {};

		// 购物车 ID 集合
		let goodsCartIds = [];
		if (goods_id) {
			// 从商品详情页下单
			let goodsRes = await this.db.collection('usemall-goods').doc(goods_id).get();
			if (!(goodsRes && goodsRes.data.length == 1)) {
				response.msg = '当前下单商品不存在';
				return response;
			}
			let goodsData = goodsRes.data[0];
			let goodsState = goodsData.state;
			if (goodsState != '销售中') {
				switch (goodsState) {
					case '待审核':
						response.msg = `当前商品未开售`;
						break;
					case '已下架':
					default:
						response.msg = `当前商品${goodsState}`;
						break;
				}
				return response;
			}

			// 下单数量
			goodsData.goods_num = goods_num || 1;

			if (goods_sku_id) {
				// 商品存在 sku
				let skuRes = await this.db.collection('usemall-goods-sku').doc(goods_sku_id).get();
				if (skuRes && skuRes.data.length == 1) {
					goods_sku = skuRes.data[0];
					// 存在 sku 修改商品价格、库存
					goodsData.stock_num = goods_sku.stock_num;
					goodsData.price = goods_sku.price;
					goodsData.market_price = goods_sku.market_price;
					goodsData.sku = goods_sku.goods_sku;
					goodsData.sku_id = goods_sku._id;
					goodsData.sku_name = goods_sku.spec;
					goodsData.sku_img = goods_sku.img;
					goodsData.sku_price = goods_sku.price;
					goodsData.sku_market_price = goods_sku.market_price;
				}
			}
			goods.push(goodsData);

			// 判断库存是否满足下单数
			if (goodsData.stock_num < goods_num) {
				response.msg = `当前商品库存数不足`;
				return response;
			}

		} else if (cart_ids && cart_ids.length > 0) {
			// 从购物车下单
			let goodsCartRes = await this.db.collection('usemall-goods-cart').where({
				create_uid: uid,
				_id: this.db.command.in(cart_ids)
			}).get();
			if (!(goodsCartRes && goodsCartRes.data.length > 0)) {
				response.msg = '当前购物车不存在';
				return response;
			}
			let goodsCarts = goodsCartRes.data;
			goodsCartIds = goodsCarts.map(x => x._id);
			let goodsIds = goodsCarts.map(x => x.goods);
			let goodsSkuIds = goodsCarts.map(x => x.goods_sku);

			let goodsRes = await this.db.collection('usemall-goods').where({
				_id: this.db.command.in(goodsIds),
				state: '销售中'
			}).get();
			if (!(goodsRes && goodsRes.data.length > 0)) {
				response.msg = '当前购物车商品不存在';
				return response;
			}
			let goodsData = {};
			let goodsDatas = goodsRes.data;
			let goodsSkus = [];
			let skuRes = await this.db.collection('usemall-goods-sku').where({
				goods_sku: this.db.command.in(goodsSkuIds)
			}).get();
			if (skuRes && skuRes.data.length > 0) {
				goodsSkus = skuRes.data;
			}

			goodsCarts.forEach(x => {
				goodsData = goodsDatas.find(g => g._id == x.goods);
				// 购物车商品数量
				goodsData.goods_num = x.goods_num;

				goods_sku = goodsSkus.find(g => g.goods_sku == x.goods_sku && g.goods_id == x.goods);
				if (goods_sku && goods_sku.goods_sku) {
					goodsData.stock_num = goods_sku.stock_num;
					goodsData.price = goods_sku.price;
					goodsData.market_price = goods_sku.market_price;
					goodsData.sku = goods_sku.goods_sku;
					goodsData.sku_id = goods_sku._id;
					goodsData.sku_name = goods_sku.spec;
					goodsData.sku_img = goods_sku.img;
					goodsData.sku_price = goods_sku.price;
					goodsData.sku_market_price = goods_sku.market_price;
				}
				// 下单商品
				goods.push(goodsData);
			});

		}

		if (goods.length <= 0) {
			response.msg = `下单商品不存在`;
			return response;
		}

		let order = {
			order_id: new Date().getTime() + (Math.round(Math.random() * 1000000) + '').padStart(6, '0'),
			order_member_openid: user.openid,
			order_member_name: user.name,
			order_member_headimg: user.headimg,
			order_member_mobile: user.mobile,
			order_consignee: addr.consignee,
			order_consignee_tel: addr.mobile,
			order_consignee_addr: addr.address,
			order_consignee_addr_detail: addr.addr_detail,
			order_consignee_province_name: addr.province_name,
			order_consignee_city_name: addr.city_name,
			order_consignee_district_name: addr.area_name,
			order_express: '',
			order_express_no: '',
			order_pay_state: '待付款',
			order_total_money: 0,
			order_total_cnt: goods.length,
			order_goods_cnt: 0,
			order_sku_cnt: 0,
			order_discount: 0,
			order_tax: 0,
			order_actural_paid: 0,
			order_from: order_from,
			order_type: '发货订单',
			order_way: '小程序',
			order_info: '',
			remark: order_desc,
			state: '待付款',
			is_delete: 0,
			create_uid: uid,
			create_time: new Date().getTime()
		};
		let order_details = [];
		goods.forEach(x => {
			order_details.push({
				order_id: order.order_id,
				goods_id: x._id,
				goods_name: x.name,
				goods_name_pw: x.name_pw,
				goods_img: x.img,
				goods_num: x.goods_num,
				goods_price: x.price,
				goods_market_price: x.market_price,
				goods_type: x.goods_type || '',
				goods_sku: x.goods_sku || '',
				goods_sku_name: x.sku_name || '',
				goods_sku_img: x.sku_img || x.img,
				goods_sku_id: x.sku_id || '',
				is_delete: 0,
				create_uid: uid,
				create_time: new Date().getTime()
			});

			order.order_sku_cnt += x.goods_num;
			order.order_goods_cnt += x.goods_num;
			order.order_total_money += x.price * x.goods_num;
			order.order_actural_paid += x.price * x.goods_num;
			// 订单支付标题
			order.order_info = x.name;
		});
		
		// todo: 开启事务
		
		try	{
			const orderRes = await this.db.collection('usemall-order').add(order);
			console.log('orderRes', orderRes);
			
			if (!(orderRes && orderRes.id)) {
				response.msg = `订单创建失败`;
				uniCloud.logger.error(`订单创建失败`, order);
				console.log(`订单创建失败`, order);
				return response;
			}

			let order_log = {
				order_id: order.order_id,
				log_type: '创建订单',
				current_state: '待付款',
				prev_state: '待付款',
				ip: this.ctx.context.CLIENTIP,
				is_delete: 0,
				create_uid: uid,
				create_time: new Date().getTime()
			};
			
			await this.db.collection('usemall-order-detail').add(order_details);
			this.db.collection('usemall-order-log').add(order_log);

			// 删除购物车数据
			if (goodsCartIds.length > 0) {
				await this.db.collection('usemall-goods-cart').where({
					_id: this.db.command.in(goodsCartIds)
				}).remove();
			}
			
			response.code = 0;
			response.datas = {
				order_id: order.order_id,
				money: order.order_actural_paid
			};
			
		} catch (e) { 
			
			response.code = 500;
			response.msg = e;
			
			// 记录日志
			uniCloud.logger.error(e);
			console.log('order/create catch', e);
		}
		
		const end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.msg = `耗时：${end - start}ms`;
		
		return response;
	}

	// 订单详情
	async detail() {
		let response = {
			code: 1,
			order: {},
			order_detail: []
		};

		const start = new Date().getTime();
		const {
			order_id
		} = this.ctx.data;
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
		const order = this.db.collection('usemall-order').where({
			is_delete: 0,
			order_id: order_id,
			create_uid: uid
		}).get();
		const order_detail = this.db.collection('usemall-order-detail').where({
			order_id: order_id
		}).get();
		const datas = await Promise.all([order, order_detail]);

		response.order = datas[0] && datas[0].data && datas[0].data[0];
		response.order_detail = datas[1] && datas[1].data;

		// 返回待付款订单剩余支付时间
		if (response.order.state == '待付款') {
			// 默认1小时
			const unpay_overdue_minute = 60 * 60;
			response.time_remaining = parseInt(unpay_overdue_minute - (new Date().getTime() - response.order
				.create_time) / 1000);
			if (response.time_remaining <= 0) {
				// 自动取消订单
				let orderRes = await this.db.collection('usemall-order')
					.doc(response.order._id)
					.update({
						state: '已取消',

						last_modify_time: new Date().getTime(),
						last_modify_uid: uid,
					})

				if (orderRes && orderRes.updated == 1) {
					response.order.state = '已取消'
					let order_log = {
						order_id: order_id,
						log_type: '取消订单',
						current_state: '已取消',
						prev_state: '待付款',
						ip: this.ctx.context.CLIENTIP,
						is_delete: 0,
						create_uid: uid,
						create_time: new Date().getTime()
					};
					this.db.collection('usemall-order-log').add(order_log);
				}

			}
		}

		const end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
	}

	// 订单列表
	async list() {
		let response = {
			code: 1,
			order: []
		};

		const start = new Date().getTime();
		const {
			page,
			rows,
			state
		} = this.ctx.data;
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
		let where_obj = {
			is_delete: 0,
			create_uid: uid
		};
		if (state && state != '全部') {
			where_obj.state = state;
		}

		let orderRes = await this.db.collection('usemall-order')
			.where(where_obj)
			.orderBy('create_time', 'desc')
			.skip((page - 1) * rows)
			.limit(rows)
			.get();

		let datas = [];
		const ids = orderRes.data.map(x => x.order_id);

		let orderDetailsRes = await this.db.collection('usemall-order-detail').where({
			order_id: this.db.command.in(ids)
		}).get();

		orderRes.data.forEach(x => {
			datas.push({
				order: x,
				order_detail: orderDetailsRes.data.filter(d => d.order_id == x.order_id)
			})
		});
		response.datas = datas;

		const end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
	}
	// 取消订单
	async cancel() {
		let response = {
			code: 1,
		};
		const start = new Date().getTime();
		const {
			order_id,
			state
		} = this.ctx.data;
		// console.log('this.ctx.data', this.ctx.data);
		let uid = '';
		if (this.ctx.event.uniIdToken) {
			// 已登录，获取当前登录 uid
			const userRes = await uidObj.checkToken(this.ctx.event.uniIdToken);
			if (userRes.code == 0) {
				uid = userRes.uid;
			}
		}
		let where_obj = {
			create_uid: uid,
			order_id: order_id
		};

		let orderRes = await this.db.collection('usemall-order')
			.where(where_obj)
			.update({
				state: state,

				last_modify_time: new Date().getTime(),
				last_modify_uid: uid,
			})

		if (orderRes && orderRes.updated == 1) {
			let order_log = {
				order_id: order_id,
				log_type: '取消订单',
				current_state: state,
				prev_state: '待付款',
				ip: this.ctx.context.CLIENTIP,
				is_delete: 0,
				create_uid: uid,
				create_time: new Date().getTime()
			};
			this.db.collection('usemall-order-log').add(order_log);
		}

		response.datas = orderRes;

		const end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
	}
	
	// 已收货
	async received() {
		let response = {
			code: 1,
		};
		const start = new Date().getTime();
		const {
			order_id,
			state
		} = this.ctx.data;
		// console.log('this.ctx.data', this.ctx.data);
		let uid = '';
		if (this.ctx.event.uniIdToken) {
			// 已登录，获取当前登录 uid
			const userRes = await uidObj.checkToken(this.ctx.event.uniIdToken);
			if (userRes.code == 0) {
				uid = userRes.uid;
			}
		}
		let where_obj = {
			create_uid: uid,
			order_id: order_id
		};
	
		let orderRes = await this.db.collection('usemall-order')
			.where(where_obj)
			.update({
				state: state,
	
				last_modify_time: new Date().getTime(),
				last_modify_uid: uid,
			})
	
		if (orderRes && orderRes.updated == 1) {
			let order_log = {
				order_id: order_id,
				log_type: '已收货',
				current_state: state,
				prev_state: '待收货',
				ip: this.ctx.context.CLIENTIP,
				is_delete: 0,
				create_uid: uid,
				create_time: new Date().getTime()
			};
			this.db.collection('usemall-order-log').add(order_log);
		}
	
		response.datas = orderRes;
	
		const end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
	}
	
	// 删除订单
	async deleted() {
		let response = {
			code: 1,
		};
		const state = '已删除'
		const start = new Date().getTime();
		const {
			order_id,
		} = this.ctx.data;
		let uid = '';
		if (this.ctx.event.uniIdToken) {
			// 已登录，获取当前登录 uid
			const userRes = await uidObj.checkToken(this.ctx.event.uniIdToken);
			if (userRes.code == 0) {
				uid = userRes.uid;
			}
		}
		let where_obj = {
			create_uid: uid,
			order_id: order_id,
			state: '已取消'
		};

		let orderRes = await this.db.collection('usemall-order')
			.where(where_obj)
			.update({
				state: state,

				is_delete: 1,
				last_modify_time: new Date().getTime(),
				last_modify_uid: uid,
			})

		if (orderRes && orderRes.updated == 1) {
			let order_log = {
				order_id: order_id,
				log_type: '删除订单',
				current_state: state,
				prev_state: '已取消',
				ip: this.ctx.context.CLIENTIP,
				is_delete: 0,
				create_uid: uid,
				create_time: new Date().getTime()
			};
			this.db.collection('usemall-order-log').add(order_log);
		}

		response.datas = orderRes;

		const end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
	}
	// 订单评价
	async evaluate() {
		let response = {
			code: 1
		};

		const start = new Date().getTime();
		const {
			order_id,
			review_cnt,
			review_imgs,
			review_type,
			review_content,
			review_anontmity
		} = this.ctx.data

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
		let where_obj = {
			is_delete: 0,
			order_id: order_id,
			state: '待评价',
			create_uid: uid,
		};

		let orderRes = await this.db.collection('usemall-order')
			.where(where_obj)
			.get();

		if (orderRes.data && orderRes.data.length == 1) {
			const orderDetailRes = await this.db.collection('usemall-order-detail').where({
				order_id: order_id
			}).get();
			const order = orderRes.data[0];

			let order_log = {
				order_id: order_id,
				log_type: '评价订单',
				current_state: '已完成',
				prev_state: order.state,
				ip: this.ctx.context.CLIENTIP,
				is_delete: 0,
				create_uid: uid,
				create_time: new Date().getTime()
			};
			this.db.collection('usemall-order-log').add(order_log);
			// 修改订单状态 已完成
			await this.db.collection('usemall-order').doc(order._id).update({
				state: '已完成',

				last_modify_time: new Date().getTime(),
				last_modify_uid: uid
			});

			if (orderDetailRes.data) {
				for (let i = 0; i < orderDetailRes.data.length; i++) {
					let x = orderDetailRes.data[i];
					await this.db.collection('usemall-goods-comment').add({
						goods_id: x.goods_id,
						goods_sku: x.goods_sku,
						goods_type: x.goods_type,
						member_name: order.order_member_name,
						member_headimg: order.order_member_headimg,
						order_id: order_id,
						review_type: review_type,
						review_cnt: review_cnt,
						review_content: review_content,
						review_imgs: review_imgs,
						review_anontmity: review_anontmity,
						remark: "",
						state: "显示",
						version: 1,
						is_delete: 0,
						create_uid: uid,
						create_time: new Date().getTime()
					});
				}
			}
		}

		const end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.time = `耗时：${end - start}ms`;
		response.msg = '提交成功';
		return response;
	}
	// 申请退款
	async refund() {
		let response = {
			code: 1
		};

		const start = new Date().getTime();
		const {
			order_id,
			refund_money,
			goods_state,
			reason,
			desc,
			imgs
		} = this.ctx.data

		if (!reason.trim()) {
			response.msg = '请输入退款原因';
			return response;
		}
		if (!order_id.trim()) {
			response.msg = '申请退款订单不存在';
			return response;
		}

		let uid = '';
		let user = {
			openid: '',
			name: '',
			headimg: '',
			mobile: ''
		};
		if (this.ctx.event.uniIdToken) {
			// 已登录，获取当前登录 uid
			const userRes = await uidObj.checkToken(this.ctx.event.uniIdToken);
			if (userRes.code == 0) {
				uid = userRes.uid;
				if (userRes.userInfo.wx_openid) {
					user.openid = userRes.userInfo.wx_openid['mp-weixin'];
				}
				user.name = userRes.userInfo.username || userRes.userInfo.nickname;
				user.headimg = userRes.userInfo.avatar;
				user.mobile = userRes.userInfo.mobile || '';
			}
		}
		if (!uid) {
			response.msg = '当前未登录'
			return response;
		}

		let where_obj = {
			is_delete: 0,
			order_id: order_id,
			state: '待发货',
			create_uid: uid,
		};

		let orderRes = await this.db.collection('usemall-order')
			.where(where_obj)
			.get();

		if (!(orderRes.data && orderRes.data.length == 1)) {
			response.msg = '申请退款订单号不存在';
			return response;
		}

		const order = orderRes.data[0];

		let order_log = {
			order_id: order_id,
			log_type: '申请退款',
			current_state: '售后中',
			prev_state: order.state,
			ip: this.ctx.context.CLIENTIP,
			is_delete: 0,
			create_uid: uid,
			create_time: new Date().getTime(),
			create_uname: user.name
		};
		
		// todo 开启事务
		
		// 写入订单日志
		await this.db.collection('usemall-order-log').add(order_log);
		// 修改订单申请退款数据
		await this.db.collection('usemall-order').doc(order._id).update({
			order_refund_state: '处理中',
			order_refund_reason: reason,
			order_refund_desc: desc,
			
			state: '售后中',
			
			last_modify_time: new Date().getTime(),
			last_modify_uid: uid,
			last_modify_uname: user.name
		});
		// 写入申请退款数据
		await this.db.collection('usemall-order-refund').add({
			order_id,
			refund_money,
			member_guid: uid,
			member_name: user.name,
			member_headimg: user.headimg,
			goods_state,
			reason,
			desc,
			imgs,
			remark: '申请退款',
			version: 1,
			state: '处理中',
			is_delete: 0,
			create_uid: uid,
			create_time: new Date().getTime(),
			create_uname: user.name
		});

		const end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.time = `耗时：${end - start}ms`;
		response.msg = '申请成功';
		return response;
	}

	// 支付下单
	async pay() {
		let response = {
			code: 1,
		};

		const start = new Date().getTime();
		const {
			code,
			order_id,
			pay_way,
			pay_original,
			pay_trade_type,
		} = this.ctx.data;

		// 1. 查询当前订单是否存在，是否已支付待核实状态
		// 2. 查询当前订单支付状态是否为已付款
		// 3. 判断下单商品的状态与库存
		const { uid, order, orderDetails, pay } = await this.payValidate(order_id);
		
		// 4. 根据支付方式获取对应 code 的 openid 
		// 5. 根据支付方式获取对应的下单数据
		let openid = '';
		
		let payres = '';
		let paypreid = '';
		let orderInfo = {};
		
		switch (pay_way){
			case '微信支付':
				// 初始化微信支付
				const uniWxpayIns = uidPay.initWeixin(uidObj.config['mp-weixin']['pay']);
				let wxpayOrderInfo = {};
				switch (pay_trade_type) {
					case 'MWEB':	// H5
					case 'NATIVE':	// 二维码
						// 二维码有效期 剩余时间
						let time_remaining = 60 * 60 * 1.5;
						// 如果存在交易类型为 NATIVE 待付款的记录
						// 则获取未过期的二维码数据返回
						if (pay && pay._id && pay.pay_state == '待付款' && pay_trade_type == 'NATIVE') {
							try {
								const payresObj = JSON.parse(pay.pay_res);
								if (payresObj && payresObj.codeUrl) {
									const ts = (new Date().getTime() - pay.create_time) / 1000;
									
									// 判断二维码是否已过期
									if (ts < time_remaining) {
										orderInfo.order_id = order_id;
										orderInfo.codeUrl = payresObj.codeUrl;
										orderInfo.time_remaining = time_remaining - ts;
										
										response.datas = orderInfo;
										response.code = 0;
										return response;
									}
								}
							} catch(e) {
								//TODO handle the exception
								uniCloud.logger.error('order.pay() 微信支付 catch');
								uniCloud.logger.error(e);
							}
						}
						
						// 获取下单数据
						wxpayOrderInfo = await uniWxpayIns.getOrderInfo({
							body: '用云电商',
							outTradeNo: order.order_id,
							totalFee: order.order_actural_paid,
							tradeType: pay_trade_type,
							notifyUrl: uidObj.config['mp-weixin']['notify-url']
						});
						// 剩余时间
						wxpayOrderInfo.time_remaining = time_remaining;
						break;
					default: 
						const wxres = await uidObj.code2SessionWeixin(code);
						if (!(wxres && wxres.code == 0)) {
							this.throw(wxres.message || '请重新授权登录后支付');
						}
						
						// 用户 openid
						openid = wxres.openid;
						
						wxpayOrderInfo = await uniWxpayIns.getOrderInfo({
							openid: openid,
							body: '用云电商',
							outTradeNo: order.order_id,
							totalFee: order.order_actural_paid,
							notifyUrl: uidObj.config['mp-weixin']['notify-url']
						});
						break;
				}
				// 下单支付参数
				orderInfo = wxpayOrderInfo;
				
				paypreid = wxpayOrderInfo.prepayId;
				payres = JSON.stringify(wxpayOrderInfo);
				break;
			case '支付宝':
				const fs  = require('fs');
				const path = require('path');
				const alipayConfig = uidObj.config['mp-alipay']['pay'];
				
				const alipayOptions = {
					...alipayConfig
				};
				
				// 初始化支付宝支付
				const uniAlipayIns = uidPay.initAlipay(alipayOptions);
				const alires = await uidObj.code2SessionAlipay(code);
				if (!(alires && alires.code == 0)) {
					this.throw(alires.message || '请重新授权登录后支付');
				}
				
				// 用户openid
				openid = alires.openid;
				// 获取支付参数，注意支付宝返回的是 trade_no 字符串
				let alipayOrderInfo = await uniAlipayIns.getOrderInfo({
					openid: openid,
					subject: '用云电商',
					outTradeNo: order.order_id,
					totalFee: order.order_actural_paid,
					notifyUrl: uidObj.config['mp-alipay']['notify-url']
				});
				
				console.log("alipayOrderInfo: ",alipayOrderInfo);
				
				// 下单支付参数
				orderInfo = { trade_no: alipayOrderInfo };
				
				paypreid = alipayOrderInfo.prepayId;
				payres = JSON.stringify(alipayOrderInfo);
				break;
			case '百度钱包': break;
			case 'QQ钱包': break;
			case '头条支付': break;
			case '余额支付': break;
			default:
				break;
		}
		
		if (pay && pay._id) { 
			// 修改 usemall-order-pay 数据
			await this.db.collection('usemall-order-pay').doc(pay._id).update({
				pay_way: pay_way,
				pay_original: pay_original,
				pay_trade_type: pay_trade_type,
				
				pay_openid: openid,
				pay_preid: paypreid,
				pay_res: payres,
				version: this.db.command.inc(1)
			});
		} else {
			let order_pay = {
				order_id: order_id,
				pay_openid: openid,
				pay_way: pay_way,
				pay_original: pay_original,
				pay_trade_type: pay_trade_type,
				pay_preid: paypreid,
				pay_res: payres,
				pay_state: '待付款',
				version: 1,
				is_delete: 0,
				create_uid: uid,
				create_time: new Date().getTime()
			};
			await this.db.collection('usemall-order-pay').add(order_pay);
		}
		
		// 返回下单数据
		orderInfo.order_id = order_id;
		response.datas = orderInfo;

		const end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
	}
	
	// 支付下单验证
	async payValidate(order_id) {
		// 1. 查询当前订单是否存在，是否已支付待核实状态
		// 2. 查询当前订单支付状态是否为已付款
		// 3. 判断下单商品的状态与库存
		
		if (!order_id) {
			this.throw('订单编号不存在');
		}
		
		let uid = '';
		if (this.ctx.event.uniIdToken) {
			// 已登录，获取当前登录 uid
			const userRes = await uidObj.checkToken(this.ctx.event.uniIdToken);
			if (userRes.code == 0) {
				uid = userRes.uid;
			}
		}
		if (!uid) {
			this.throw('当前未登录');
		
		}
		// 1. 查询当前订单是否存在，是否已支付待核实状态
		const orderRes = await this.db.collection('usemall-order')
			.where({
				order_id
			})
			.field({
				order_id: true,
				order_actural_paid: true,
				state: true,
				order_pay_state: true,
				create_uid: true,
				create_time: true
			})
			.get();
		if (!(orderRes && orderRes.data.length == 1)) {
			this.throw('订单不存在');
		}
		
		const order = orderRes.data[0];
		if (order.create_uid != uid) {
			this.throw('订单与当前账号不一致');
		}
		if (order.state != '待付款') {
			this.throw(`订单[${order_id}]状态[${order.state}]`);
		}
		if (order.order_pay_state == '待核实') {
			this.throw(`订单状态为已支付待核实，请勿需再次付款`);
		}
		
		// 订单详情
		const orderDetailRes = await this.db.collection('usemall-order-detail')
			.where({
				order_id
			})
			.field({
				goods_id: true,
				order_id: true,
				goods_num: true,
				goods_sku: true,
				goods_sku_id: true,
			})
			.get();
		if (!(orderDetailRes && orderDetailRes.data.length > 0)) {
			this.throw('订单详情不存在');
		}
		const orderDetails = orderDetailRes.data;
		
		// 2. 查询当前订单支付状态是否为已付款
		const payRes = await this.db.collection('usemall-order-pay')
			.where({
				order_id
			})
			.field({
				order_id: true,
				pay_state: true, 
				pay_res: true,
				create_time: true
			})
			.get();
		
		let pay = { };
		if (payRes && payRes.data.length > 0) {
			pay = payRes.data[0];
			if (pay.pay_state == '已付款') {
				this.throw(`订单[${order_id}]已付款，无需重新支付`);
			}
		}

		const goodsRes = await this.db.collection('usemall-goods')
			.where({ _id: this.db.command.in(orderDetails.map(x => x.goods_id)) })
			.field({
				stock_num: true,
				name: true,
				state: true
			})
			.get();
		if (!(goodsRes && goodsRes.data.length > 0)) {
			this.throw('下单商品不存在');
		}
		const goodsDatas = goodsRes.data;
		
		// 3. 判断下单商品的状态与库存
		orderDetails.forEach((x) => {
			let goods = goodsDatas.find(g => g._id == x.goods_id);
			if (!goods) {
				this.throw('下单商品已下架');
			}
			if (goods.state != '销售中') {
				this.throw(`下单商品[${goods.state}]`);
			}
			
			if (goods.stock_num <= 0) {
				this.throw(`商品库存不足`);
			}
			if (goods.stock_num < x.goods_num) {
				this.throw(`商品剩余库存 ${goods.stock_num}`);
			}
			
			// todo 判断SKU库存是否充足
		});
		
		return { uid, order, orderDetails, pay };
	}
	
	
	// 支付状态查询
	async paystate() {
		let response = {
			code: 1,
			msg: '支付状态查询失败'
		};
		
		const { order_id } = this.ctx.data;
		
		if (!order_id) {
			response.msg = '订单号不存在';
			return response;
		}
		
		// 查询订单支付状态
		const payRes = await this.db.collection('usemall-order-pay').where({ order_id }).get();
		if (!payRes || payRes.data.length !== 1) {
			response.msg = '支付单不存在';
			return response;
		}
		
		const payObj = payRes.data[0];
		if (payObj.pay_state == '已付款') {
			response.code = 0;
			response.datas = {
				pay_state: payObj.pay_state,
				order_id: payObj.order_id
			};
			return response;
		}
		
		// todo: 查询微信支付订单状态
		switch (payObj.pay_way) {
			case '微信支付':
				const uniWxpayIns = uidPay.initWeixin(uidObj.config['mp-weixin']['pay']);
				const uniWxpayRes = await uniWxpayIns.orderQuery({
				    outTradeNo: order_id,
				});
				
				response.code = 0;
				response.datas = {
					pay_state: payObj.pay_state,
					order_id: payObj.order_id,
					trade_state: uniWxpayRes.tradeState
				};
				return response;
			case '支付宝':
				const uniAlipayIns = uidPay.initWeixin(uidObj.config['mp-alipay']['pay']);
				const uniAlipayRes = await uniAlipayIns.orderQuery({
				    outTradeNo: order_id,
				});
				
				response.code = 0;
				response.datas = {
					pay_state: payObj.pay_state,
					order_id: payObj.order_id,
					trade_state: uniAlipayRes.tradeState
				};
				return response;
		}
		
		return response;
	}
	
	// 物流轨迹
	async express() {
		let response = {
			code: 1,
			msg: '物流轨迹查询失败'
		};
		const { order_id } = this.ctx.data;
		
		if (!order_id) {
			response.msg = '订单号不存在';
			return response;
		}
		
		// 查询订单数据
		const orderRes = await this.db.collection('usemall-order').where({ order_id }).field({
			order_id: true,
			order_express: true,
			order_express_no: true,
			order_express_datas: true
		}).get();
		
		if (!orderRes || orderRes.data.length !== 1) {
			response.msg = '订单不存在';
			return response;
		}
		
		const order = orderRes.data[0];
		
		// 存在有数据直接返回 express datas
		if (order.order_express_datas) {
			response.msg = '数据查询成功';
			response.code = 0;
			response.datas = order.order_express_datas;
			response.datas.company = order.order_express;
			
			return response;
		}
		
		if (!order.order_express_no) {
			response.msg = '快递单号不存在';
			
			return response;
		}
		
		// 调用快递100 实时快递查询接口
		const kd100Res = await this.service.express.kd100Query({
			"com": this.service.express.getKd100Com(order.order_express),
			"num": order.order_express_no,
		});
		response.datas = kd100Res;
		response.msg = response.datas.message;
		
		if (response.datas && response.datas.message == "ok")
		{
			response.code = 0;
			
			/**
			 * 快递单状态
				0	在途	快件处于运输过程中
				1	揽收	快件已由快递公司揽收
				2	疑难	快递100无法解析的状态，或者是需要人工介入的状态， 比方说收件人电话错误。
				3	签收	正常签收
				4	退签	货物退回发货人并签收
				5	派件	货物正在进行派件
				6	退回	货物正处于返回发货人的途中
				7	转投	货物转给其他快递公司邮寄
				10	待清关	货物等待清关
				11	清关中	货物正在清关流程中
				12	已清关	货物已完成清关流程
				13	清关异常	货物在清关过程中出现异常
				14	拒签	收件人明确拒收
			 */
			if (['3', '4', '14'].includes(response.datas.state)) {
				response.datas.company = order.order_express;
				// 签收 退签 拒签
				// 写入订单物流轨迹数据
				await this.db.collection('usemall-order').doc(order._id).update({
					order_express_datas: response.datas
				});
			}
		}
		
		return response;
	}
	
}
