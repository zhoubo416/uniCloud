<template>
	<div class="container">
		<el-form :model="form">
			<h3>订单参数</h3>
			<el-form-item>
				<div class="dflex margin_t_20">
					<div class="front_txt">下单后，超过</div>
					<el-input class="input" size="mini" min="0" v-model.number="form.unpay_overdue_minute"
						type="number"></el-input>
					<div class="rear_txt">分钟未付款，自动取消订单</div>
				</div>
			</el-form-item>
			<el-form-item><el-button class="confirm_btn" @click="save">保 存</el-button></el-form-item>
		</el-form>
	</div>
</template>

<script>
	const __name = 'usemall-order-parameter';
	export default {
		data() {
			return {
				dataId: '',
				form: {
					unpay_overdue_minute: 0
				}
			};
		},
		methods: {
			async loadData() {
				await this.$db[__name].tofirst().then(res => {
					if (res.code == 200) {
						for (let item in this.form) {
							this.form[item] = res.datas[item];
						}
						this.dataId = res.datas._id;
					}
				});
			},
			save() {
				if (!this.dataId) {
					this.$db[__name].add(this.form).then(res => {
						if (res.code == 200) {
							this.$message({
								message: '保存成功',
								type: 'success'
							});
						}
					});
				} else {
					this.$db[__name].update(this.dataId, this.form).then(res => {
						if (res.code == 200) {
							this.$message({
								message: '保存成功',
								type: 'success'
							});
						}
					});
				}
			}
		},
		created() {
			this.loadData();
		}
	};
</script>

<style>
	>>>.input {
		width: 70px;
		margin: 0 10px;
	}

	>>>.input .el-input__inner {
		width: 100%;
		background-color: #f6f6f6;
		border-color: #f6f6f6;
		padding: 0 0 0 15px;
	}

	.front_txt {
		width: 200px;
		text-align: right;
		font-size: 13px;
	}

	.rear_txt {
		font-size: 13px;
		display: flex;
		align-items: center;
	}

	.confirm_btn {
		margin-left: 210px;
	}
</style>
