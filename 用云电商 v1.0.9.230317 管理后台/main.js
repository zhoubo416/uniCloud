import Vue from 'vue'
import App from './App'
import store from './store'

Vue.config.productionTip = false

// 饿了么ui相关
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI)

// 引入echarts
import * as echarts from 'echarts';
Vue.prototype.$echarts = echarts

// 全局导入样式
import './common/main.css'
import './common/animate.min.css'
import './common/iconfont.css'

import axios from './common/http'
Vue.prototype.$axios = axios

import db from './common/db'
Vue.prototype.$db = db

import func from './common/func'
Vue.prototype.$func = func

let $api = {
	offset: function(a) {
		var b, st;
		if (document.documentElement) {
			b = document.documentElement.scrollLeft;
			st = document.documentElement.scrollTop
		} else {
			b = document.body.scrollLeft;
			st = document.body.scrollTop
		}
		var c = a.getBoundingClientRect();
		return {
			c,
			l: c.left + b,
			t: c.top + st,
			w: a.offsetWidth,
			h: a.offsetHeight
		}
	},
	get_form_prop: function(obj) {
		let _name = '';
		for (let _key in obj) {
			_name = _key;
			break;
		}
		return _name;
	},
	// 设置未验证 form
	set_unvalidated_form_focus: function(_this, obj) {
		let _name = this.get_form_prop(obj);
		if (!_name) return;
		try {
			try { 
				_this.$refs[_name].$el.querySelector("textarea").focus();
			} catch (error) {
				_this.$refs[_name].$el.querySelector("input").focus();
			}
		} catch (error) {
			_this.$refs[_name].$el.scrollIntoViewIfNeeded(true)
		}
	}
};
Vue.prototype.$api = $api;

Date.prototype.format = function(fmt) {
	fmt = fmt || "yyyy-MM-dd hh:mm:ss"
	var o = {
		"M+": this.getMonth() + 1, //月份   
		"d+": this.getDate(), //日   
		"h+": this.getHours(), //小时   
		"m+": this.getMinutes(), //分   
		"s+": this.getSeconds(), //秒   
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度   
		"S": this.getMilliseconds() //毫秒   
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k])
				.length)));
	return fmt;
}


App.mpType = 'app'

const app = new Vue({
	store,
	...App
})
app.$mount()
