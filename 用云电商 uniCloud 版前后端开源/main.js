import Vue from 'vue'
import App from './App'

import $config from './common/config.js'
import $api from './common/common.js'
import $db from './common/db.js'
import $func from './common/func.js'
import $store from './common/store.js'

// #ifdef H5 || MP-360
uni.canIUse = function(name) {
	return name in uni;
}
// #endif

// 测试阶段
$config.debug = process.env.NODE_ENV === 'development';

if (!$config.debug) {
	// 取消日志打印功能
	console.log = () => { }
}

// 注册当前环境 
$api.register_env((env) => {
	Vue.prototype.$env = env;
});


Vue.config.productionTip = false

Vue.prototype.$config = $config
Vue.prototype.$api = $api
Vue.prototype.$db = $db
Vue.prototype.$dbcmd = uniCloud.database().command;
Vue.prototype.$func = $func
Vue.prototype.$store = $store

App.mpType = 'app'

const app = new Vue({
	...App
})

app.$mount()
