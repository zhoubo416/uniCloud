'use strict';

const {
	Controller
} = require('uni-cloud-router');
const dbcmd = uniCloud.database().command;

module.exports = class GoodsController extends Controller {

	// 添加商品
	async add() {
		let response = {
			code: 1,
		};

		// 数据验证
		this.validate(this.ctx.data);

		let {
			goods,
			detail,
			skus
		} = this.ctx.data;
		console.log('this.ctx.data', this.ctx.data);
		console.log('this.ctx.auth', this.ctx.auth);

		// 处理商品详情前端显示UI样式
		detail.desc_mobile = detail.desc_mobile.replace(/style="max-width:100%;"/gi, '').replace(/<img src/gi, '<img style="max-width:100%;display:block;" src');

		// 是否填写商品分享设置
		goods.share_title = goods.share_title || goods.name;
		goods.share_img = goods.share_img || goods.img;
		goods.share_desc = goods.share_desc || goods.name_pw;

		// todo: 判断商品名称是否存在 


		// 商品默认值
		const goods_id = new Date().getTime() + (Math.round(Math.random() * 1000000) + '').padStart(6, '0');
		goods._id = goods_id;
		goods.stock_wh_num = goods.stock_num;
		goods.version = 1;
		goods.is_delete = 1;
		goods.create_time = new Date().getTime();
		goods.create_uid = this.ctx.auth.uid;
		goods.create_uname = this.ctx.auth.userInfo.username || this.ctx.auth.userInfo.nickname;
		// 写入商品数据
		const goodsRes = await this.db.collection('usemall-goods').add(goods);

		// 商品详情默认值
		detail.goods_id = goods_id;
		detail.version = 1;
		detail.is_delete = 1;
		detail.create_time = new Date().getTime();
		detail.create_uid = this.ctx.auth.uid;
		detail.create_uname = this.ctx.auth.userInfo.username || this.ctx.auth.userInfo.nickname;
		// 商品SKU默认值
		skus.forEach(x => {

			x.goods_id = goods_id;
			x.goods_sku = `${goods_id}_${x.spec_s}`;
			x.market_price = goods.market_price;
			x.stock_wh_num = x.stock_num;
			x.limit = goods.limit;
			x.img = goods.img;

			x.version = 1;
			x.is_delete = 1;
			x.create_time = new Date().getTime();
			x.create_uid = this.ctx.auth.uid;
			x.create_uname = this.ctx.auth.userInfo.username || this.ctx.auth.userInfo.nickname;
		});

		// 写入商品详情数据
		await this.db.collection('usemall-goods-detail').add(detail);
		if (skus.length > 0) {
			// 写入商品SKU数据
			await this.db.collection('usemall-goods-sku').add(skus);
		}
		
		response.code = 0;
		response.msg = '提交成功';

		return response;
	}
	// 验证请求数据
	validate(req) {
		if (!req) this.throw('请求参数不存在');
		if (!req.goods) this.throw('商品参数不存在');
		if (!req.detail) this.throw('商品详情参数不存在');

		if (!req.goods.name) this.throw('商品名称必填');
		if (!req.goods.cid) this.throw('请选择商品分类');
		if (req.goods.price <= 0) this.throw('商城价格不能小于0');
		if (!req.goods.sold_out_time) this.throw('请选择下架时间');
		if (!req.goods.img) this.throw('请上传商品主图');
	}

	// 获取商品数据
	async detail() {
		let response = {
			code: 1,
			goods: {},
			goods_detail: {},
			goods_sku: [],
		};

		let start = new Date().getTime();
		const {
			goods_id
		} = this.ctx.data;

		// 产品数据
		let goods = await this.db.collection('usemall-goods').doc(goods_id).get();

		if (!goods || goods.data.length <= 0) {
			response.msg = `当前产品不存在`;
			return response;
		}

		const detail = await this.db.collection('usemall-goods-detail')
			.where({
				goods_id: goods_id
			})
			.get();
		const skus = await this.db.collection('usemall-goods-sku')
			.where({
				goods_id: goods_id
			})
			.get();

		response.goods = goods.data[0];
		response.goods_detail = detail.data[0];
		response.goods_sku = skus.data;

		let end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
	}

	// 编辑商品
	async edit() {
		let response = {
			code: 1,
		};

		// 数据验证
		this.validate(this.ctx.data);

		let {
			goods_id,
			goods,
			detail,
			skus
		} = this.ctx.data;
		console.log('this.ctx.data', this.ctx.data);
		try {

			// 产品数据
			let __goods = await this.db.collection('usemall-goods').doc(goods_id).get();

			if (!__goods || __goods.data.length <= 0) {
				response.msg = `当前产品不存在`;
				return response;
			}

			// 处理商品详情前端显示UI样式
			detail.desc_mobile = detail.desc_mobile.replace(/style="max-width:100%;"/gi, '').replace(/<img src/gi, '<img style="max-width:100%;display:block;" src');

			// 是否填写商品分享设置
			goods.share_title = goods.share_title || goods.name;
			goods.share_img = goods.share_img || goods.img;
			goods.share_desc = goods.share_desc || goods.name_pw;

			// todo: 判断商品名称是否存在 


			// 商品默认值
			//goods.version = this.db.command.inc(1);
			goods.last_modify_uname = new Date().getTime();
			goods.last_modify_uid = this.ctx.auth.uid;
			goods.last_modify_uname = this.ctx.auth.userInfo.username || this.ctx.auth.userInfo.nickname;

			delete goods._id;
			// 写入商品数据
			const goodsRes = await this.db.collection('usemall-goods').doc(goods_id).set(goods);

			// 商品详情默认值
			detail.version = this.db.command.inc(1);
			detail.last_modify_uname = new Date().getTime();
			detail.last_modify_uid = this.ctx.auth.uid;
			detail.last_modify_uname = this.ctx.auth.userInfo.username || this.ctx.auth.userInfo.nickname;
			// 商品SKU默认值
			skus.forEach(x => {

				x.goods_id = goods_id;
				x.goods_sku = `${goods_id}_${x.spec_s}`;
				x.market_price = goods.market_price;
				x.stock_wh_num = x.stock_num;
				x.limit = goods.limit;
				x.img = goods.img;

				x.version = 1;
				x.is_delete = 1;
				x.create_time = new Date().getTime();
				x.create_uid = this.ctx.auth.uid;
				x.create_uname = this.ctx.auth.userInfo.username || this.ctx.auth.userInfo.nickname;
			});

			// 写入商品详情数据
			await this.db.collection('usemall-goods-detail').where({
				goods_id: goods_id
			}).update(detail);

			// 删除商品SKU数据
			await this.db.collection('usemall-goods-sku').where({
				goods_id: goods_id
			}).remove();
			if (skus && skus.length > 0) {
				// 写入商品SKU数据
				await this.db.collection('usemall-goods-sku').add(skus);
			}

			response.code = 0;
			response.msg = '提交成功';

		} catch (e) {
			//TODO handle the exception
			console.log('catch', e);
		}
		return response;
	}

	// 列表
	async list() {
		let response = {
			code: 1,
			goods: []
		};

		let start = new Date().getTime();
		console.log('this.ctx.data', this.ctx.data);
		// 请求参数
		const req = this.ctx.data;
		let {
			sid,
			keyword
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
				this.db.collection('usemall-search-hot').doc(sid).update({
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

		const goods = await this.db.collection('usemall-goods')
			.where({
				name: new RegExp(keyword)
			})
			.skip((req.page - 1) * req.rows)
			.limit(req.rows)
			.orderBy(req.sidx, req.sord)
			.get();

		response.goods = goods.data;

		let end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
	}

}
