<template>
    <div>
        <el-tabs v-model="tab" @tab-click="cutTabs">
            <el-tab-pane :label="`搜索列表`" name="list">
                <list v-if="tab == 'list'" />
            </el-tab-pane>
            <el-tab-pane :label="`热门搜索`" name="hot">
                <hot v-if="tab == 'hot'" />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import list from "./list";
import hot from "./hot";
export default {
	components: {
	    list,
	    hot
	},
    data() {
        return {
            tab: ""
        };
    },
	methods: {
		cutTabs(res) {
			uni.setStorage({
				key: 'search_page_tab',
				data: res.name
			});
		}
	},
	mounted() {
		this.tab = uni.getStorageSync('search_page_tab') || 'list';
	}
};
</script>

<style  >
</style>