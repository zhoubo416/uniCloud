<template>
    <div>
        <el-tabs v-model="tab" @tab-click="cutTabs">
            <el-tab-pane label="轮播图" name="carousel">
                <carousel v-if="tab == 'carousel'"></carousel>
            </el-tab-pane>
            <el-tab-pane label="分享设置" name="share">
                <share v-if="tab == 'share'"></share>
            </el-tab-pane>
            <el-tab-pane label="关于我们" name="about">
                <about v-if="tab == 'about'"></about>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import carousel from "./carousel";
import share from "./share_set";
import about from "./about";

export default {
    components: { carousel, share, about },
    data() {
        return {
            tab: ""
        };
    },
	methods: {
		cutTabs(res) {
			uni.setStorage({
				key: 'shop_page_tab',
				data: res.name
			});
		}
	},
	mounted() {
		this.tab = uni.getStorageSync('shop_page_tab') || 'carousel';
	}
};
</script>

<style  >
</style>    