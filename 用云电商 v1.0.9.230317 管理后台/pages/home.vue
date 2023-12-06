<template>
	<div>
		<el-row>
			<el-col :span="24">
				<div class="separate_page">
					<h3>用户统计</h3>
					<div class="dflex">
						<div class="tag">
							<i class="iconfont iconyonghu"></i>
							<div>
								<div class="tag_title">总用户数</div>
								<v-countup class="tag_data" :start-value="start" :end-value="member_sta.member_cnt"
									:options="options"></v-countup>
							</div>
						</div>
						<div class="tag">
							<i class="iconfont iconshijian"></i>
							<div>
								<div class="tag_title">近7天活跃量</div>
								<v-countup class="tag_data" :start-value="start" :end-value="member_sta.member_cnt_7"
									:options="options"></v-countup>
							</div>
						</div>
						<div class="tag">
							<i class="iconfont iconquanbudingdan"></i>
							<div>
								<div class="tag_title">昨日新增量</div>
								<v-countup class="tag_data" :start-value="start"
									:end-value="member_sta.member_cnt_yesterday" :options="options"></v-countup>
							</div>
						</div>
						<div class="tag">
							<i class="iconfont iconxiadan"></i>
							<div>
								<div class="tag_title">订单数</div>
								<v-countup class="tag_data" :start-value="start" :end-value="member_sta.order_cnt"
									:options="options"></v-countup>
							</div>
						</div>
						<div class="tag">
							<i class="iconfont iconxiaofei"></i>
							<div>
								<div class="tag_title">今日付款数</div>
								<v-countup class="tag_data" :start-value="start" :end-value="member_sta.pay_cnt"
									:options="options"></v-countup>
							</div>
						</div>
						<div class="tag">
							<i class="iconfont iconxiaofei"></i>
							<div>
								<div class="tag_title">今日总消费</div>
								<v-countup class="tag_data" :start-value="start" :end-value="member_sta.pay_money"
									:options="options"></v-countup>
							</div>
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
		<el-row :gutter="16">
			<el-col :span="5">
				<div class="separate_page stats_area">
					<h3>订单统计</h3>
					<div class="order">
						<div class="dflex">
							<div class="circle_txt">总</div>
							<div>
								<div class="order_title">总单数</div>
								<v-countup class="order_data" :start-value="start" :end-value="order_sta.order_cnt"
									:options="options"></v-countup>
							</div>
						</div>
						<div class="dflex">
							<div class="circle_txt">单</div>
							<div>
								<div class="order_title">客单价</div>
								<v-countup class="order_data" :start-value="start"
									:end-value="order_sta.pay_money / order_sta.pay_cnt" :decimals="2"
									:options="options_price"></v-countup>
							</div>
						</div>
						<div class="dflex">
							<div class="circle_txt">支</div>
							<div>
								<div class="order_title">支付数</div>
								<v-countup class="order_data" :start-value="start" :end-value="order_sta.pay_cnt"
									:options="options"></v-countup>
							</div>
						</div>
						<div class="dflex">
							<div class="circle_txt">金</div>
							<div>
								<div class="order_title">付款金额</div>
								<v-countup class="order_data" :start-value="start" :end-value="order_sta.pay_money"
									:decimals="2" :options="options_price"></v-countup>
							</div>
						</div>
						<div class="dflex">
							<div class="circle_txt">退</div>
							<div>
								<div class="order_title">退款数</div>
								<v-countup class="order_data" :start-value="start" :end-value="order_sta.refund_cnt"
									:options="options"></v-countup>
							</div>
						</div>
					</div>
				</div>
			</el-col>
			<el-col :span="19">
				<div class="separate_page stats_area">
					<div class="dflex_sb">
						<h3>日/月订单数</h3>
						<div>
							<el-button size="mini" :class="{ active: days == '日' }" @click="day" round>日</el-button>
							<el-button size="mini" :class="{ active: days == '月' }" @click="month" round>月</el-button>
						</div>
					</div>
					<div id="create-line-line" class="echart_line_line"></div>
				</div>
			</el-col>
		</el-row>
		<el-row :gutter="16">
			<el-col :span="7">
				<div class="separate_page ranking_area">
					<div class="dflex_sb">
						<h3>访客排行</h3>
						<el-select size="small" style="width: 100px;" class="state_search" v-model="visit_state_search"
							@change="get_visit_stats">
							<el-option v-for="(item, idx) in options_state" :key="idx" :label="item.label"
								:value="item.value"></el-option>
						</el-select>
					</div>
					<el-table height="25rem" :data="tableData_visit" highlight-current-row class="home_table card">
						<el-table-column property="name" label="名称" align="center" class="aaa"></el-table-column>
						<el-table-column property="state" label="状态" align="center"></el-table-column>
						<el-table-column property="visit" label="访客数" align="center"></el-table-column>
						<el-table-column property="browse" label="浏览数" align="center"></el-table-column>
					</el-table>
				</div>
			</el-col>
			<el-col :span="7">
				<div class="separate_page ranking_area">
					<div class="dflex_sb">
						<h3>浏览排行</h3>
						<el-select size="small" style="width: 100px;" class="state_search" v-model="browse_state_search"
							@change="get_browse_stats">
							<el-option v-for="(item, idx) in options_state" :key="idx" :label="item.label"
								:value="item.value"></el-option>
						</el-select>
					</div>
					<el-table height="25rem" :data="tableData_browse" highlight-current-row class="home_table card">
						<el-table-column property="name" label="名称" align="center"></el-table-column>
						<el-table-column property="state" label="状态" align="center"></el-table-column>
						<el-table-column property="browse" label="浏览数" align="center"></el-table-column>
						<el-table-column property="visit" label="访客数" align="center"></el-table-column>
					</el-table>
				</div>
			</el-col>
			<el-col :span="10">
				<div class="separate_page ranking_area">
					<h3>商品类型分布</h3>
					<div id="create-pie" class="echart_pie"></div>
				</div>
			</el-col>
		</el-row>
		<el-row>
			<el-col :span="24">
				<div class="separate_page">
					<h3>会员省份分布</h3>
					<div id="create-map" class="echart_map"></div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import vCountup from 'vue-countupjs';
	import echarts from 'echarts';
	import china from 'echarts/map/json/china.json';
	echarts.registerMap('china', china);
	export default {
		components: {
			vCountup
		},
		data() {
			return {
				start: 0,
				options: {
					useEasing: true, // 缓动动画 easing
					useGrouping: true, // 1,000,000 vs 1000000
					separator: ',', // 数字分隔符
					decimal: '.', // 小数分隔符
					prefix: '', // 前缀
					suffix: '' // 后缀
				},
				options_price: {
					useEasing: true, // 缓动动画 easing
					useGrouping: true, // 1,000,000 vs 1000000
					separator: ',', // 数字分隔符
					decimal: '.', // 小数分隔符
					prefix: '￥', // 前缀
					suffix: '' // 后缀
				},
				member_sta: {},
				order_sta: {},
				options_line_line: [],
				echart_line_line: null,
				days: '日',
				tableData_visit: [],
				tableData_browse: [],
				options_state: [{
						value: '全部',
						label: '全部'
					},
					{
						value: '待审核',
						label: '待审核'
					},
					{
						value: '销售中',
						label: '销售中'
					},
					{
						value: '已下架',
						label: '已下架'
					}
				],
				visit_state_search: '全部',
				browse_state_search: '全部'
			};
		},
		methods: {
			create_line_line(callback) {
				let _this = this;

				this.echart_line_line = this.$echarts.init(document.getElementById('create-line-line'));

				//对话框图片
				var uploadedDataURL = '/asset/get/s/data-1547533200844-7eBMgp66l.png';

				this.options_line_line = {
					backgroundColor: '#FFF',
					grid: {
						top: '9%',
						bottom: '19%',
						left: '6%',
						right: '4%'
					},
					tooltip: {
						trigger: 'axis',
						label: {
							show: true
						},
						formatter: function(params) {
							let str = '';

							str += params[0].data.name + '\n';
							params.forEach(item => {
								if (item.seriesName === '订单数') {
									str += item.seriesName + ' : ' + item.data.value + '' + '\n';
								} else if (item.seriesName === '支付数') {
									str += item.seriesName + ' : ' + item.data.value + '' + '\n';
									str += '支付金额' + ' : ￥' + item.data.money + '' + '\n';
								}
							});
							return str;
						}
					},
					legend: {
						data: ['订单数', '支付数'],
						top: '0%',
						textStyle: {
							color: '#000'
						}
					},
					xAxis: {
						boundaryGap: true, //默认，坐标轴留白策略
						axisLine: {
							show: false
						},
						splitLine: {
							show: false
						},
						axisTick: {
							show: false,
							alignWithLabel: true
						},
						data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
					},
					yAxis: {
						axisLine: {
							show: false
						},
						splitLine: {
							show: true,
							lineStyle: {
								type: 'dashed',
								color: '#d9d9d9'
							}
						},
						axisTick: {
							show: false
						},
						splitArea: {
							show: true,
							areaStyle: {
								color: '#fff'
							}
						}
					},
					series: [{
							smooth: true, //是否平滑曲线显示
							name: '订单数',
							type: 'line',
							symbol: 'circle',
							symbolSize: 7,
							lineStyle: {
								color: '#fd6b6c',
								shadowBlur: 12,
								shadowColor: '#fd6b6c',
								shadowOffsetX: 1,
								shadowOffsetY: 1
							},
							itemStyle: {
								color: '#fd6b6c',
								borderWidth: 1,
								borderColor: '#fd6b6c'
							},
							data: [600, 1000, 800, 1300, 1250, 1400, 1500, 1400, 1250, 1400, 1500, 2000]
						},
						{
							smooth: true, //是否平滑曲线显示
							name: '支付数',
							type: 'line',
							symbol: 'circle',
							symbolSize: 7,
							lineStyle: {
								color: '#07c160',
								shadowBlur: 12,
								shadowColor: '#07c160',
								shadowOffsetX: 1,
								shadowOffsetY: 1
							},
							itemStyle: {
								color: '#07c160',
								borderWidth: 1,
								borderColor: '#07c160'
							},
							data: [600, 1000, 800, 1300, 1250, 1400, 1500, 1400, 1250, 1400, 1500, 2000]
						}
					]
				};

				window.addEventListener('resize', () => {
					_this.echart_line_line.resize();
				});

				if (typeof callback === 'function') {
					callback();
				}
			},
			create_pie() {
				const myChart = this.$echarts.init(document.getElementById('create-pie'));

				const state = {
					code: 200,
					msg: '',
					datas: [{
						state: '已下架',
						cnt: 8
					}, {
						state: '销售中',
						cnt: 19
					}]
				};
				const category = {
					code: 200,
					msg: '',
					datas: [{
							name: '冰箱',
							state: '销售中',
							cnt: 1
						},
						{
							name: '微波炉',
							state: '已下架',
							cnt: 1
						},
						{
							name: '电视',
							state: '销售中',
							cnt: 1
						},
						{
							name: '相机',
							state: '已下架',
							cnt: 2
						},
						{
							name: '华为',
							state: '销售中',
							cnt: 3
						},
						{
							name: '小米',
							state: '销售中',
							cnt: 2
						},
						{
							name: '苹果',
							state: '销售中',
							cnt: 1
						},
						{
							name: '上衣',
							state: '销售中',
							cnt: 1
						},
						{
							name: '裤子',
							state: '已下架',
							cnt: 1
						},
						{
							name: '回力',
							state: '已下架',
							cnt: 1
						},
						{
							name: '回力',
							state: '销售中',
							cnt: 2
						},
						{
							name: '耐克',
							state: '销售中',
							cnt: 2
						},
						{
							name: '361°',
							state: '销售中',
							cnt: 2
						},
						{
							name: '行李箱',
							state: '已下架',
							cnt: 1
						},
						{
							name: '手提包',
							state: '已下架',
							cnt: 1
						},
						{
							name: '手提包',
							state: '销售中',
							cnt: 2
						},
						{
							name: null,
							state: '已下架',
							cnt: 1
						},
						{
							name: '耳钉',
							state: '销售中',
							cnt: 2
						}
					]
				};

				let echartData = {
					inner: [],
					outer: []
				};
				echartData.inner = [];
				echartData.outer = [];
				state.datas.forEach(_ => {
					echartData.inner.push({
						value: _.cnt,
						name: _.state
					});
				});
				category.datas.forEach(_ => {
					echartData.outer.push({
						value: _.cnt,
						name: _.name
					});
				});

				const option = {
					backgroundColor: '#fff',
					color: [
						'#2ec7c9',
						'#b6a2de',
						'#5ab1ef',
						'#ffb980',
						'#d87a80',
						'#8d98b3',
						'#FFEA01',
						'#B8D07C',
						'#fca4bb',
						'#dc69aa',
						'#07a2a4',
						'#9a7fd1',
						'#588dd5',
						'#f5994e',
						'#c05050',
						'#59678c',
						'#c9ab00',
						'#7eb00a',
						'#6f5553',
						'#c14089'
					],
					tooltip: {
						trigger: 'item',
						formatter: '{a} \n{b}: {c} ({d}%)'
					},
					series: [{
							name: '商品状态',
							type: 'pie',
							radius: [0, '35%'],
							itemStyle: {
								normal: {
									borderColor: '#fff',
									borderWidth: 2
								}
							},
							label: {
								normal: {
									position: 'inner'
								}
							},
							labelLine: {
								normal: {
									show: false
								}
							},
							data: echartData.inner
						},
						{
							name: '商品分类',
							type: 'pie',
							radius: ['45%', '55%'],
							data: echartData.outer,
							labelLine: {
								normal: {
									length: 20,
									length2: 140,
									lineStyle: {
										color: '#e6e6e6'
									}
								}
							},
							label: {
								normal: {
									formatter: params => {
										return '{icon|●}{name|' + params.name + '}{percent|' + params.percent
											.toFixed(1) + '%}{value|' + params.value + '}';
									},
									padding: [0, -130, 25, -130],
									rich: {
										color: '#333',
										icon: {
											fontSize: 16
										},
										name: {
											fontSize: 14,
											padding: [0, 5, 0, 5],
											color: '#666666'
										},
										percent: {
											color: '#333',
											padding: [0, 5, 0, 0]
										},
										value: {
											fontSize: 16,
											fontWeight: 'bold',
											color: '#333333'
										}
									}
								}
							}
						}
					]
				};

				myChart.setOption(option);
				window.addEventListener('resize', function() {
					myChart.resize();
				});
			},
			day() {
				this.days = '日';

				const res = {
					code: 200,
					msg: '',
					datas: [{
							time: '2021-07-13',
							order_cnt: 1,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-14',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-15',
							order_cnt: 2,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-16',
							order_cnt: 2,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-17',
							order_cnt: 1,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-18',
							order_cnt: 1,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-19',
							order_cnt: 5,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-20',
							order_cnt: 2,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-21',
							order_cnt: 6,
							pay_cnt: 1,
							pay_money: 0.01
						},
						{
							time: '2021-07-22',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-23',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-24',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-25',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-26',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-27',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-28',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-29',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-07-30',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-08-01',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-08-02',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-08-03',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-08-04',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						}
					]
				};
				if (res.code == 200) {
					this.options_line_line.xAxis.data = [];
					this.options_line_line.series[0].data = [];
					this.options_line_line.series[1].data = [];

					let today = new Date();
					for (let i = 30; i > 0; i--) {
						today = new Date();
						today.setTime(today.getTime() - 1000 * 60 * 60 * 24 * i);
						this.options_line_line.series[0].data.push({
							value: 0,
							name: today.format('yyyy年MM月dd日')
						});
						this.options_line_line.series[1].data.push({
							value: 0,
							money: 0
						});
						this.options_line_line.xAxis.data.push({
							value: today.format('dd'),
							time: today.format('yyyy-MM-dd')
						});
					}

					this.options_line_line.xAxis.data.forEach((x, i) => {
						let data = res.datas.find(d => d.time.split(' ')[0] == x.time);
						if (data) {
							this.options_line_line.series[0].data[i].value = data.order_cnt;
							this.options_line_line.series[1].data[i].value = data.pay_cnt;
							this.options_line_line.series[1].data[i].money = data.pay_money;
						}
					});
					this.echart_line_line.setOption(this.options_line_line);
				}
			},
			month() {
				this.days = '月';

				const res = {
					code: 200,
					msg: '',
					datas: [{
							time: '2021-07',
							order_cnt: 1,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-06',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-05',
							order_cnt: 2,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-04',
							order_cnt: 2,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-03',
							order_cnt: 1,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-02',
							order_cnt: 1,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2021-01',
							order_cnt: 5,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2020-12',
							order_cnt: 2,
							pay_cnt: 0,
							pay_money: 0.0
						},
						{
							time: '2020-10',
							order_cnt: 6,
							pay_cnt: 1,
							pay_money: 0.01
						},
						{
							time: '2020-09',
							order_cnt: 3,
							pay_cnt: 0,
							pay_money: 0.0
						}
					]
				};

				if (res.code == 200) {
					this.options_line_line.xAxis.data = [];
					this.options_line_line.series[0].data = [];
					this.options_line_line.series[1].data = [];
					let today = new Date();
					for (let i = 12; i > 0; i--) {
						today = new Date();
						today.setMonth(today.getMonth() - i);

						this.options_line_line.series[0].data.push({
							value: 0,
							name: today.format('yyyy年MM月')
						});
						this.options_line_line.series[1].data.push({
							value: 0,
							money: 0
						});
						this.options_line_line.xAxis.data.push({
							value: today.format('MM'),
							time: today.format('yyyy-MM')
						});
					}

					this.options_line_line.xAxis.data.forEach((x, i) => {
						let data = res.datas.find(d => d.time.split(' ')[0] == x.time);
						if (data) {
							this.options_line_line.series[0].data[i].value = data.order_cnt;
							this.options_line_line.series[1].data[i].value = data.pay_cnt;
							this.options_line_line.series[1].data[i].money = data.pay_money;
						}
					});
					this.echart_line_line.setOption(this.options_line_line);
				}
			},
			get_visit_stats() {
				const res = {
					code: 200,
					msg: '',
					datas: [{
							goods_id: 1057,
							name: 'Huawei/华为Mate30 全网通5G智能手机',
							state: '销售中',
							visit: 32,
							browse: 101.0
						},
						{
							goods_id: 1061,
							name: '无耳洞耳夹OL多圈925银针耳钉简约时尚耳饰品',
							state: '销售中',
							visit: 31,
							browse: 247.0
						},
						{
							goods_id: 1042,
							name: '上衣衬衫女',
							state: '销售中',
							visit: 24,
							browse: 97.0
						},
						{
							goods_id: 1037,
							name: '小米电视',
							state: '销售中',
							visit: 24,
							browse: 92.0
						},
						{
							goods_id: 1046,
							name: '361°篮球鞋',
							state: '销售中',
							visit: 24,
							browse: 126.0
						},
						{
							goods_id: 1035,
							name: '三星冰箱',
							state: '销售中',
							visit: 24,
							browse: 114.0
						},
						{
							goods_id: 1055,
							name: '361男鞋运动鞋',
							state: '销售中',
							visit: 21,
							browse: 41.0
						},
						{
							goods_id: 1050,
							name: '华为荣耀20',
							state: '销售中',
							visit: 19,
							browse: 131.0
						},
						{
							goods_id: 1054,
							name: '耐克男子运动鞋',
							state: '销售中',
							visit: 18,
							browse: 49.0
						},
						{
							goods_id: 1045,
							name: 'Nike男鞋',
							state: '销售中',
							visit: 17,
							browse: 36.0
						},
						{
							goods_id: 1041,
							name: 'iPhone 11 Pro Max',
							state: '销售中',
							visit: 14,
							browse: 68.0
						},
						{
							goods_id: 1059,
							name: '小包包女新款潮2020法国小众质感高级感洋气小ck小香风链条斜挎包 ',
							state: '销售中',
							visit: 14,
							browse: 24.0
						},
						{
							goods_id: 1058,
							name: '鲶鱼包小CK女包2020新款春夏手提包真皮翅膀包结婚新娘包',
							state: '已下架',
							visit: 14,
							browse: 67.0
						},
						{
							goods_id: 1060,
							name: '阿吉豆耳钉女日韩可爱甜美气质猫咪耳环人造猫眼石文艺钩坠耳饰品 ',
							state: '销售中',
							visit: 14,
							browse: 54.0
						},
						{
							goods_id: 1039,
							name: '华为折叠手机',
							state: '销售中',
							visit: 14,
							browse: 116.0
						},
						{
							goods_id: 1043,
							name: '休闲裤',
							state: '已下架',
							visit: 12,
							browse: 20.0
						},
						{
							goods_id: 1053,
							name: '回力帆布小白鞋',
							state: '销售中',
							visit: 11,
							browse: 19.0
						},
						{
							goods_id: 1040,
							name: '小米10',
							state: '销售中',
							visit: 11,
							browse: 28.0
						},
						{
							goods_id: 1051,
							name: '黑鲨游戏手机',
							state: '销售中',
							visit: 11,
							browse: 69.0
						},
						{
							goods_id: 1056,
							name: '富士X-T200相机',
							state: '已下架',
							visit: 9,
							browse: 26.0
						}
					]
				};
				if (res.code == 200) {
					this.tableData_visit = res.datas;
				}
			},
			get_browse_stats() {
				const res = {
					code: 200,
					msg: '',
					datas: [{
							goods_id: 1061,
							name: '无耳洞耳夹OL多圈925银针耳钉简约时尚耳饰品',
							state: '销售中',
							visit: 31,
							browse: 247.0
						},
						{
							goods_id: 1050,
							name: '华为荣耀20',
							state: '销售中',
							visit: 19,
							browse: 131.0
						},
						{
							goods_id: 1046,
							name: '361°篮球鞋',
							state: '销售中',
							visit: 24,
							browse: 126.0
						},
						{
							goods_id: 1039,
							name: '华为折叠手机',
							state: '销售中',
							visit: 14,
							browse: 116.0
						},
						{
							goods_id: 1035,
							name: '三星冰箱',
							state: '销售中',
							visit: 24,
							browse: 114.0
						},
						{
							goods_id: 1057,
							name: 'Huawei/华为Mate30 全网通5G智能手机',
							state: '销售中',
							visit: 32,
							browse: 101.0
						},
						{
							goods_id: 1042,
							name: '上衣衬衫女',
							state: '销售中',
							visit: 24,
							browse: 97.0
						},
						{
							goods_id: 1037,
							name: '小米电视',
							state: '销售中',
							visit: 24,
							browse: 92.0
						},
						{
							goods_id: 1051,
							name: '黑鲨游戏手机',
							state: '销售中',
							visit: 11,
							browse: 69.0
						},
						{
							goods_id: 1041,
							name: 'iPhone 11 Pro Max',
							state: '销售中',
							visit: 14,
							browse: 68.0
						},
						{
							goods_id: 1058,
							name: '鲶鱼包小CK女包2020新款春夏手提包真皮翅膀包结婚新娘包',
							state: '已下架',
							visit: 14,
							browse: 67.0
						},
						{
							goods_id: 1060,
							name: '阿吉豆耳钉女日韩可爱甜美气质猫咪耳环人造猫眼石文艺钩坠耳饰品 ',
							state: '销售中',
							visit: 14,
							browse: 54.0
						},
						{
							goods_id: 1054,
							name: '耐克男子运动鞋',
							state: '销售中',
							visit: 18,
							browse: 49.0
						},
						{
							goods_id: 1055,
							name: '361男鞋运动鞋',
							state: '销售中',
							visit: 21,
							browse: 41.0
						},
						{
							goods_id: 1045,
							name: 'Nike男鞋',
							state: '销售中',
							visit: 17,
							browse: 36.0
						},
						{
							goods_id: 1040,
							name: '小米10',
							state: '销售中',
							visit: 11,
							browse: 28.0
						},
						{
							goods_id: 1056,
							name: '富士X-T200相机',
							state: '已下架',
							visit: 9,
							browse: 26.0
						},
						{
							goods_id: 1059,
							name: '小包包女新款潮2020法国小众质感高级感洋气小ck小香风链条斜挎包 ',
							state: '销售中',
							visit: 14,
							browse: 24.0
						},
						{
							goods_id: 1044,
							name: '回力手绘鞋鲸鱼',
							state: '销售中',
							visit: 8,
							browse: 22.0
						},
						{
							goods_id: 1043,
							name: '休闲裤',
							state: '已下架',
							visit: 12,
							browse: 20.0
						}
					]
				};

				if (res.code == 200) {
					this.tableData_browse = res.datas;
				}
			},
			create_map() {
				const myChart = this.$echarts.init(document.getElementById('create-map'));

				const res = {
					code: 200,
					msg: '',
					datas: [{
							pro: '广东',
							cnt: 14.0
						},
						{
							pro: '北京',
							cnt: 5.0
						},
						{
							pro: '河南',
							cnt: 3.0
						},
						{
							pro: '山东',
							cnt: 3.0
						},
						{
							pro: '湖北',
							cnt: 2.0
						},
						{
							pro: '吉林',
							cnt: 1.0
						},
						{
							pro: '上海',
							cnt: 1.0
						},
						{
							pro: '沙田区',
							cnt: 1.0
						},
						{
							pro: '海南',
							cnt: 1.0
						}
					]
				};

				let dataList = [{
						name: '南海诸岛',
						value: 0
					},
					{
						name: '北京',
						value: 54
					},
					{
						name: '天津',
						value: 13
					},
					{
						name: '上海',
						value: 40
					},
					{
						name: '重庆',
						value: 75
					},
					{
						name: '河北',
						value: 13
					},
					{
						name: '河南',
						value: 83
					},
					{
						name: '云南',
						value: 11
					},
					{
						name: '辽宁',
						value: 19
					},
					{
						name: '黑龙江',
						value: 15
					},
					{
						name: '湖南',
						value: 69
					},
					{
						name: '安徽',
						value: 60
					},
					{
						name: '山东',
						value: 39
					},
					{
						name: '新疆',
						value: 4
					},
					{
						name: '江苏',
						value: 31
					},
					{
						name: '浙江',
						value: 104
					},
					{
						name: '江西',
						value: 36
					},
					{
						name: '湖北',
						value: 1052
					},
					{
						name: '广西',
						value: 33
					},
					{
						name: '甘肃',
						value: 7
					},
					{
						name: '山西',
						value: 9
					},
					{
						name: '内蒙古',
						value: 7
					},
					{
						name: '陕西',
						value: 22
					},
					{
						name: '吉林',
						value: 4
					},
					{
						name: '福建',
						value: 18
					},
					{
						name: '贵州',
						value: 5
					},
					{
						name: '广东',
						value: 98
					},
					{
						name: '青海',
						value: 1
					},
					{
						name: '西藏',
						value: 0
					},
					{
						name: '四川',
						value: 44
					},
					{
						name: '宁夏',
						value: 4
					},
					{
						name: '海南',
						value: 22
					},
					{
						name: '台湾',
						value: 3
					},
					{
						name: '香港',
						value: 5
					},
					{
						name: '澳门',
						value: 5
					}
				];

				dataList.forEach(_ => {
					let _pro = res.datas.find(x => x.pro == _.name);
					if (_pro) {
						_.value = _pro.cnt;
					} else {
						_.value = 0;
					}
				});

				const option = {
					tooltip: {
						show: true,
						formatter: function(e) {
							return 0 == e.value ? e.name + '：暂无会员' : e.seriesName + '\n' + e.name + '：' + e.value;
						}
					},
					visualMap: {
						min: 0,
						max: 1000,
						left: 10,
						bottom: 40,
						showLabel: !0,
						text: ['高', '低'],
						pieces: [{
								gt: 100,
								label: '> 100 人',
								color: '#7f1100'
							},
							{
								gte: 10,
								lte: 100,
								label: '10 - 100 人',
								color: '#ff5428'
							},
							{
								gte: 1,
								lt: 10,
								label: '1 - 9 人',
								color: '#ff8c71'
							},
							{
								gt: 0,
								lt: 1,
								label: '疑似',
								color: '#ffd768'
							},
							{
								value: 0,
								color: '#ffffff'
							}
						],
						show: false
					},
					geo: {
						map: 'china',
						roam: !1,
						scaleLimit: {
							min: 1,
							max: 2
						},
						zoom: 1.2,
						top: 60,
						label: {
							normal: {
								show: !0,
								fontSize: '14',
								color: 'rgba(0,0,0,0.7)'
							}
						},
						itemStyle: {
							normal: {
								//shadowBlur: 50,
								//shadowColor: 'rgba(0, 0, 0, 0.2)',
								borderColor: 'rgba(0, 0, 0, 0.2)'
							},
							emphasis: {
								areaColor: '#f2d5ad',
								shadowOffsetX: 0,
								shadowOffsetY: 0,
								borderWidth: 0
							}
						}
					},
					series: [{
						name: '会员人数',
						type: 'map',
						geoIndex: 0,
						data: dataList
					}]
				};

				myChart.setOption(option);
				window.addEventListener('resize', function() {
					myChart.resize();
				});
			}
		},
		created() {
			this.member_sta = {
				member_cnt: 246,
				member_cnt_7: 4,
				member_cnt_today: 0,
				member_cnt_yesterday: 10,
				order_cnt: 42,
				pay_cnt: 20
			};

			this.order_sta = {
				order_cnt: 162,
				pay_cnt: 52,
				pay_money: 0.6,
				refund_cnt: 4
			};

			this.get_visit_stats();
			this.get_browse_stats();
		},
		mounted() {
			this.create_line_line(() => {
				this.day();
			});

			this.create_pie();

			this.create_map();
		}
	};
</script>

<style>
	.separate_page {
		background-color: #fff;
		margin-bottom: 16px;
		padding: 30px;
		border-radius: 10px;
	}

	.tag {
		margin-top: 2.1875rem;
		width: 15rem;
		height: 6.25rem;
		background-color: #7d6aff;
		border-radius: 0.625rem;
		margin-right: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-top: 0.625rem;
	}

	.tag:nth-child(2) {
		background-color: #ffa66a;
	}

	.tag:nth-child(3) {
		background-color: #ff6b6b;
	}

	.tag:nth-child(4) {
		background-color: #69b5ff;
	}

	.tag:nth-child(5) {
		background-color: #b96bff;
	}

	.tag:nth-child(6) {
		background-color: #e9c52b;
	}

	.tag i {
		font-size: 2.1875rem;
		margin-right: 1.5625rem;
		color: #fff;
	}

	.tag_title {
		font-size: 0.875rem;
		color: #fff;
	}

	.tag_data {
		font-size: 1.5625rem;
		font-weight: 400;
		color: #fff;
	}

	.order {
		padding-top: 2rem;
	}

	.stats_area {
		height: 38rem;
		overflow: hidden;
	}

	.card {
		margin-top: 1rem;
	}

	.circle_txt {
		font-size: 1.25rem;
		text-align: center;
		line-height: 3.75rem;
		margin-bottom: 2.5rem;
		color: #fff;
		margin-right: 1.25rem;
		margin-left: 2.1875rem;
		width: 3.75rem;
		height: 3.75rem;
		border-radius: 50%;
		background-color: #ff6b6b;
	}

	.dflex:nth-child(2) .circle_txt {
		background-color: #7e6aff;
	}

	.dflex:nth-child(3) .circle_txt {
		background-color: #69b5ff;
	}

	.dflex:nth-child(4) .circle_txt {
		background-color: #ffa66a;
	}

	.dflex:nth-child(5) .circle_txt {
		margin-bottom: 0rem;
		background-color: #b96bff;
	}

	.order_title {
		font-size: 0.75rem;
		margin-top: 0.5625rem;
	}

	.order_data {
		font-size: 1.25rem;
	}

	.echart_line_line {
		width: 100%;
		height: 34rem;
		padding-top: 2rem;
	}

	.ranking_area {
		height: 32rem;
		overflow: hidden;
	}

	.echart_pie {
		width: 100%;
		height: 30rem;
		padding-top: 2rem;
	}

	.echart_map {
		width: 100%;
		height: 40rem;
		padding-top: 2rem;
	}
</style>
