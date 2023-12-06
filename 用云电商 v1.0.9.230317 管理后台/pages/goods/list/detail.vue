<template>
	<div>
		<el-form label-width="150px">
			<div class="container">
				<h3 class="margin_b_20">主图</h3>
				<el-form-item><uni-file-picker v-model="imageValue" fileMediatype="image" returnType="array"
						:image-styles="imageStyle" @delete="imgDelete" /></el-form-item>
			</div>
			<div class=" container">
				<h3 class="margin_b_20">商品详情</h3>
				<el-form-item>
					<div id="wangeditor" class="editor">
						<div ref="editorElem"></div>
					</div>
				</el-form-item>
			</div>
		</el-form>
	</div>
</template>

<script>
	import E from 'wangeditor';
	export default {
		data() {
			return {
				imageValue: [],
				imageStyle: {
					height: '150px',
					width: '150px'
				},
				editor: null,
				editorContent: ''
			};
		},
		props: ['catchData'],
		methods: {
			submitData(callback) {
				if (this.imageValue.length < 1) {
					this.$message({
						message: '请选择主图',
						type: 'warning'
					});
					this.$emit('detail');
					return;
				}
				if (!this.editorContent) {
					this.$message({
						message: '请输入商品详情',
						type: 'warning'
					});
					this.$emit('detail');
					return;
				}

				if (typeof callback === 'function') {
					callback({
						content: this.editorContent,
						imgs: this.imageValue
					});
				}
			},
			getData(callback) {
				this.submitData(callback);
			},
			setData(data) {
				this.imageValue = data.goods.imgs;

				if (data.goods_detail && data.goods_detail.desc_mobile) {
					this.editor.txt.html(data.goods_detail.desc_mobile);
					this.editorContent = data.goods_detail.desc_mobile;
				}
			},
			imgDelete(e) {
				this.imageValue.splice(this.imageValue.findIndex(x => x.url == e.url), 1);
			}
		},
		mounted() {
			let $this = this;

			this.editor = new E(this.$refs.editorElem);
			// 编辑器的事件，每次改变会获取其html内容
			this.editor.customConfig.onchange = html => {
				this.editorContent = html;
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

<style></style>
