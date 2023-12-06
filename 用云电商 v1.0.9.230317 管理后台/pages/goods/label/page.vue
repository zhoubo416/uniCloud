<template>
	<div>
		<el-tabs v-model="tab" @tab-click="cutTabs">
			<el-tab-pane :label="`商品标签`" name="goodsTag"><goods-tag v-if="tab == 'goodsTag'"></goods-tag></el-tab-pane>
			<el-tab-pane :label="`服务标签`" name="serveTag"><serve-tag v-if="tab == 'serveTag'"></serve-tag></el-tab-pane>
		</el-tabs>
	</div>
</template>

<script>
import goodsTag from './goods_tag';
import serveTag from './serve_tag';
export default {
	components: {
		goodsTag,
		serveTag
	},
	data() {
		return {
			tab: ''
		};
	},
	methods: {
		cutTabs(res) {
			uni.setStorage({
				key: 'label_page_tab',
				data: res.name
			});
		}
	},
	mounted() {
		this.tab = uni.getStorageSync('label_page_tab') || 'goodsTag';
	}
};
</script>

<style  ></style>
