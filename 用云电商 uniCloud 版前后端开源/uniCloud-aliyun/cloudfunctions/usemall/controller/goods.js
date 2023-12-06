'use strict';

const uidObj = require('uni-id');
const {
	Controller
} = require('uni-cloud-router');
const dbcmd = uniCloud.database().command;

module.exports = class GoodsController extends Controller {

	// 详情
	async detail() {
		let response = {
			code: 1,
			goods: {},
			goods_detail: {},
			goods_skus: [],
			evaluate: [],
			evaluate_cnt: 0,
		};

		let start = new Date().getTime();
		const {
			goods_id,
			share_mid
		} = this.ctx.data;

		// 产品状态
		let goods_state = '';
		let goods = await this.db.collection('usemall-goods').doc(goods_id).get();

		if (!goods || goods.data.length <= 0) {
			response.msg = `当前产品不存在`;
			return response;
		}
		goods_state = goods.data[0].state;
		if (goods_state != '销售中') {
			switch (goods_state) {
				case '待审核':
					response.msg = `当前产品未开售`;
					break;
				case '已下架':
					response.msg = `当前产品已下架`;
					break;
				default:
					response.msg = `当前产品${goods_state}`;
					break;
			}
			return response;
		}

		let collected = 0;
		if (this.ctx.event.uniIdToken) {
			// 已登录，获取当前登录 uid
			const user = await uidObj.checkToken(this.ctx.event.uniIdToken);
			if (user.code == 0) {
				const collect = await this.db.collection('usemall-member-collect').where({
					create_uid: user.uid,
					goods: goods_id
				}).get();
				// 是否已收藏
				if (collect && collect.data.length > 0 && collect.data[0].state == '已收藏') {
					collected = 1;
				}

				// 记录足迹（异步记录，提高响应时间）
				let obj_id = user.uid + goods_id;
				this.db.collection('usemall-goods-history').doc(obj_id).update({
					visit_cnt: this.db.command.inc(1),
					version: this.db.command.inc(1),
					state: goods_state,
					last_modify_uid: user.uid,
					last_modify_time: new Date().getTime()
				}).then(res => {
					if (res && res.updated <= 0) {
						this.db.collection('usemall-goods-history').doc(obj_id).set({
							goods: goods_id,
							sort: 0,
							visit_cnt: 1,
							version: 1,
							state: goods_state,
							create_uid: user.uid,
							create_time: new Date().getTime(),
							last_modify_time: new Date().getTime()
						});
					}
				});
			}
		}

		Object.assign(response.goods, {
			collected
		}, goods.data[0]);

		const detail = await this.db.collection('usemall-goods-detail')
			.where({
				goods_id
			})
			.get();
		const sku = await this.db.collection('usemall-goods-sku')
			.where({
				goods_id
			})
			.get();
		const evaluate = await this.db.collection('usemall-goods-comment')
			.where({
				goods_id: goods_id,
				state: '显示'
			})
			.limit(3)
			.orderBy('create_time', 'desc')
			.get();
		const evaluateCountRes = await this.db.collection('usemall-goods-comment').where({
			goods_id: goods_id,
			state: '显示'
		}).count();
		if (evaluateCountRes && evaluateCountRes.total) {
			response.evaluate_cnt = evaluateCountRes.total;
			response.evaluate = evaluate.data;
		}
		
		if (sku && sku.data) {
			response.goods_skus = sku.data;
		}

		if (detail.data && detail.data.length === 1) {
			response.goods_detail = detail.data[0];
		}

		let end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
	}

	// 列表
	async list() {
		let response = {
			code: 1,
			goods: []
		};

		let start = new Date().getTime();
		// 请求参数
		const req = this.ctx.data;
		let {
			cid,
			sid,
			keyword,
			limited,
			hot
		} = req;

		if (keyword) keyword = keyword.trim();

		let uid = '';
		if (this.ctx.event.uniIdToken) {
			// 已登录，获取当前登录 uid
			const user = await uidObj.checkToken(this.ctx.event.uniIdToken);
			if (user.code == 0) {
				uid = user.uid;
			}
		}

		if (sid) {
			// 通过热门搜索
			const hot = await this.db.collection('usemall-search-hot').doc(sid).get();
			if (hot && hot.data.length > 0) {
				keyword = hot.data[0].keyword;
				// 修改搜索记录次数
				await this.db.collection('usemall-search-hot').doc(sid).update({
					last_modify_time: new Date().getTime(),
					last_modify_uid: uid,

					version: this.db.command.inc(1),
					search_cnt: this.db.command.inc(1)
				});
			}
		}

		if (keyword && uid) {
			// 记录搜索历史			
			this.db.collection('usemall-search-history').where({
				create_uid: uid,
				keyword: keyword
			}).update({
				search_cnt: this.db.command.inc(1),
				version: this.db.command.inc(1),
				last_modify_uid: uid,
				last_modify_time: new Date().getTime()
			}).then(res => {
				if (res && res.updated <= 0) {
					this.db.collection('usemall-search-history').add({
						keyword,
						search_cnt: 1,
						version: 1,
						create_uid: uid,
						create_time: new Date().getTime(),
						last_modify_uid: uid,
						last_modify_time: new Date().getTime()
					});
				}
			});
		}
		
		let whereObj = { state: '销售中' };
		if (keyword) whereObj.name = new RegExp(keyword);
		if (limited == 1) whereObj.limited = 1;
		if (hot == 1) whereObj.hot = 1;
		if (cid) whereObj.cids = cid;

		const goods = await this.db.collection('usemall-goods')
			.where(whereObj)
			.orderBy(req.sidx, req.sord)
			.skip((req.page - 1) * req.rows)
			.limit(req.rows)
			.get();

		response.goods = goods.data;

		let end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
	}
	// 加入购物车
	async addcart() {
		let start = new Date().getTime();
		let response = {
			code: 1
		};
		let uid = '';
		if (this.ctx.event.uniIdToken) {
			// 已登录，获取当前登录 uid
			const user = await uidObj.checkToken(this.ctx.event.uniIdToken);
			if (user.code == 0) {
				uid = user.uid;
			}
		}
		if (!uid) {
			response.msg = '当前未登录'
			return response;
		}
		// 请求参数
		const req = this.ctx.data;
		let {
			goods_id,
			goods_num,
			goods_sku
		} = this.ctx.data
		let obj_id = uid + goods_id + (goods_sku || '');
		let cart = await this.db.collection('usemall-goods-cart').doc(obj_id).update({
			goods_num: this.db.command.inc(goods_num),
			version: this.db.command.inc(1),
			last_modify_uid: uid,
			last_modify_time: new Date().getTime()
		});
		if (cart && cart.updated <= 0) {
			cart = await this.db.collection('usemall-goods-cart').doc(obj_id).set({
				goods: goods_id,
				goods_num,
				goods_sku,
				version: 1,
				create_uid: uid,
				create_time: new Date().getTime(),
				last_modify_time: new Date().getTime()
			});
		}


		let end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.cart = cart;
		response.code = 0;
		response.msg = `加入成功`;
		return response;

	}
	// 购买商品详情
	async detail2order() {
		let start = new Date().getTime();
		let response = {
			code: 1
		};
		let uid = '';
		if (this.ctx.event.uniIdToken) {
			// 已登录，获取当前登录 uid
			const user = await uidObj.checkToken(this.ctx.event.uniIdToken);
			if (user.code == 0) {
				uid = user.uid;
			}
		}
		if (!uid) {
			response.msg = '当前未登录'
			return response;
		}
		// 请求参数
		const req = this.ctx.data;
		let {
			goods_id,
			cart_ids,
			goods_sku_id
		} = this.ctx.data
		let goods = [];
		let goodsData = {};

		let goodsRes = {};
		let skuRes = {};

		if (goods_id) {
			// 从商品详情页下单
			goodsRes = await this.db.collection('usemall-goods').doc(goods_id).get();
			console.log('goodsRes', goodsRes);
			if (!(goodsRes && goodsRes.data.length == 1)) {
				response.msg = '当前下单商品不存在';
				return response;
			}
			goodsData = goodsRes.data[0];
			let goodsState = goodsData.state;
			if (goodsState != '销售中') {
				switch (goodsState) {
					case '待审核':
						response.msg = `当前产品未开售`;
						break;
					case '已下架':
					default:
						response.msg = `当前产品${goodsState}`;
						break;
				}
				return response;
			}

			// 默认下单数量1
			goodsData.goods_num = 1;

			let goods_sku = {};
			if (goods_sku_id) {
				// 商品存在 sku
				skuRes = await this.db.collection('usemall-goods-sku').doc(goods_sku_id).get();
				if (skuRes && skuRes.data.length === 1) {
					goods_sku = skuRes.data[0];
				}
			}
			goods.push({
				goods: goodsData,
				goods_sku: goods_sku
			});
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
			let goodsIds = goodsCarts.map(x => x.goods);
			let goodsSkuIds = goodsCarts.map(x => x.goods_sku);

			goodsRes = await this.db.collection('usemall-goods').where({
				_id: this.db.command.in(goodsIds)
			}).get();
			if (!(goodsRes && goodsRes.data.length > 0)) {
				response.msg = '当前购物车商品不存在';
				return response;
			}
			let goodsDatas = goodsRes.data;
			let goodsSkus = [];
			skuRes = await this.db.collection('usemall-goods-sku').where({
				goods_sku: this.db.command.in(goodsSkuIds)
			}).get();
			if (skuRes && skuRes.data.length > 0) {
				goodsSkus = skuRes.data;
			}

			goodsCarts.forEach(x => {
				goodsData = goodsDatas.find(g => g._id == x.goods);
				// 购物车商品数量
				goodsData.goods_num = x.goods_num;
				goods.push({
					goods: goodsData,
					goods_sku: goodsSkus.find(g => g.goods_sku == x.goods_sku),
					cart: x
				});
			});
		}


		let end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.datas = goods;
		response.code = 0;
		response.msg = `获取成功`;
		return response;
	}
}
