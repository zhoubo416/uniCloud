'use strict';

const { Controller } = require('uni-cloud-router');

module.exports = class MpController extends Controller { 
	
	// 首页
	async home () {
		let { rows } = this.ctx.data;
		rows = rows || 8;
		
		let response = { carousel: [], category: [], limited: [], hot: [] };
		let start = new Date().getTime();
		
		const carousel = this.db.collection('usemall-app-carousel').where({ state: '启用' }).orderBy('sort', 'asc').get();
		const category = this.db.collection('usemall-app-category').where({ state: '启用' }).orderBy('sort', 'asc').get();
		const limited = this.db.collection('usemall-goods').where({ state: '销售中', limited: 1 }).orderBy('sort', 'asc').limit(rows).get();
		const hot = this.db.collection('usemall-goods').where({ state: '销售中', hot: 1 }).orderBy('sort', 'asc').limit(rows).get();
		
		const datas = await Promise.all([carousel, category, limited, hot]);
		
		response.carousel = datas[0] && datas[0].data;
		response.category = datas[1] && datas[1].data;
		response.limited = datas[2] && datas[2].data;
		response.hot = datas[3] && datas[3].data;
		
		let end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.msg = `耗时：${end - start}ms`;
		return response;
	}
	
}
