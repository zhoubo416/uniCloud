import {
	Message,
	Loading
} from 'element-ui';

import config from '@/admin.config.js'

let db = {};
let unidb = uniCloud.database();

db = new Proxy(db, {
	get: function(target, key) {
		// console.log(target, key);
		if (key === '$cmd') return unidb.command;
		return new DbContext(key);
	}
});

function DbContext(name) {
	this.table = name;
	this.where_obj = {};
	this.where_arr = [];
	this.where_str = '';
	this.isgroup = false;
	this.group = {};
	
	this.response = {
		code: 200,
		datas: {},
		msg: ''
	}
}

DbContext.prototype = {
	table: '', // 数据集合|表名
	field: '',
	isgroup: false,
	group: {},
	where_obj: {}, // where 条件
	where_arr: [], // where 条件
	where_str: '', // where 条件
	response: {} // 统一响应格式
};

DbContext.prototype.where = function(params) {
	if (typeof params === 'object') {
		Object.assign(this.where_obj, params);
	}
	if (typeof params === 'string') {
		this.where_arr.push(params);
	}
	return this
}
DbContext.prototype.whereif = function(_flag, _obj) {
	if (_flag) this.where(_obj);
	return this;
}

DbContext.prototype.field = function(params) {
	this.filed = params;
	return this;
}

DbContext.prototype.collection = function() {
	return unidb.collection(this.table);
}

DbContext.prototype.add = function(obj) {
	uni.showLoading({
		title: '请求中'
	})
	return this.collection()
		.add(obj)
		.then(res => {
			if (config.debug) {
				console.log(this.table + ' add', res);
			}
			if (res.result) {
				this.response.datas = res.result;
				if (res.result.errCode === 0) this.response.code = 200;

				return Promise.resolve(this.response);
			}

			return Promise.reject(res);
		})
		.catch(err => {
			if (config.debug) {
				console.log(this.table + ' add catch', err);
				Message.error(err.message);
			}
			return Promise.reject(err);
		})
		.finally(res => {
			uni.hideLoading();
		});
}

DbContext.prototype.remove = function(_id) {
	uni.showLoading({
		title: '请求中'
	})

	if (_id) {
		return this.collection()
			.doc(_id)
			.remove()
			.then(res => {
				if (config.debug) {
					console.log(this.table + ' remove', res);
				}
				if (res.result) {
					this.response.datas = res.result;
					if (res.result.errCode === 0) this.response.code = 200;

					return Promise.resolve(this.response);
				}

				return Promise.reject(res);
			})
			.catch(err => {
				if (config.debug) {
					console.log(this.table + ' remove catch', err);
					Message.error(err.message);
				}
				return Promise.reject(err);
			})
			.finally(res => {
				uni.hideLoading();
			});
	}
	this.where_str = this.where_arr.join(' && ');
	return this.collection()
		.where(this.where_str || this.where_obj)
		.remove()
		.then(res => {
			if (config.debug) {
				console.log(this.table + ' remove', res);
			}
			if (res.result) {
				this.response.datas = res.result;
				if (res.result.errCode === 0) this.response.code = 200;

				return Promise.resolve(this.response);
			}

			return Promise.reject(res);
		})
		.catch(err => {
			if (config.debug) {
				console.log(this.table + ' remove catch', err);
				Message.error(err.message);
			}
			return Promise.reject(err);
		})
		.finally(res => {
			uni.hideLoading();
		});
}

DbContext.prototype.set = function(_id, obj) {
	uni.showLoading({
		title: '请求中'
	})
	return this.collection()
		.doc(_id)
		.set(obj)
		.then(res => {
			if (config.debug) {
				console.log(this.table + ' set', res);
			}
			if (res.result) {
				this.response.datas = res.result;
				if (res.result.errCode === 0) this.response.code = 200;

				return Promise.resolve(this.response);
			}

			return Promise.reject(res);
		})
		.catch(err => {
			if (config.debug) {
				console.log(this.table + ' set catch', err);
				Message.error(err.message);
			}
			return Promise.reject(err);
		})
		.finally(res => {
			uni.hideLoading();
		});
}

DbContext.prototype.update = function(_id, obj) {
	uni.showLoading({
		title: '请求中'
	})
	if (_id) {
		return this.collection()
			.doc(_id)
			.update(obj)
			.then(res => {
				if (config.debug) {
					console.log(this.table + ' update', res);
				}
				if (res.result) {
					this.response.datas = res.result;
					if (res.result.errCode === 0) this.response.code = 200;

					return Promise.resolve(this.response);
				}

				return Promise.reject(res);
			})
			.catch(err => {
				if (config.debug) {
					console.log(this.table + ' update catch', err);
					Message.error(err.message);
				}
				return Promise.reject(err);
			})
			.finally(res => {
				uni.hideLoading();
			});
	}

	this.where_str = this.where_arr.join(' && ');
	return this.collection()
		.where(this.where_str || this.where_obj)
		.update(obj)
		.then(res => {
			if (config.debug) {
				console.log(this.table + ' update', res);
			}
			if (res.result) {
				this.response.datas = res.result;
				if (res.result.errCode === 0) this.response.code = 200;

				return Promise.resolve(this.response);
			}

			return Promise.reject(res);
		})
		.catch(err => {
			if (config.debug) {
				console.log(this.table + ' update catch', err);
				Message.error(err.message);
			}
			return Promise.reject(err);
		})
		.finally(res => {
			uni.hideLoading();
		});
}

DbContext.prototype.tofirst = function(_obj) {
	let _id = '';
	let _loading = true;
	if (typeof _obj === 'object') {
		_id = _obj._id || '';
		if (typeof _obj.loadding === 'boolean') _loading = _obj.loadding;
	}
	if (typeof _obj === 'string') {
		_id = _obj;
	}
	
	if (_loading) {
		uni.showLoading({
			title: '请求中'
		})
	}
	
	let ctx = this.collection();
	
	if (_id) {
		ctx = ctx.doc(_id);
		if (this.filed) { ctx = ctx.field(this.filed); }
		return ctx.get()
			.then(res => {
				if (config.debug) {
					console.log(this.table + ' tofirst', res);
				}
				const data = res.result.data[0];
				if (res.result.errCode === 0) {
					this.response.code = 200;
					this.response.datas = data;

					return Promise.resolve(this.response);
				}

				return Promise.reject(res);
			})
			.catch(err => {
				if (config.debug) {
					console.log(this.table + ' tofirst catch', err);
					Message.error(err.message);
				}
				return Promise.reject(err);
			})
			.finally(res => {
				if (_loading) {
					uni.hideLoading();
				}
			});
	}
	this.where_str = this.where_arr.join(' && ');
	ctx = ctx.where(this.where_str || this.where_obj);
	if (this.filed) { ctx = ctx.field(this.filed); }
	return ctx.get({
			getOne: true
		})
		.then(res => {
			if (config.debug) {
				console.log(this.table + ' tofirst', res);
			}
			const data = res.result.data;
			if (res.result.errCode === 0) {
				this.response.code = 200;
				this.response.datas = data;

				return Promise.resolve(this.response);
			}

			return Promise.reject(res);
		})
		.catch(err => {
			if (config.debug) {
				console.log(this.table + ' tofirst catch', err);
				Message.error(err.message);
			}
			return Promise.reject(err);
		})
		.finally(res => {
			uni.hideLoading();
		});
}

DbContext.prototype.totree = function(req) {
	// 页码 页数 排序
	req = Object.assign({
		page: 1,
		rows: 50,
		orderby: '',
		loadding: true
	}, req);
	
	if (req.loadding) {
		uni.showLoading({
			title: '请求中'
		})
	}
	
	return this.collection()
		.orderBy(req.orderby)
		.get({
			getTree: {
				limitLevel: 15,
				startWith: req.startWith
			}
		})
		.then(res => {
			if (config.debug) {
				console.log(this.table + ' totree', res);
			}
			if (res.result) {
				this.response.datas = res.result.data;

				if (res.result.errCode === 0) this.response.code = 200;

				return Promise.resolve(this.response);
			}

			return Promise.reject(res);
		})
		.catch(err => {
			if (config.debug) {
				console.log(this.table + ' totree catch', err);
				Message.error(err.message);
			}
			return Promise.reject(err);
		})
		.finally(res => {
			if (req.loadding) {
				uni.hideLoading();
			}
		});
}

DbContext.prototype.tolist = function(req) {
	// 页码 页数 排序
	req = Object.assign({
		page: 1,
		rows: 30,
		orderby: ''
	}, req);
	uni.showLoading({
		title: '请求中'
	})
	this.where_str = this.where_arr.join(' && ');
	return this.collection()
		.where(this.where_str || this.where_obj)
		.orderBy(req.orderby)
		.skip((req.page - 1) * req.rows)
		.limit(req.rows)
		.get()
		.then(res => {
			if (config.debug) {
				console.log(this.table + ' tolist', res);
			}
			if (res.result) {
				this.response.datas = res.result.data;

				if (res.result.errCode === 0) this.response.code = 200;

				return Promise.resolve(this.response);
			}

			return Promise.reject(res);
		})
		.catch(err => {
			if (config.debug) {
				console.log(this.table + ' tolist catch', err);
				Message.error(err.message);
			}
			return Promise.reject(err);
		})
		.finally(res => {
			uni.hideLoading();
		});
}

DbContext.prototype.withgroup = function (param) {
	this.isgroup = true;
	this.group = param;
	return this;
}

DbContext.prototype.totable = async function(req) {
	// 页码 页数 排序
	req = Object.assign({
		page: 1,
		rows: 10,
		orderby: ''
	}, req);
	uni.showLoading({
		title: '请求中'
	})
	this.where_str = this.where_arr.join(' && ');
	
	if (this.isgroup) {
		this.response.datas.groupDatas = [];
		let groupWhereStr = this.where_arr.filter(x => x.indexOf(this.group.field) == -1).join(' && ');
		let groupWhereObj = Object.assign({}, this.where_obj);
		delete groupWhereObj[this.group.field];
		const $ = unidb.command.aggregate;
		const groupRes = await this.collection()
					.aggregate()
					.match(groupWhereStr || groupWhereObj)
					.group({
						_id: '$' + this.group.field,
						cnt: $.sum(1)
					})
					.end();
		
		if (groupRes.result && groupRes.result.data) {
			this.response.datas.groupDatas = groupRes.result.data;
			this.response.datas.group = this.group;
			this.group.datas = [];
			this.group.total = 0;
			
			for (let key in this.group.obj) {
				this.group.obj[key] = 0;
			}
			
			this.response.datas.groupDatas.forEach(x =>{
				x.name = x._id;
				
				if(Object.keys(this.group.obj).includes(x._id)) {
					this.group.obj[x._id] = x.cnt;
					this.group.total += x.cnt;
				}
			})
			if (Object.keys(this.group.obj).includes('全部')) {
				this.group.obj['全部'] = this.group.total;
			}
			
			for (let key in this.group.obj) {
				this.group.datas.push({
					name: key,
					cnt: this.group.obj[key]
				})
			}
		}
	}
	
	let ctx = this.collection();
	
	if (this.where_obj) { ctx = ctx.where(this.where_obj); }
	if (this.where_str) { ctx = ctx.where(this.where_str); }
	if (this.filed) { ctx = ctx.field(this.filed); }
	
	return ctx.skip((req.page - 1) * req.rows)
		.orderBy(req.orderby)
		.limit(req.rows)
		.get({
			getCount: true
		})
		.then(res => {
			if (config.debug) {
				console.log(this.table + ' totable', res);
			}
			if (res.result) {
				this.response.datas.rows = res.result.data;
				this.response.datas.total = res.result.count;

				if (res.result.errCode === 0) this.response.code = 200;

				return Promise.resolve(this.response);
			}

			return Promise.reject(res);
		})
		.catch(err => {
			if (config.debug) {
				console.log(this.table + ' totable catch', err);
				Message.error(err.message);
			}
			return Promise.reject(err);
		})
		.finally(res => {
			uni.hideLoading();
		});
}

export default db;
