<template>
	<div class="goods_list_add_edit">
		<el-tabs v-model="tab" :before-leave="onTab">
			<el-tab-pane :label="`基本`" name="basic"><basic v-if="tab" ref="basic"></basic></el-tab-pane>
			<el-tab-pane :label="`详情`" name="detail"><detail v-if="tab" ref="detail" @detail="detail"></detail></el-tab-pane>
			<el-tab-pane :label="`商品SKU`" name="sku"><sku v-if="tab" ref="sku"></sku></el-tab-pane>
			<el-tab-pane :label="`分享设置`" name="shareSet"><shareSet v-if="tab" ref="shareSet"></shareSet></el-tab-pane>
			<div class="btn">
				<el-button class="confirm_btn" @click="submitForm">确 定</el-button>
				<el-button @click="returnPage">返回列表</el-button>
			</div>
		</el-tabs>
	</div>
</template>

<script>
import bus from '@/common/bus';
import basic from './basic';
import detail from './detail.vue';
import sku from './sku';
import shareSet from './share_set';
const __goodsCategory = 'usemall-goods-category';
const __tag = 'usemall-goods-tag';
const __name = 'usemall-goods';
export default {
	components: {
		basic,
		detail,
		sku,
		shareSet
	},
	data() {
		return {
			dataId: '',
			tab: '',
			search_req: {
				page: 1,
				rows: 500
			}
		};
	},
	methods: {
		async loadData() {
			let category = this.$db[__goodsCategory].totree({ orderby: 'sort asc', startWith: 'pid == ""' });
			let tag = this.$db[__tag].tolist({ page: 1, rows: 500 });
			let datas = await Promise.all([category, tag]);
			this.$refs.basic.setBaseData(datas);

			if (!this.dataId) {
				return;
			}
			
			this.$func.useadmin.call('goods/detail', { goods_id: this.dataId }).then(res => {
				if (res.code == 200) {
					this.$refs.basic.setData(res.datas.goods);
					this.$refs.detail.setData(res.datas);
					this.$refs.shareSet.setData(res.datas.goods);
					this.$refs.sku.setData(res.datas);
				}
			});
		},
		detail() {
			this.tab = 'detail';
		},
		onTab() {
			if (!(this.tab && this.$refs.basic)) return;
			let flag = true;
			this.$refs.basic.getData((res, valid) => {
				flag = valid;
				if ((flag && res.price <= 0) || res.price == '') {
					this.$message({
						message: '商城价必须大于0',
						type: 'success'
					});
					flag = false;
				}

				if (flag) {
					this.$refs.sku.setGoods(res);
				}
			});

			return flag;
		},
		submitForm() {
			let goods = {};
			let detail = {};
			let skus = [];
			this.$refs.basic.getData(res => {
				goods = res;

				this.$refs.shareSet.getData(res => {
					goods.share_title = res.share_title;
					goods.share_img = res.share_img;
					goods.share_desc = res.share_desc;
				});

				this.$refs.sku.getData((res, json_datas) => {
					skus = res;
					goods.skus = json_datas;
				});

				this.$refs.detail.getData(res => {
					detail.desc_mobile = res.content;
					// let imgs = [];
					// res.imgs.forEach(data => {
					// 	imgs.push(data.url);
					// });
					goods.img = res.imgs[0].url;
					goods.imgs = res.imgs;

					for (const key in goods) {
						if (goods.hasOwnProperty(key)) {
							if (typeof goods[key] === 'string') {
								if (/^[0-9]*$/.test(goods[key])) {
									goods[key] = parseInt(goods[key]);
								} else if (/^[0-9]+(.[0-9]{1,3})?$/.test(goods[key])) {
									goods[key] = parseFloat(goods[key]);
								}
							}
						}
					}

					detail.desc_mobile = detail.desc_mobile.replace(/inline-/gi, '');
					
					if (!this.dataId) {
						this.$func.useadmin
							.call('goods/add', {
								goods,
								detail,
								skus
							})
							.then(res => {
								if (res.code == 200) {
									this.$message({
										message: res.datas.msg,
										type: 'success'
									});
									this.returnPage();
								}
							});
					} else {
						this.$func.useadmin
							.call('goods/edit', {
								goods_id: this.dataId,
								goods,
								detail,
								skus
							})
							.then(res => {
								if (res.code == 200) {
									this.$message({
										message: res.datas.msg,
										type: 'success'
									});
									this.returnPage();
								}
							});
					}
				});
			});
			return;
		},
		returnPage() {
			bus.$emit('tab-close');
			this.$router.push('/pages/goods/list/goods_list');
		}
	},
	created() {
		this.dataId = this.$route.query.id || '';
		this.loadData();
	},
	mounted() {
		this.tab = 'basic';

		const ele = document.querySelector('.el-tabs__content');
		let offset = this.$api.offset(ele);

		ele.style.position = 'fixed';
		ele.style.top = offset.t + 29 + 'px';
		ele.style.left = offset.l + 'px';
		ele.style.bottom = '16px';
		ele.style.right = '16px';
		ele.style.overflow = 'auto';
		ele.style.overflow = 'overlay';
		
		bus.$on('fold', res => {
			if (res) {
				ele.style.left = '80px';
			} else {
				ele.style.left = 'calc(16px + var(--window-left))';
			}
		});
	}
};
</script>

<style  >
.goods_list_add_edit .btn {
	background-color: #fff;
	padding-left: 170px;
	margin-top: -20px;
	border-radius: 10px;
	padding-bottom: 42px;
}

.goods_list_add_edit >>>.el-tabs__content{
	transition: all 0.3s ease-in-out;
}
</style>
