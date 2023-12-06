<template>
	<el-aside width="180px" class="aside" ref="asideChange">
		<el-image class="headImg" ref="headImgChange" src="/static/img/logo.jpg" fit="contain"></el-image>
		<el-menu :collapse="fold" class="menu sele_none" :default-active="onRoutes" background-color="#fff"
			text-color="#000" active-text-color="#ff6a6c" unique-opened router>
			<template v-for="item in items">
				<template v-if="item.subs && item.subs.length > 0">
					<el-submenu :index="item.url" :key="item.index">
						<template slot="title">
							<i class="icon margin_r_20" :class="item.icon"></i>
							<span slot="title">{{ item.title }}</span>
						</template>
						<template v-for="subItem in item.subs">
							<el-menu-item :index="subItem.url" :key="subItem.index">{{ subItem.title }}</el-menu-item>
						</template>
					</el-submenu>
				</template>
				<template v-else>
					<el-menu-item :index="item.url" :key="item.index">
						<i class="icon margin_r_20" :class="item.icon"></i>
						<span slot="title">{{ item.title }}</span>
					</el-menu-item>
				</template>
			</template>
		</el-menu>
	</el-aside>
</template>

<script>
	import bus from '@/common/bus';
	export default {
		data() {
			return {
				fold: false,
				items: [],
				datas: []
			};
		},
		methods: {
			getSubs(params) {
				let arr = this.datas.filter(x => x.module_parent_guid == params.guid);
				let subs = [];
				arr.forEach(data => {
					subs.push({
						index: 'sub_' + data.id,
						url: data.module_url || 'sub_' + data.id,
						title: data.module_name
					});
				});

				return subs;
			},
			getMenu() {
				const res = {
					code: 200,
					msg: '',
					datas: {
						authorize_modules: [{
								id: 59,
								guid: '758a7f6c-f033-449e-b3c8-dca323c3e1f9',
								module_parent_guid: '',
								module_name: '系统首页',
								module_sys_name: null,
								module_type: null,
								module_url: '/pages/home',
								module_icon: 'iconfont iconshouye01-01',
								module_img_url: null,
								module_level: 1,
								module_code: '10005'
							},
							{
								id: 60,
								guid: '0f15d115-c4b8-46a8-9469-b1c404aab6e6',
								module_parent_guid: '',
								module_name: '店铺管理',
								module_sys_name: null,
								module_type: null,
								module_url: '',
								module_icon: 'iconfont icondianpu',
								module_img_url: null,
								module_level: 1,
								module_code: '10006'
							},
							{
								id: 61,
								guid: '88fb4c51-cc31-4abe-abb4-46c67c4476b3',
								module_parent_guid: '',
								module_name: '商品管理',
								module_sys_name: null,
								module_type: null,
								module_url: '',
								module_icon: 'iconfont iconchanpin',
								module_img_url: null,
								module_level: 1,
								module_code: '10007'
							},
							{
								id: 62,
								guid: '465b3efa-d5c2-4dce-808d-16c2aeddbe55',
								module_parent_guid: '',
								module_name: '订单管理',
								module_sys_name: null,
								module_type: null,
								module_url: '',
								module_icon: 'iconfont iconquanbudingdan',
								module_img_url: null,
								module_level: 1,
								module_code: '10008'
							},
							{
								id: 63,
								guid: '3f853e04-eab3-4019-93fc-9478cda764c9',
								module_parent_guid: '',
								module_name: '会员管理',
								module_sys_name: null,
								module_type: null,
								module_url: '',
								module_icon: 'iconfont iconyonghu',
								module_img_url: null,
								module_level: 1,
								module_code: '10009'
							},
							{
								id: 69,
								guid: '91a55a2c-335a-4c36-a9f5-5d1cea96132e',
								module_parent_guid: '',
								module_name: '应用管理',
								module_sys_name: null,
								module_type: null,
								module_url: '',
								module_icon: 'iconfont iconyingyong',
								module_img_url: null,
								module_level: 1,
								module_code: '10015'
							},
							{
								id: 50,
								guid: 'f517cade-46ee-4735-9a1d-b48be2f9d1cc',
								module_parent_guid: '',
								module_name: '系统设置',
								module_sys_name: 'sys',
								module_type: '',
								module_url: '',
								module_icon: 'iconfont iconxitongshezhi',
								module_img_url: '',
								module_level: 1,
								module_code: '10065'
							},
							{
								id: 91,
								guid: 'f8bed44c-bb20-46d3-9b60-6e182540e8e8',
								module_parent_guid: '',
								module_name: '日志管理',
								module_sys_name: null,
								module_type: null,
								module_url: '',
								module_icon: 'iconfont iconrizhi',
								module_img_url: null,
								module_level: 1,
								module_code: '10070'
							},
							{
								id: 1,
								guid: '06b7301b-e433-4429-9476-e93f3eff963c',
								module_parent_guid: '91a55a2c-335a-4c36-a9f5-5d1cea96132e',
								module_name: '小程序',
								module_sys_name: 'app 微信小程序',
								module_type: '',
								module_url: '/pages/app/mp/mp_page',
								module_icon: '',
								module_img_url: '',
								module_level: 2,
								module_code: '10015.20003'
							},
							{
								id: 6,
								guid: 'd9105323-15dc-43a2-9165-13d0f36f4c2a',
								module_parent_guid: '0f15d115-c4b8-46a8-9469-b1c404aab6e6',
								module_name: '店铺首页',
								module_sys_name: 'app 应用轮播图',
								module_type: '',
								module_url: '/pages/shop/home/page',
								module_icon: '',
								module_img_url: '',
								module_level: 2,
								module_code: '10006.20012'
							},
							{
								id: 15,
								guid: '5ade17a5-99d8-41fd-9ed3-0f2b832159f7',
								module_parent_guid: '88fb4c51-cc31-4abe-abb4-46c67c4476b3',
								module_name: '商品列表',
								module_sys_name: 'goods 商品',
								module_type: '',
								module_url: '/pages/goods/list/goods_list',
								module_icon: '',
								module_img_url: '',
								module_level: 2,
								module_code: '10007.20012'
							},
							{
								id: 26,
								guid: '5437d34a-3de2-4347-a893-3ffff57e2162',
								module_parent_guid: '3f853e04-eab3-4019-93fc-9478cda764c9',
								module_name: '会员列表',
								module_sys_name: 'member 会员',
								module_type: '',
								module_url: '/pages/member/list/member_list',
								module_icon: '',
								module_img_url: '',
								module_level: 2,
								module_code: '10009.20012'
							},
							{
								id: 35,
								guid: '56b1109a-7db4-4c7a-a078-9d278586a7ac',
								module_parent_guid: '465b3efa-d5c2-4dce-808d-16c2aeddbe55',
								module_name: '订单列表',
								module_sys_name: 'order 订单',
								module_type: '',
								module_url: '/pages/order/order/order_list',
								module_icon: '',
								module_img_url: '',
								module_level: 2,
								module_code: '10008.20012'
							},
							{
								id: 99,
								guid: '82b57c1b-d5fc-4c20-8a39-2a45a0c27542',
								module_parent_guid: 'f8bed44c-bb20-46d3-9b60-6e182540e8e8',
								module_name: '操作日志',
								module_sys_name: null,
								module_type: null,
								module_url: '/pages/log/operation_log',
								module_icon: '',
								module_img_url: null,
								module_level: 2,
								module_code: '10070.20019'
							},
							{
								id: 4,
								guid: '6f4f903a-77c1-454e-8943-7df6b5bf6ac9',
								module_parent_guid: '0f15d115-c4b8-46a8-9469-b1c404aab6e6',
								module_name: '分类导航',
								module_sys_name: 'app 应用分类',
								module_type: '',
								module_url: '/pages/shop/classify/classify_navigation',
								module_icon: '',
								module_img_url: '',
								module_level: 2,
								module_code: '10006.20012'
							},
							{
								id: 18,
								guid: '4a248661-531c-429c-a513-031375572f9e',
								module_parent_guid: '88fb4c51-cc31-4abe-abb4-46c67c4476b3',
								module_name: '商品分类',
								module_sys_name: 'goods 商品分类',
								module_type: '',
								module_url: '/pages/goods/classify/goods_classify',
								module_icon: '',
								module_img_url: '',
								module_level: 2,
								module_code: '10007.20012'
							},
							{
								id: 55,
								guid: '4482135a-09c9-4b08-93e4-955e8c5e6314',
								module_parent_guid: 'f517cade-46ee-4735-9a1d-b48be2f9d1cc',
								module_name: '账号管理',
								module_sys_name: 'sys.user 账号',
								module_type: '',
								module_url: '/pages/system_set/account/account',
								module_icon: '',
								module_img_url: '',
								module_level: 2,
								module_code: '10065.20008'
							},
							{
								id: 79,
								guid: '6a3c2b73-c69a-484b-8894-8976bde06350',
								module_parent_guid: '465b3efa-d5c2-4dce-808d-16c2aeddbe55',
								module_name: '退款处理',
								module_sys_name: null,
								module_type: null,
								module_url: '/pages/order/refunds_dispose',
								module_icon: '',
								module_img_url: null,
								module_level: 2,
								module_code: '10008.20012'
							},
							{
								id: 17,
								guid: '63dad488-27dc-4711-8d2b-b6b8a9f6fe04',
								module_parent_guid: '88fb4c51-cc31-4abe-abb4-46c67c4476b3',
								module_name: '标签管理',
								module_sys_name: 'goods 商品标签',
								module_type: '',
								module_url: '/pages/goods/label/page',
								module_icon: '',
								module_img_url: '',
								module_level: 2,
								module_code: '10007.20012'
							},
							{
								id: 53,
								guid: '8006f8db-f724-453e-bf91-7c5e5a2daf95',
								module_parent_guid: 'f517cade-46ee-4735-9a1d-b48be2f9d1cc',
								module_name: '角色管理',
								module_sys_name: 'sys.role 角色',
								module_type: '',
								module_url: '/pages/system_set/role/role',
								module_icon: '',
								module_img_url: '',
								module_level: 2,
								module_code: '10065.20006'
							},
							{
								id: 75,
								guid: '4443db8b-5597-4d25-a508-6c52f312d007',
								module_parent_guid: '0f15d115-c4b8-46a8-9469-b1c404aab6e6',
								module_name: '限时精选',
								module_sys_name: null,
								module_type: null,
								module_url: '/pages/shop/limit',
								module_icon: '',
								module_img_url: null,
								module_level: 2,
								module_code: '10006.20012'
							},
							{
								id: 77,
								guid: 'd6626496-5d0e-4d97-871f-8efe964505f8',
								module_parent_guid: '0f15d115-c4b8-46a8-9469-b1c404aab6e6',
								module_name: '热门推荐',
								module_sys_name: null,
								module_type: null,
								module_url: '/pages/shop/hot',
								module_icon: '',
								module_img_url: null,
								module_level: 2,
								module_code: '10006.20012'
							},
							{
								id: 20,
								guid: '400f5055-c1c6-456f-a3cf-69349036df05',
								module_parent_guid: '88fb4c51-cc31-4abe-abb4-46c67c4476b3',
								module_name: '商品评价',
								module_sys_name: 'goods 商品评论',
								module_type: '',
								module_url: '/pages/goods/evaluate',
								module_icon: '',
								module_img_url: '',
								module_level: 2,
								module_code: '10007.20012'
							},
							{
								id: 40,
								guid: 'f12276ee-fb94-4e9e-942c-bab97e789c0a',
								module_parent_guid: '0f15d115-c4b8-46a8-9469-b1c404aab6e6',
								module_name: '搜索管理',
								module_sys_name: 'search 历史搜索',
								module_type: '',
								module_url: '/pages/shop/search/page',
								module_icon: '',
								module_img_url: '',
								module_level: 2,
								module_code: '10006.20012'
							},
							{
								id: 81,
								guid: '9f7f2915-c9e3-4d04-a4c8-e9d649d2e0a8',
								module_parent_guid: '465b3efa-d5c2-4dce-808d-16c2aeddbe55',
								module_name: '交易设置',
								module_sys_name: null,
								module_type: null,
								module_url: '/pages/order/deal_set',
								module_icon: '',
								module_img_url: null,
								module_level: 2,
								module_code: '10008.20013'
							}
						]
					}
				};

				this.datas = res.datas.authorize_modules;
				this.datas.forEach(data => {
					if (data.module_parent_guid == '')
						this.items.push({
							icon: data.module_icon,
							url: data.module_url || data.id + '',
							index: data.id + '',
							title: data.module_name,
							subs: this.getSubs(data)
						});
				});

				uni.setStorage({
					key: '__menu',
					data: this.datas
				});
			}
		},
		created() {
			bus.$on('fold', res => {
				this.fold = res;
				if (res) {
					this.$refs.asideChange.$el.style.width = '64px';
					this.$refs.headImgChange.$el.style.width = '64px';
					this.$refs.headImgChange.$el.style.height = '100px';
				} else {
					this.$refs.asideChange.$el.style.width = '180px';
					this.$refs.headImgChange.$el.style.width = '100%';
					this.$refs.headImgChange.$el.style.height = '100px';
				}
			});

			this.items = [];

			if (this.items.length <= 0) {
				this.getMenu();
			}
		},
		computed: {
			onRoutes() {
				return this.$route.path;
			}
		}
	};
</script>

<style>
	>>>.el-menu {
		border: none;
	}

	>>>.el-submenu__title:hover,
	>>>.el-menu-item:hover,
	>>>.el-submenu__title:hover i {
		color: #ff6a6c !important;
		background-color: #fff !important;
	}

	>>>.el-submenu__icon-arrow {
		transform: rotate(-90deg);
		top: 31px;
		right: 20px;
	}

	>>>.el-submenu.is-opened>.el-submenu__title .el-submenu__icon-arrow {
		transform: rotate(0deg);
	}

	>>>.el-submenu .el-menu-item {
		padding: 0 0 0 68px !important;
		min-width: initial !important;
	}

	>>>.el-menu-item i {
		color: #909399;
	}

	>>>.el-menu-item.is-active:after {
		content: ' ';
		position: absolute;
		right: 0rem;
		width: 0.3125rem;
		height: 1.25rem;
		background-color: #ff6a6c;
		top: 50%;
		transform: translate(0, -50%);
	}

	.aside {
		background-color: #ffffff;
		overflow-x: hidden;
		overflow-y: hidden;
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		transition: all 0.3s ease-in-out;
	}

	.headImg {
		width: 100%;
		height: 100px;
		transition: all 0.3s ease-in-out;
	}

	.menu {
		overflow: auto;
		height: calc(100% - 100px);
		overflow-x: hidden;
	}

	.main::-webkit-scrollbar {
		display: none;
	}

	.icon {
		font-size: 20px;
	}
</style>
