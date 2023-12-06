<template>
	<div class="container add_edit">
		<el-form :model="form" ref="ruleForm" label-width="150px">
			<div>
				<h3 class="margin_b_20">分享</h3>
				<div>
					<el-form-item label="分享标题">
						<el-input v-model="form.share_title"></el-input>
						<div class="remark_txt">如果不填写，默认为商品名称</div>
					</el-form-item>
					<el-form-item label="分享图标">
						<uni-file-picker v-model="imageValue" fileMediatype="image" returnType="object" :image-styles="imageStyle" @success="imgUpload" />
						<div class="remark_txt">如果不选择，默认为商品缩略主图片</div>
					</el-form-item>
					<el-form-item label="分享描述">
						<el-input type="textarea" :autosize="{ minRows: 3 }" v-model="form.share_desc"></el-input>
						<div class="remark_txt">如果不填写，则默认为 推广词</div>
					</el-form-item>
				</div>
			</div>
		</el-form>
	</div>
</template>

<script>
export default {
	data() {
		return {
			form: {
				share_title: '',
				share_img: '',
				share_desc: ''
			},
			imageValue: null,
			imageStyle: {
				height: '150px',
				width: '150px'
			}
		};
	},
	methods: {
		submitData(callback) {
			this.$refs['ruleForm'].validate(valid => {
				if (valid) {
					if (typeof callback === "function") {
						callback(this.form);
					}
				}
			});
		},
		getData(callback) {
			this.submitData(callback);
		},
		setData(data) {
			this.form = data;
			this.imageValue = {};
			this.imageValue.url = this.form.share_img;
		},
		imgUpload(e) {
			this.form.share_img = e.tempFilePaths[0];
		}
	}
};
</script>

<style  ></style>
