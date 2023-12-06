<template>
	<view>
		<!-- 01. 轮播区 -->
		<view class="swiper-area w-full pos-f">
			<swiper class="h-full pos-r" indicator-dots circular="true" duration="400">
				<swiper-item v-for="(item, index) in swiperDatas" :key="index">
					<view class="wh-full"><image :src="item.url" class="wh-full loaded" lazy-load="true" mode="aspectFill"></image></view>
				</swiper-item>
			</swiper>
		</view>

		<!-- 02. 商品数据区 -->
		<view class="goods-area bg-main padding">
			<view class="price-box dflex-b">
				<view>
					<text class="price fwb fs-big">{{ goods.price / 100 || '' }}</text>
					<text class="m-price" v-if="goods.market_price > 0">{{ goods.market_price / 100 || '' }}</text>
				</view>
				<view class="dflex fs-sm ft-dark">
					<!-- #ifdef MP-WEIXIN || H5 -->
					<view class="margin-right-sm dflex" @click="shareOpen">
						<view class="iconfont iconfenxiang padding-right-xs"></view>
						<text>分享</text>
					</view>
					<!-- #endif -->
					<!-- #ifdef MP-ALIPAY || MP-BAIDU || MP-QQ || MP-TOUTIAO -->
					<button class="btn no-border padding-0 fs-sm ft-dark" open-type="share">
						<view class="margin-right-sm dflex">
							<view class="iconfont iconfenxiang padding-right-xs"></view>
							<text>分享</text>
						</view>
					</button>
					<!-- #endif -->
					<view class="margin-right-sm dflex">
						<view class="padding-right-xs padding-right-xs">已售</view>
						<text>{{ goods.sale_cnt || '0' }}</text>
					</view>
					<view class="dflex">
						<view class="padding-right-xs padding-right-xs">库存</view>
						<text>{{ goods.stock_num || '0' }}</text>
					</view>
				</view>
			</view>
			<text class="title fs">{{ goods.name || '' }} {{ goods.name_pw || '' }}</text>
		</view>
		<view class="gap"></view>
		<!-- 分享 -->
		<use-popup mode="bottom" bgclass=" " v-model="shareShow">
			<view class="share-area margin border-radius bg-main">
				<view class="tac w-full padding-sm">分享</view>
				<view class="padding-lr margin-bottom-xl dflex-b pos-r">
					<!-- #ifdef MP-WEIXIN -->
					<button class="dflex-c dflex-flow-c no-border btn" style="color: #07c160" open-type="share">
						<view class="iconfont iconweixin padding-lr-sm border-radius-c fs-xxxl"></view>
						<view class="dflex-c fs-sm ft-dark">微信好友</view>
					</button>
					<view class="vertical-line"></view>
					<!-- #endif -->
					<button class="dflex-c dflex-flow-c no-border btn ft-base" @click="createPoster">
						<view class="iconfont iconhaibao1 padding-lr-sm border-radius-c fs-xxxl"></view>
						<view class="dflex-c fs-sm ft-dark">生成海报</view>
					</button>
				</view>
			</view>
		</use-popup>

		<!-- 海报二维码 -->
		<view class="qrcode tac padding-tb pos-f pos-tl-c">
			<use-qrcode :onval="true" :val="posterQRcode" :show="false" loading-text="生成海报中" qrsize="200" @result="posterQRcodeResult"></use-qrcode>
		</view>

		<!-- 海报 -->
		<view v-if="posterShow && !posterUrl" class="poster pos-f pos-tl-c padding">
			<l-painter custom-style="position: fixed;z-index: -1;top: -200vh;left: -100vw;" :board="posterData" isRenderImage @success="posterSuccess" />
		</view>
		<use-popup mode="bottom" bgclass=" " v-model="posterShow" @close="">
			<view class="padding border-radius margin">
				<view v-if="!posterUrl" class="tac bg-main padding border-radius pos-a pos-l-c" style="bottom: 45vh">海报生成中，请稍等</view>
				<view class="w-full" style="height: 70vh"><image :src="posterUrl" class="wh-full" mode="aspectFit"></image></view>

				<view class="padding w-full margin-top">
					<view class="dflex-b border-radius-big">
						<!-- #ifdef MP -->
						<view class="tac padding-tb-sm flex1 bg-base" @click="posterSave">保存到相册</view>
						<!-- #endif -->
						<!-- #ifdef H5 || MP-360 -->
						<view class="tac padding-tb-sm flex1 bg-base">长按图片保存到相册</view>
						<!-- #endif -->
					</view>
				</view>
			</view>
		</use-popup>

		<!-- 03. 规格区 -->
		<view v-if="skuDatas.length > 0" class="sku-area bg-main padding-lr padding-top padding-bottom-xs pos-r">
			<view class="con dflex dflex-wrap-w">
				<view
					class="margin-right-sm margin-bottom-sm dflex bg-drak border-radius-lg padding-tb-16 padding-lr"
					:class="{ active: item.selected }"
					v-for="(item, index) in skuDatas"
					:key="index"
					@click="selectSKU(item)"
				>
					<text class="fs-xs">{{ item.name }}</text>
				</view>
			</view>
		</view>
		<view v-if="skuDatas.length > 0" class="gap"></view>

		<!-- 04.01 优惠券 -->
		<use-list-title title="优惠" tip="领取优惠券" color="#ff6a6c" iconfont="iconyouhui" @goto="couponShow = true"></use-list-title>
		<!-- 04.01 优惠券弹出层 -->
		<use-popup mode="bottom" v-model="couponShow" @open="couponOpen">
			<!-- 优惠券区 -->
			<scroll-view>
				<view class="coupon-area padding bg-drak">
					<view class="coupon-item bg-main pos-r fs-xs" v-for="(item, index) in couponDatas" :key="index">
						<view class="content pos-r padding dflex-b">
							<view class="">
								<view class="margin-bottom-xs fs">{{ item.name }}</view>
								<view class="ft-dark">有效期至 {{ item.end_time.split(' ')[0] }}</view>
							</view>
							<view class="tar">
								<view class="margin-bottom-xs price">{{ item.price }}</view>
								<view v-if="item.order_amount > 0" class="ft-dark">满{{ item.order_amount }}可用</view>
								<view v-else class="ft-dark">不限</view>
							</view>

							<view class="circle l"></view>
							<view class="circle r"></view>
						</view>
						<view class="dflex-b">
							<text class="ft-dark padding-lr">{{ item.type }}</text>
							<text class="ft-base padding-tb-sm padding-lr" @click="couponReceive(item.id)">立即领取</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</use-popup>

		<!-- 04.02 服务标签 -->
		<view class="bg-main padding-lr padding-top padding-bottom-xs pos-r" @click="tagShow = true">
			<view class="dflex dflex-wrap-w">
				<view v-for="(item, index) in tagDatas" :key="index" class="margin-right-sm margin-bottom-sm dflex">
					<view class="iconfont iconyiwancheng- fwb fs-xs ft-base margin-right-xs"></view>
					<text class="fs-xs">{{ item.name }}</text>
				</view>
			</view>
			<view class="icon-detail pos-a"><view class="iconfont iconxiangqing ft-dark fs-sm"></view></view>
		</view>
		<view class="gap"></view>
		<!-- 04.02 服务标签弹出层 -->
		<use-popup mode="bottom" v-model="tagShow">
			<view class="tac w-full padding-sm">服务说明</view>
			<view class="padding-lr padding-bottom-sm">
				<view v-for="(item, index) in tagDatas" :key="index" class="margin-right-sm margin-bottom-sm dflex dflex-s">
					<view class="iconfont iconyiwancheng- fwb fs ft-base margin-right-xs"></view>
					<view>
						<view class="fs-sm">{{ item.name }}</view>
						<view class="fs-xs">服务标签对应的描述</view>
					</view>
				</view>
			</view>
		</use-popup>

		<!-- 05. 评价区 -->
		<view class="evaluate-area" v-if="evaluateDatas.length > 0">
			<use-list-title :title="evaluateTitle" tip="好评率 100%" color="#ff6a6c" iconfont=" " @goto="toevaluate"></use-list-title>
			<view class="padding-lr bg-main">
				<view class="eva-box dflex-s padding-bottom-lg" v-for="(item, index) in evaluateDatas" :key="index">
					<image class="portrait border-radius-c" :src="item.member_headimg"></image>
					<view class="right-area flex1 padding-left-sm">
						<view class="dflex-b ft-dark">
							<view class="dflex">
								<text class="name margin-right">{{ item.member_name }}</text>
								<use-rate :value="item.review_cnt" disabled></use-rate>
							</view>
							<text class="time fs-xs">{{ $api.format(item.create_time, 'yyyy-MM-dd') }}</text>
						</view>
						<view class="fs-sm ft-main padding-top-xs padding-bottom-sm">{{ item.review_content }}</view>
						<view class="dflex dflex-wrap-w">
							<image
								class=""
								mode="widthFix"
								v-for="(img, i) in item.review_imgs"
								:lazy-load="true"
								:key="i"
								:src="img"
								@click="preview(item.review_imgs, img)"
							></image>
						</view>
						<view class="">
							<text class="fs-xs ft-dark">{{ item.goods_type || '套餐1' }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="gap"></view>
		</view>

		<!-- 06. 详情区 -->
		<view class="detail-area bg-main">
			<view class="d-header padding dflex-c"><text>图文详情</text></view>
			<rich-text class="pro-detail" :nodes="html_nodes"></rich-text>
		</view>

		<!-- 07. 操作区 -->
		<view class="oper-area pos-f dflex-b w-full padding-lr-sm">
			<view class="btn-area dflex dflex-flow-c" @click="tohome">
				<text class="iconfont iconshouye-1"></text>
				<text>首页</text>
			</view>

			<!-- #ifndef MP-ALIPAY || H5 || MP-360 -->
			<button class="btn no-border dflex" open-type="contact">
				<view class="btn-area dflex-c dflex-flow-c">
					<text class="iconfont iconkefu-01"></text>
					<text>客服</text>
				</view>
			</button>
			<!-- #endif -->

			<view class="btn-area dflex dflex-flow-c" :class="{ active: favorite }" @click="tofavorite">
				<text class="iconfont" :class="favorite ? 'iconshoucang-' : 'iconshoucang-01'"></text>
				<text>收藏</text>
			</view>
			<view class="flex1 btn-container dflex-b border-radius-big">
				<view class="tac padding-tb-sm flex1 bg-warn" v-if="goods.stock_num > 0" @click="tocart(goods)">加入购物车</view>
				<view class="tac padding-tb-sm flex1 bg-base" v-if="goods.stock_num > 0" @click="tobuy(goods)">立即购买</view>
				<view class="tac padding-tb-sm flex1 bg-disabled" v-else>已售磐</view>
			</view>
		</view>

		<!-- #ifdef MP-ALIPAY -->
		<view class="fixed-top dflex-c dflex-flow-c"><contact-button tnt-inst-id="0Xu_1aaW" scene="SCE00225456" size="50" color="#bbb" /></view>
		<!-- #endif -->

		<!-- 置顶 -->
		<use-totop ref="usetop" bottom="120"></use-totop>
	</view>
</template>

<script>
// #ifdef MP-ALIPAY
import aliParse from 'mini-html-parser2';
// #endif

import lPainter from '@/uni_modules/lime-painter/components/lime-painter/';
import uposter from '@/common/poster.js';

import { mapState } from 'vuex';

export default {
	components: { lPainter },
	computed: {
		...mapState(['islogin', 'member'])
	},
	data() {
		return {
			// 商品ID
			id: 0,
			// 分享ID
			mid: 0,
			// 商品数据
			goods: {},
			// 轮播图
			swiperDatas: [],
			// SKU
			sku: {},
			skuDatas: [],
			// 分享
			shareShow: false,
			// 海报
			posterQRcode: '',
			posterUrl: '',
			posterShow: false,
			posterData: {},

			//优惠券
			couponShow: false,
			couponDatas: [],
			// 服务标签
			tagShow: false,
			tagDatas: [],
			// 商品评价
			evaluateDatas: [],
			evaluateTitle: '评价',
			// 商品详情
			html_nodes: '',
			// 收藏
			favorite: false,

			scrollTop: 0
		};
	},
	watch: {
		sku(e) {
			this.goods.price = e.price;
			this.goods.market_price = e.market_price;
			this.goods.stock_num = e.num;
		}
	},
	onShareAppMessage: function(ops) {
		let _this = this;
		let mid = 0;
		if (_this.member && _this.member._id) {
			mid = _this.member._id;
		}

		return {
			title: _this.goods.share_title,
			path: `/pages/goods/goods?id=${this.id}&mid=${mid}`, //这里设定都是以"/page"开头,并拼接好传递的参数
			success: function(res) {
				// 转发成功
				console.log('转发成功', res);
			},
			fail: function(res) {
				// 转发失败
				console.log('转发失败', res);
			}
		};
	},
	onPageScroll(e) {
		//this.scrollTop = e.scrollTop;
		this.$refs.usetop.change(e.scrollTop);
	},
	onLoad(options) {
		console.log('onload opts', options);

		if (options) {
			this.mid = options.mid || '';
			if (options.id) {
				this.id = options.id;
			} else if (options.q) {
				let query = decodeURIComponent(options.q) || decodeURIComponent(uni.getStorageInfoSync('__scene_query_q'));
				this.resolveQueryq(query);
			}
		}

		if (!this.id) {
			this.$api.msg('商品ID无效');
			return;
		}
	},
	onShow(options) {
		if (!this.id) {
			const query = decodeURIComponent(uni.getStorageInfoSync('__scene_query_q'));
			this.resolveQueryq(query);
		}
		
		this.loadData();
	},

	methods: {
		async loadData() {
			
			await this.$func.usemall
				.call('goods/detail', {
					goods_id: this.id,
					share_mid: this.mid
				})
				.then(res => {
					if (res.code === 200) {
						// 商品评价
						this.evaluateDatas = res.datas.evaluate;
						if (res.datas.evaluate_cnt) this.evaluateTitle = `评价(${res.datas.evaluate_cnt})`;

						if (typeof res.datas.goods.imgs === 'string') {
							this.swiperDatas = res.datas.goods.imgs.split(',').filter(x => x);
						} else {
							this.swiperDatas = res.datas.goods.imgs;
						}
						this.goods = res.datas.goods;
						// 商品详情
						let __goods_detail = res.datas.goods_detail;
						// #ifndef MP-ALIPAY
						this.html_nodes = __goods_detail.desc_mobile;
						// #endif

						// #ifdef MP-ALIPAY
						this.html_nodes = [];
						aliParse(__goods_detail.desc_mobile.replace(/"><*/gi, '"/><'), (err, nodes) => {
							if (!err) {
								this.html_nodes = nodes;
							}
						});
						// #endif

						// 商品SKU
						let __goods_skus = res.datas.goods_skus;
						if (__goods_skus.length > 0) {
							let __skuDatas = [];
							__goods_skus.forEach((sku, index) => {
								// 	{ id: 1, name: '45寸（大规格）', price: 788, market_price: 999, num: 0, selected: !0 },
								__skuDatas.push({
									id: sku._id,
									sku: sku.goods_sku,
									name: sku.spec,
									price: sku.price,
									market_price: sku.market_price || this.goods.market_price,
									num: sku.stock_num,
									selected: index == 0
								});
							});
							this.skuDatas = __skuDatas;
						}

						// SKU
						if (this.skuDatas.length > 0) {
							this.sku = this.skuDatas[0];
						}

						// 服务标签
						if (typeof this.goods.tags === 'string') {
							this.goods.tags = this.goods.tags.split(',').filter(x => x);
						}

						let __tagDatas = [];

						this.goods.tags.forEach((data, index) => {
							__tagDatas.push({
								name: data,
								selected: index == 0
							});
						});

						this.tagDatas = __tagDatas;

						// 收藏状态
						this.favorite = this.goods.collected === 1;
						return;
					}
					this.$api.msg(res.msg);
				});
		},
		// 处理 query q 数据
		resolveQueryq(query) {
			const arr = query
				.split('/')
				.slice(-1)[0]
				.split('_');
			if (arr.length == 2) this.mid = arr[1];
			this.id = arr[0];
		},
		// 图片预览
		preview(imgs, cur) {
			if (!imgs) return;

			uni.previewImage({
				urls: imgs,
				current: cur,
				longPressActions: {
					itemList: ['发送给朋友', '保存图片', '收藏'],
					success: function(data) {
						console.log(res);
					},
					fail: function(err) {
						console.log(err);
					}
				}
			});
		},

		// 打开分享
		shareOpen() {
			if (!this.loginCheck()) return;
			
			this.shareShow = true;
		},
		// 创建海报
		createPoster() {
			if (this.posterUrl) {
				this.posterShow = true;
				return;
			}
			uni.showLoading({
				title: '生成海报中'
			});
			
			// #ifdef MP
			// 此处的二维码内容，需自己在小程序端配置普通二维码规则
			this.posterQRcode = `https://usemall.use-cloud.com/wxmp-product/${this.goods._id}_${this.member._id}`;
			// #endif
			
			// #ifdef H5
			// 如果为 h5，二维码内容需配置为线上版本产品详情路径
			this.posterQRcode = `https://usemall-h5.use-cloud.com/#/pages/goods/goods?id=${this.goods._id}&mid=${this.member._id}`;
			// #endif
		},
		// 海报二维码生成成功
		posterQRcodeResult(res) {
			// 获取产品海报数据
			this.posterData = uposter.getGoodsData(this.member, this.goods, res);
			// console.log('this.posterData', this.posterData);

			this.posterShow = true;
		},
		// 海报生成完成
		posterSuccess(res) {
			this.posterUrl = res;

			uni.hideLoading();
		},
		// 保存海报
		posterSave() {
			if (this.posterUrl) {
				uni.showLoading({
					title: '保存中'
				})
				
				uni.saveImageToPhotosAlbum({
					filePath: this.posterUrl,
					success: function() {
						uni.hideLoading();
						
						uni.showToast({
							title: '海报保存成功',
							icon: 'success',
							duration: 2000
						});
					}
				});
			}
		},

		// 商品SKU
		selectSKU(res) {
			this.skuDatas.forEach(item => {
				if (res.sku == item.sku) {
					this.$set(item, 'selected', true);
				} else {
					this.$set(item, 'selected', false);
				}
			});

			this.sku = res;
		},

		// 评论
		toevaluate() {
			uni.navigateTo({
				url: `/pages/goods/goods-evaluate?id=${this.id}`
			});
		},
		// 首页
		tohome() {
			this.$api.tohome();
		},
		// 收藏
		tofavorite() {
			if (!this.loginCheck()) return;
			
			this.favorite = !this.favorite;
			let _data = {
				goods_id: this.id,
				state: !this.favorite ? '已取消' : '已收藏'
			};
			this.$func.usemall.call('member/collect', _data).then(res => {
				if (res.datas) {
					!this.favorite ? this.$api.msg('取消成功') : this.$api.msg('收藏成功');
					return;
				}

				this.$api.msg(res.msg);
			});
		},
		// 加入购物车
		tocart(params) {
			if (!this.loginCheck()) return;
			
			this.$func.usemall
				.call('goods/addcart', {
					goods_id: params._id,
					goods_num: 1,
					goods_sku: this.sku.id
				})
				.then(res => {
					if (res.code === 200) {
						this.$api.msg(res.datas.msg);
						return;
					}

					this.$api.msg(res.msg);
				});
		},
		// 立即购买
		tobuy(item) {
			let _this = this;
			if (!this.loginCheck()) return;
			
			uni.navigateTo({
				url: `/pages/order/create?goods_id=${this.id}&sku_id=${this.sku.id || ''}`
			});
		},
		// 检测是否已登录
		loginCheck() {
			if (!this.islogin) {
				let _this = this;
				uni.showModal({
					title: '授权登录',
					success: function(res) {
						if (res.confirm) {
							_this.$api.tologin();
						}
					}
				});
				return false;
			}
			
			return true;
		}
	}
};
</script>

<style lang="scss">
page {
	background: $page-color-base;
	padding-bottom: 120rpx;
}

contact-button {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 50px;
	height: 50px;
}

.fixed-top {
	bottom: 230rpx;
}

/* 01. 轮播区 */
.swiper-area {
	height: 720rpx;
	top: 0;
	z-index: -1;
}

/* #ifndef MP */
.swiper-area {
	margin-top: calc(44px + env(safe-area-inset-top));
	margin-top: 44px;
}
/* #endif */

/* #ifdef APP-PLUS */
.swiper-area {
	margin-top: 0;
}
/* #endif */

/* 02. 商品数据区 */
.goods-area {
	margin-top: 720rpx;

	.price-box {
		display: flex;
		align-items: baseline;
	}

	.title {
		color: $font-color-dark;
		height: 46rpx;
		line-height: 46rpx;
	}
}

.share-area {
	.vertical-line {
		right: 50%;
		height: 40%;
	}
}

/* 03. 规格区 */
.sku-area .active {
	background: $base-color;
	color: #fff !important;
}

/* 04. 服务区 */
.icon-detail {
	right: 30rpx;
	top: 24rpx;
}

/* 05. 评价 */
.evaluate-area {
	.portrait {
		flex-shrink: 0;
		width: 80rpx;
		height: 80rpx;
	}

	.right-area {
		image {
			margin-right: 10rpx;
			margin-bottom: 10rpx;
			height: 200rpx;
			width: 30%;
		}
	}
}

/* 06. 详情区 */
.detail-area {
	.d-header {
		font-size: $font-base + 2upx;
		color: $font-color-dark;
		position: relative;

		text {
			padding: 0 20rpx;
			background: #fff;
			position: relative;
			z-index: 1;
		}

		&:after {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translateX(-50%);
			width: 300rpx;
			height: 0;
			content: '';
			border-bottom: 1px solid #ccc;
		}
	}

	/* 产品详情 */
	.pro-detail {
		width: 100%;
		overflow: hidden;
		-webkit-touch-callout: none;

		img {
			width: 100%;
			max-width: 100%;
			overflow: hidden;
		}
	}
}

/* 07. 操作区 */
.oper-area {
	left: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.95);
	box-shadow: 0 0 20rpx 0 #f0f0f0;
	height: 100rpx;
	z-index: 95;

	.btn-area {
		font-size: $font-sm;
		color: $font-color-base;
		width: 96rpx;

		.iconfont {
			font-size: 40rpx;
			line-height: 48rpx;
		}
	}
}

/* 优惠券区 */
.coupon-area {
	max-height: 60vh;
	min-height: 30vh;

	.coupon-item {
		margin-bottom: 20rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.content {
			&:after {
				position: absolute;
				left: 0;
				bottom: 0;
				content: '';
				width: 100%;
				height: 0;
				border-bottom: 1px dashed #f3f3f3;
				transform: scaleY(50%);
			}
		}

		.circle {
			position: absolute;
			bottom: -10rpx;
			z-index: 10;
			width: 20rpx;
			height: 20rpx;
			background: #f5f5f5;
			border-radius: 50%;

			&.r {
				right: -6rpx;
			}

			&.l {
				left: -6rpx;
			}
		}
	}
}
</style>
