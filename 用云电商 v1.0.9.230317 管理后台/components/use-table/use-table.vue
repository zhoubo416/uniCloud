<template>
	<div ref="useTable"></div>
</template>

<script>
import bus from '@/common/bus';
export default {
	props: {
		navHeight: {
			type: Number,
			default: 0
		},
		bottom: {
			type: Number,
			default: 15
		},
		right: {
			type: Number,
			default: 15
		},
		top: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			height: 0,
			tblHeight: 0,
			body: null,
			containers: [],
			tableObj: null,
			tableButtonHeight: 0,
			tablePaginationHeight: 0
		};
	},
	mounted() {
		this.body = document.getElementsByTagName('uni-page-body')[0];
		this.__height = this.body.clientHeight;

		this.containers = this.$refs.useTable.parentElement.querySelectorAll('.container');

		this.tableStyle();
		this.tableChange();

		window.onresize = () => {
			this.tableChange();
		};
	},

	methods: {
		tableStyle() {
			if (this.tableObj && this.tableObj.ele) {
				return;
			}
			this.containers.forEach(ele => {
				if (![...ele.classList].includes('use-table')) {
					this.__height -= ele.clientHeight - 15;
				} else {
					this.tableObj = { offset: this.$api.offset(ele), ele };
				}
			});
			this.tableObj.ele.style.position = 'fixed';
			this.tableObj.ele.style.top = this.tableObj.offset.t + 'px';
			this.tableObj.ele.style.left = this.tableObj.offset.l + 'px';
			this.tableObj.ele.style.bottom = this.bottom + 'px';
			this.tableObj.ele.style.right = this.right + 'px';

			if (this.tableObj.ele.childNodes.length) {
				this.tableObj.ele.childNodes.forEach(ele => {
					if ([...ele.classList].includes('el-pagination')) {
						this.tablePaginationHeight = 35;
					} else if ([...ele.classList].includes('el-table')) {
						// 当前表格
					} else {
						this.tableButtonHeight = 55;
					}
				});
			}
		},
		tableChange() {
			// 40 为上下 padding 20
			this.tblHeight = this.tableObj.ele.clientHeight - 40 - this.tableButtonHeight - this.tablePaginationHeight;
			this.tableObj.ele.querySelector('.el-table').style.height = this.tblHeight + 'px';
		}
	},
	created() {
		bus.$on('fold', res => {
			if (res) {
				this.tableObj.ele.style.left = this.tableObj.offset.l - 116 + 'px';
			} else {
				this.tableObj.ele.style.left = this.tableObj.offset.l + 'px';
			}
		});
	}
};
</script>

<style></style>
