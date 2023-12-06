<script>
	/**
	 * vuex 管理登陆状态，具体可以参考官方登陆模板示例 
	 */
	import { mapState, mapMutations } from 'vuex';
	const db = uniCloud.database();
	
	export default {
		computed: {
			...mapState(['member'])
		},
		methods: {
			...mapMutations(['token', 'loadToken'])
		},
		onLaunch: function(options) {
			let _this = this;
			// console.log(_this);
			
			if (uni.canIUse('getUpdateManager')) {
				const updateManager = uni.getUpdateManager();
			
				updateManager.onCheckForUpdate(function(res) {
					// 请求完新版本信息的回调
					console.log(res.hasUpdate);
					if (res.hasUpdate) {
						updateManager.onUpdateReady(function(res) {
							uni.showModal({
								title: '更新提示',
								content: '新版本已经准备好，是否重启应用？',
								success(res) {
									if (res.confirm) {
										// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
										updateManager.applyUpdate();
									}
								}
							});
						});
			
						updateManager.onUpdateFailed(function(res) {
							// 新的版本下载失败
						});
					}
				});
			}
			
		},
		onShow: function(options) {
			console.log('App Show');
			this.loadToken();
			
			if ([1011, 1012, 1013].includes(options.scene) && options.query) {
				uni.setStorageSync('__scene_query_q', options.query.q);
			}
			
			// #ifdef MP-WEIXIN
			let lopts = uni.getLaunchOptionsSync();
			console.log(options, lopts);
			
			// 
			if(lopts && lopts.query && lopts.query.share){
				// is_share
				// todo: 调用分享获积分服务-api
				
			}
			// #endif			
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* 全局字体图标和公共样式 */
	@import url("/components/iconfont/iconfont.css");
	@import url("/common/common.scss");
</style>
