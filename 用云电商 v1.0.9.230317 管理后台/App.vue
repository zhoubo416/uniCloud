<script>
	import {
		mapGetters,
		mapActions
	} from 'vuex'
	import config from '@/admin.config.js'
	import { version } from './package.json'
	export default {
		computed: {
			...mapGetters({
				isTokenValid: 'user/isTokenValid'
			})
		},
		methods: {
			
		},
		onPageNotFound(msg) {
			uni.redirectTo({
				url: config.error.url
			})
		},
		onLaunch: function() {
			if (!this.isTokenValid) {
				uni.redirectTo({
					url: config.login.url
				})
			} else {
				// this.init()
			}
		}
	}
</script>

<style>
	@import '@/common/uni.css';
</style>
