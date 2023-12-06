export default {
	login: {
		url: '/pages/login' // 登录页面路径
	},
	index: {
		url: '/pages/home' // 登录后跳转的第一个页面
	},
	error: {
		url: '/pages/error/404' // 404 Not Found 错误页面路径
	},
	debug: process.env.NODE_ENV !== 'production', // true: 开发 false: 线上
}
