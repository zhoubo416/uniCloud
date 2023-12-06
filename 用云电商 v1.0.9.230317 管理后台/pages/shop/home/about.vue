<template>
	<div class="container add_edit">
		<el-form :model="form" ref="ruleForm" label-width="50px">
			<el-form-item label="类型">
				<el-radio-group v-model="form.type">
					<el-radio label="网页">网页</el-radio>
					<el-radio label="内容">内容</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="网页" v-show="form.type == '网页'"><el-input v-model="form.url"></el-input></el-form-item>
			<el-form-item label="内容" v-show="form.type == '内容'">
				<div id="wangeditor" class="editor">
					<div ref="editorElem" style="text-align:left;"></div>
				</div>
			</el-form-item>
			<el-form-item><el-button class="confirm_btn" @click="submitForm('ruleForm')">提 交</el-button></el-form-item>
		</el-form>
	</div>
</template>

<script>
	import E from 'wangeditor';
	const __name = 'usemall-app-about';
	export default {
		data() {
			return {
				dataId: '',
				form: {
					type: '网页',
					url: '',
					content: '',
					state: '启用'
				},
				editor: null
			};
		},
		props: ['catchData'],
		methods: {
			async loadData() {
				await this.$db[__name].tofirst().then(res => {
					if (res.code == 200) {
						for (let item in this.form) {
							this.form[item] = res.datas[item];
						}

						this.dataId = res.datas._id;

						if (res.datas && res.datas.content) {
							this.editor.txt.html(res.datas.content);
						}
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
									this.$message({
										message: '操作成功',
										type: 'success'
									});
									this.loadData();
								}
							});
						} else {
							this.$db[__name].update(this.dataId, this.form).then(res => {
								if (res.code == 200) {
									this.$message({
										message: '操作成功',
										type: 'success'
									});
									this.loadData();
								}
							});
						}
					}
				});
			}
		},
		created() {
			this.loadData();
		},
		mounted() {
			let $this = this;

			this.editor = new E(this.$refs.editorElem);
			// 编辑器的事件，每次改变会获取其html内容
			this.editor.customConfig.onchange = html => {
				this.form.content = html;
			};

			// 将图片大小限制为 2M
			this.editor.customConfig.uploadImgMaxSize = 2 * 1024 * 1024;
			// 限制一次最多上传 10张图片
			this.editor.customConfig.uploadImgMaxLength = 10;

			this.editor.customConfig.customAlert = function(info) {
				// info 是需要提示的内容
				alert('自定义提示：' + info);
			};
			this.editor.customConfig.customUploadImg = function(files, insert) {
				// files 是 input 中选中的文件列表
				// insert 是获取图片 url 后，插入到编辑器的方法
				for (var i = 0; i < files.length; i++) {
					uniCloud.uploadFile({
						filePath: window.URL.createObjectURL(files[i]),
						cloudPath: files[i].name,
						fail(err) {},
						success(res) {
							// 上传代码返回结果之后，将图片插入到编辑器中
							insert(res.fileID);
						}
					});
				}
			};

			this.editor.customConfig.menus = [
				// 菜单配置
				'head', // 标题
				'bold', // 粗体
				'fontSize', // 字号
				'fontName', // 字体
				'italic', // 斜体
				'underline', // 下划线
				'strikeThrough', // 删除线
				'foreColor', // 文字颜色
				'backColor', // 背景颜色
				'link', // 插入链接
				'list', // 列表
				'justify', // 对齐方式
				'quote', // 引用
				'emoticon', // 表情
				'image', // 插入图片
				'table', // 表格
				'code', // 插入代码
				'undo', // 撤销
				'redo' // 重复
			];
			this.editor.create(); // 创建富文本实例
		}
	};
</script>

<style>
</style>
