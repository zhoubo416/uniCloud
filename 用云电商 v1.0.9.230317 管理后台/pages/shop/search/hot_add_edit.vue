<template>
	<div class="container add_edit">
		<el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px">
			<el-form-item label="关键字" prop="keyword" ref="keyword"><el-input v-model="form.keyword"></el-input></el-form-item>
			<el-form-item label="排序"><el-input type="number" v-model.number="form.sort" min="0" placeholder="请输入排序"></el-input></el-form-item>
			<el-form-item>
				<el-button class="confirm_btn" @click="submitForm('ruleForm')">确 定</el-button>
				<el-button @click="returnPage">返回列表</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import bus from '@/common/bus';
const __name = 'usemall-search-hot';
export default {
	data() {
		return {
			dataId: '',
			form: {
				search_cnt: 0,
				keyword: '',
				sort: 0,
			},
			rules: {
				keyword: [
					{
						required: true,
						message: '关键字不能为空',
						trigger: 'change'
					}
				]
			}
		};
	},
	methods: {
		async loadData() {
			if (!this.dataId) {
				return;
			}

			await this.$db[__name].tofirst(this.dataId).then(res => {
				if (res.code == 200) {
					for (let item in this.form) {
						this.form[item] = res.datas[item];
					}
					this.imageValue = {};
					this.imageValue.url = this.form.img;
				}
			});
		},
		submitForm(formName) {
			this.$refs[formName].validate((valid, obj) => {
				// 默认获取第一个未验证 form 属性名
				this.$api.set_unvalidated_form_focus(this, obj);
				if (valid) {
					if (!this.dataId) {
						this.$db[__name].add(this.form).then(res => {
							if (res.code == 200) {
								this.getOpenerEventChannel().emit('loadData');
								this.returnPage();
							}
						});
					} else {
						this.$db[__name].update(this.dataId, this.form).then(res => {
							if (res.code == 200) {
								this.getOpenerEventChannel().emit('loadData');
								this.returnPage();
							}
						});
					}
				}
			});
		},
		returnPage() {
			bus.$emit('tab-close');
			this.$router.push('/pages/shop/search/page');
		}
	},
	created() {
		this.dataId = this.$route.query.id || '';
		this.loadData();
	}
};
</script>

<style  ></style>
