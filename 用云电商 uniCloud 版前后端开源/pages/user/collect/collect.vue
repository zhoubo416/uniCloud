<template>
	<view class="bg-drak" :class="[empty ? '' : 'padding-tb']">
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" tip="无收藏数据"></use-empty>

		<view v-else class="padding-lr" v-for="(item, index) in datas" :key="index">
			<view class="product border-radius-sm padding margin-bottom-sm bg-main" style="padding-bottom: 15rpx;">
				<view class="left" @click="togoods(item)">
					<image :src="item.img" mode="aspectFill"></image>
				</view>
				<view class="margin-left-sm pos-r w-full">
					<text class="clamp-2" @click="togoods(item)">{{ item.name }} {{ item.name_pw }}</text>
					<view class="pos-a dflex-b price-box w-full">
						<text class="price padding-tb-sm" @click="togoods(item)">{{ item.price / 100 }}</text>
						<view class="dflex-c ft-dark">
							<button class="btn no-border padding-0 fs-sm ft-dark" open-type="share" :id="item.goods_id">
								<view class="dflex-c fs-xs padding-tb-sm">
									<text class="iconfont iconfenxiang margin-left-xs"></text>
								</view>
							</button>
							<view @tap.stop="deleteCollect(item._id)" class="dflex-c margin-left-sm padding-tb-sm">
								<text class="iconfont iconlajitong-01 margin-left-xs"></text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 上拉加载更多 -->
		<use-loadmore v-if="!empty && hasmore" :type="loadmoreType"></use-loadmore>
		<!-- 置顶 -->
		<use-totop ref="usetop" bottom="150"></use-totop>

		<view v-if="!empty" class="fixed-top" @click="clear">
			<text class="iconfont iconlajitong-01 fs-xl"></text>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database();
	const _collect = 'usemall-member-collect'
	import { mapState } from 'vuex';
	export default {
		computed: {
			...mapState(['islogin', 'member'])
		},
		data() {
			return {
				// 加载更多状态
				loadmoreType: 'nomore',
				// 数据源
				datas: [],
				empty: false,
				hasmore: 0,
				reqdata: {
					rows: 20,
					page: 1
				},
				scrollTop: 0,
			};
		},
		watch: {
			datas(e) {
				let empty = e.length === 0;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			}
		},
		onShareAppMessage: function(ops) {
			let _this = this;
			let mid = 0;
			if (_this.member && _this.member._id) {
				mid = _this.member._id;
			}

			let goods = _this.datas.find(x => x.goods_id == ops.target.id);
			let share_img = '';
			if (goods && goods.id > 0) {
				share_img = goods.share_img;
			}

			return {
				imageUrl: share_img,
				bgImgUrl: share_img,
				title: `来自 [${_this.member.user_name}] 的收藏夹`,
				path: `/pages/goods/goods?id=${ops.target.id}&mid=${mid}`,
				content: '用云电商',
				desc: '用云电商',
				success: function(res) {
					// 转发成功
					console.log(res);
					console.log('转发成功', JSON.stringify(res));
				},
				fail: function(res) {
					// 转发失败
					console.log('转发失败', JSON.stringify(res));
				}
			};
		},
		onPageScroll(e) {
			//this.scrollTop = e.scrollTop;
			this.$refs.usetop.change(e.scrollTop);
		},
		onShow() {
			this.loadData();
		},
		methods: {
			loadData() {
				const goodsTemp = db.collection('usemall-goods').getTemp();
				
				db.collection(_collect, goodsTemp)
					.where("create_uid == $env.uid && state == '已收藏'")
					.field(
						'_id, visit_cnt, goods.price as price,goods.name as name ,last_modify_time, goods._id as goods_id, goods.img as img, goods.state as goods_state'
					)
					.orderBy('last_modify_time desc')
					.get()
					.then(res => {
						if (res && res.result && res.result.errCode === 0) {
							let _historyDatas = [];
							res.result.data.forEach(x => {
								_historyDatas.push(x);
							});
							this.datas = _historyDatas;
							if (this.datas.length === 0) {
								this.empty = true;
							}
						}
					})
			},
			// 删除收藏
			deleteCollect(id) {
				let _this = this
				uni.showModal({
					title: '提示',
					content: '删除收藏',
					success: function(res) {
						if (res.confirm) {
							_this.$db[_collect].where('create_uid == $env.uid').remove(id).then(res => {
								if (res.code === 200) {
									_this.loadData();
								}
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			// 清空收藏
			clear() {
				let _this = this;
				uni.showModal({
					title: '提示',
					content: '清空收藏',
					success: function(res) {
						if (res.confirm) {
							_this.$db[_collect].where('create_uid == $env.uid').remove().then(res => {
								if (res.code === 200) {
									_this.datas = [];
									return;
								}
								_this.$api.msg(res.msg)
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			togoods(item) {
				this.$api.togoods({
					id: item.goods_id
				});
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}

	.product {
		display: flex;

		.left {
			image {
				width: 180rpx;
				height: 180rpx;
			}
		}

		.price-box {
			bottom: -20rpx;
		}
	}
</style>
