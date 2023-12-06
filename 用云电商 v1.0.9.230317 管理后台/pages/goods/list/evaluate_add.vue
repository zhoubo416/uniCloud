<template>
	<div class="container add_edit">
		<el-form :model="form" ref="ruleForm" label-width="100px">
			<el-form-item label="用户名称"><el-input v-model="form.member_name" placeholder="请输入名称"></el-input></el-form-item>
			<el-form-item label="用户头像">
				<uni-file-picker v-model="imageValueUser" fileMediatype="image" returnType="object" :image-styles="imageStyle" @success="imgUpload" />
			</el-form-item>
			<el-form-item label="订单号"><el-input v-model="form.order_id" placeholder="请输入订单号"></el-input></el-form-item>
			<el-form-item label="评论星数">
				<el-rate v-model="form.review_cnt" :colors="colors" class="margin_t_10" show-text :texts="['差评', '中评', '中评', '好评', '好评']"></el-rate>
			</el-form-item>
			<el-form-item label="评价内容"><el-input type="textarea" :rows="3" v-model="form.review_content" placeholder="请输入内容"></el-input></el-form-item>
			<el-form-item label="晒图">
				<uni-file-picker v-model="imageValueEvaluate" fileMediatype="image" returnType="array" :image-styles="imageStyle" @delete="imgDelete" />
			</el-form-item>
			<el-form-item label="备注"><el-input v-model="form.remark" placeholder="请输入备注"></el-input></el-form-item>
			<el-form-item label="状态">
				<el-switch v-model="form.state" active-color="#ff6a6c" inactive-color="#bbb" active-value="显示" inactive-value="隐藏"></el-switch>
			</el-form-item>
			<el-form-item>
				<el-button class="confirm_btn" @click="submitForm('ruleForm')">确 定</el-button>
				<el-button @click="returnPage">返回列表</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import bus from '@/common/bus';
const __name = 'usemall-goods-comment';
export default {
	data() {
		return {
			form: {
				goods_id: '',
				member_name: '',
				member_headimg: '',
				order_id: '',
				review_cnt: 0,
				review_content: '',
				review_imgs: '',
				remark: '',
				state: '显示'
			},
			imageStyle: {
				height: '150px',
				width: '150px'
			},
			imageValueUser: null,
			colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
			imageValueEvaluate: []
		};
	},
	methods: {
		submitForm(formName) {
			this.$refs[formName].validate(valid => {
				if (valid) {
					switch (this.form.review_cnt) {
						case 1:
							this.form.review_type = '差评';
							break;
						case 2:
						case 3:
							this.form.review_type = '中评';
							break;
						case 4:
						case 5:
							this.form.review_type = '好评';
							break;
					}

					this.form.review_imgs = this.imageValueEvaluate.map(x => x.url);
					this.form.goods_id = this.$route.query.id;
					if (!this.form.goods_id) {
						this.$message.error('评价商品ID不存在');
						return;
					}

					this.$db[__name].add(this.form).then(res => {
						if (res.code == 200) {
							this.$message({
								message: '评价成功',
								type: 'success'
							});
							this.returnPage();
						}
					});
				}
			});
		},
		imgUpload(e) {
			this.form.member_headimg = e.tempFilePaths[0];
		},
		imgDelete(e) {
			this.imageValueEvaluate.splice(this.imageValueEvaluate.findIndex(x => x.url == e.url), 1);
		},
		returnPage() {
			bus.$emit('tab-close');
			this.$router.push('/pages/goods/list/goods_list');
		}
	}
};
</script>

<style></style>
