<template>
	<div class="tab" ref="tabChange">
		<div class="dflex h100">
			<div class="tab_content dflex_c h100 margin_r_10 crpr" v-for="(item, i) in tagsList"
				:class="{ active: isActive(item.path) }" :key="i">
				<router-link :to="item.path" class="tab_name h100 dflex_c">{{ item.title }}</router-link>
				<span class="el-icon-close" v-if="item.close" @click="closeTags(i)"></span>
			</div>
		</div>
		<el-dropdown class="tab_btn" trigger="click" @command="handleTags">
			<el-button size="mini" class="h100">
				标签选项
				<i class="el-icon-arrow-down margin_l_5"></i>
			</el-button>
			<el-dropdown-menu slot="dropdown">
				<el-dropdown-item command="other">关闭其他</el-dropdown-item>
				<el-dropdown-item command="all">关闭所有</el-dropdown-item>
			</el-dropdown-menu>
		</el-dropdown>
	</div>
</template>

<script>
	import bus from '@/common/bus';
	import config from '@/admin.config.js';
	export default {
		data() {
			return {
				tagsList: [],
				home: {},
				tagTotal: 12
			};
		},
		watch: {
			$route(newValue) {
				if (newValue.path == '/preview-image') return;
				this.setTags(newValue);
			}
		},
		methods: {
			isActive(path) {
				return path === this.$route.fullPath;
			},
			closeTags(index) {
				const delItem = this.tagsList.splice(index, 1)[0];
				const item = this.tagsList[index] ? this.tagsList[index] : this.tagsList[index - 1];
				if (item) {
					delItem.path === this.$route.fullPath && this.$router.push(item.path);
				} else {
					this.$router.push(config.index.url);
				}
				localStorage.setItem('sys-tags', JSON.stringify(this.tagsList));
			},
			setTags(route) {
				const curPath = route.fullPath;

				if (curPath == '/') {
					this.$router.push(config.index.url);
					return;
				}

				if (['/', '/pages/login', '/pages/error/404'].includes(curPath)) {
					return;
				}

				const isExist = this.tagsList.some(item => {
					return item.path === curPath || item.title == route.query.tab;
				});

				var menus = uni.getStorageSync('__menu');

				if (!isExist) {
					if (this.tagsList.length >= this.tagTotal) {
						this.tagsList.splice(1, 1);
					}

					if (menus && menus.length > 0) {
						const menu = menus.find(x => x.module_url == route.path) || {
							name: route.query.tab
						};
						if (menu) {
							this.tagsList.push({
								title: menu.module_name || menu.name,
								path: curPath,
								close: !0
							});
						}
					}
				} else {
					this.tagsList[this.tagsList.findIndex(x => x.path === curPath || x.title == route.query.tab)].path =
						curPath;
				}

				localStorage.setItem('sys-tags', JSON.stringify(this.tagsList));
			},
			handleTags(command) {
				command === 'other' ? this.closeOther() : this.closeAll();
			},
			closeAll() {
				this.tagsList = [];
				this.tagsList.push(this.home);
				this.$router.push(config.index.url);
				localStorage.setItem('sys-tags', JSON.stringify(this.tagsList));
			},
			closeOther() {
				const curItem = this.tagsList.find(item => {
					return item.path === this.$route.fullPath;
				});

				this.tagsList = [];
				this.tagsList.push(this.home);
				if (curItem.path !== this.home.path) this.tagsList.push(curItem);
				localStorage.setItem('sys-tags', JSON.stringify(this.tagsList));
			}
		},
		created() {
			this.home = {
				title: '系统首页',
				path: config.index.url,
				close: 0
			};
			bus.$on('logOut', () => {
				this.tagsList = [];
				this.tagsList.push(this.home);
			});
			bus.$on('fold', res => {
				if (res) {
					this.$refs.tabChange.style.left = '80px';
				} else {
					this.$refs.tabChange.style.left = 'calc(16px + var(--window-left))';
				}
			});

			bus.$on('tab-close', res => {
				res = res || this.$route.fullPath;
				if (res) {
					this.tagsList.forEach((tag, index) => {
						if (tag.path == res) {
							this.tagsList.splice(index, 1);
							return false;
						}
					});
				}
			});
			let tags = localStorage.getItem('sys-tags');
			if (tags) {
				this.tagsList = JSON.parse(tags);
			} else {
				this.tagsList.push(this.home);
			}

			this.setTags(this.$route);
		}
	};
</script>

<style>
	.tab {
		position: fixed;
		top: 76px;
		left: 196px;
		right: 16px;
		overflow: hidden;
		transition: all 0.3s ease-in-out;
		z-index: 10;
		height: 36px;
	}

	.tab_content {
		border-radius: 4px;
		font-size: 12px;
		background: #fff;
	}

	.tab_content:not(.active):hover {
		background: #e6e6e6;
	}

	.tab_content.active {
		color: #fff;
		background: #8a8a8a;
	}

	.tab_content.active a {
		color: #fff;
	}

	.tab_content .el-icon-close {
		position: relative;
		left: -5px;
		padding: 1px;
		font-size: 15px;
		transform: scale(0.8);
	}

	.tab_content .el-icon-close:hover {
		background-color: #fff;
		color: #8a8a8a;
		border-radius: 50%;
	}

	.tab_name {
		padding: 0 10px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		color: #666;
	}

	.tab .el-button {
		border: none;
	}

	.tab_btn {
		position: absolute;
		right: 0;
		top: 0;
		box-sizing: border-box;
		text-align: center;
		z-index: 10;
		height: 100%;
	}
</style>
