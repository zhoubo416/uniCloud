# Usecloud.usemall 用云电商 v1.0.9 前后端开源版
**用云电商 uniCloud v1.0.9 前后端开源版，完整商用级项目，一套 js 解决前端、后端、数据库的全栈开发  serverless 模式（小程序、h5、android、iOS、vue + element-ui + uniCloud 版管理后台）永久开源。**  

说明：目前支持平台有微信小程序、支付宝小程序、h5。全端支持可咨询**私有部署 netcore 版本一套后台管理多端小程序**。（**可定制跨境电商、海关申报、仓储系统、物联网等项目**）

**用云 · 让开发更简单！**
## 用云团队项目推荐（已开源）
> **[1. 用云电商 uniCloud v1.0.9 版前后端开源](https://ext.dcloud.net.cn/plugin?id=5764)**  
> **[2. 用云电商 uniCloud 付费版](https://ext.dcloud.net.cn/plugin?id=5211)**  
> **[3. 用云IM uniCloud 开源版](https://ext.dcloud.net.cn/plugin?id=5544)**  


## [uniCloud官方文档](https://uniapp.dcloud.io/uniCloud/README)

## 手机扫码体验
|微信小程序|H5|
|----|----|
|<img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-d7265b2d-188d-44bf-83cb-f04b9e27f865/e9293ae3-c2b5-408a-9130-341bbdfbf284.png" style="width: 240px" width="240px" />|<img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-d7265b2d-188d-44bf-83cb-f04b9e27f865/fd69047a-1aa4-4109-995b-2eb62d4d0ae4.png" style="width: 240px" width="240px" />|

## [点击体验管理后台](https://usemall.use-cloud.com)
> 账号：usemall  
> 密码：1234  

**[用云电商管理后台v1.0.9版本，加群（[1020565856](https://qm.qq.com/cgi-bin/qm/qr?k=BNUlrZAQXPolwALtcBm_rMabq0bx3_n-&jump_from=usecloud)）联系客服免费获取源代码]。**  
## [点击访问用云官网](https://use-cloud.com)

## 新手指南
1. 下载 [HBuilderX](https://www.dcloud.io/hbuilderx.html) 开发者工具
2. 插件安装 <br />工具栏 -> 工具(T) -> 插件安装 -> 安装新插件（[scss/sass编译](https://ext.dcloud.net.cn/plugin?id=2046)）

## 快速上手
1. 使用 HBuilderX 导入插件
2. 关联 uniCloud 服务空间（[创建 uniCloud 服务空间](https://uniapp.dcloud.io/uniCloud/quickstart?id=%e5%88%9b%e5%bb%ba%e5%92%8c%e7%bb%91%e5%ae%9a%e6%9c%8d%e5%8a%a1%e7%a9%ba%e9%97%b4)）
3. 运行 uniCloud -> database -> db_init.josn（右键：初始化云数据库(包含Schema和校验函数)）
4. 配置云函数 uni-id -> config.json 文件 [官方文档](https://uniapp.dcloud.net.cn/uniCloud/uni-id?id=configjson%e7%9a%84%e8%af%b4%e6%98%8e)
    1. uni-id
```
	"passwordSecret": [{
		"version": 1,
		"value": "usemall.unicloud.password.secret"
	}],
	"tokenSecret": "usemall.unicloud.token.secret",
	"tokenExpiresIn": 259200,
	"tokenExpiresThreshold": 600,
	"passwordErrorLimit": 6,
	"passwordErrorRetryTime": 3600,
	"autoSetInviteCode": false,
	"forceInviteCode": false,
	"bindTokenToDevice": false,
```
    2. 微信授权与支付
```
	"mp-weixin": {
		"tokenExpiresIn": 259200,
		"oauth": {
			"weixin": {
				"appid": "微信小程序appid",
				"appsecret": "微信小程序appsecret"
			}
		},
		"pay": {
			"appId": "微信小程序appid",
			"mchId": "微信支付商户号",
			"key": "微信支付商户key (API密钥)"
		},
		"notify-url": "云函数URL化http地址 + /wxpay"
	},
```
    3. 支付宝授权与支付
```
	"mp-alipay": {
		"tokenExpiresIn": 259200,
		"oauth": {
			"alipay": {
				"appid": "支付宝小程序appid",
				"privateKey": "支付宝小程序私钥",
				"keyType": "支付宝小程序私钥类型"
			}
		},
		"pay": {
			"appId": "支付宝小程序appid",
			"mchId": "支付宝商户号",
			"privateKey": "应用私钥字符串",
			"alipayPublicKey": "支付宝公钥"
		},
		"notify-url": "云函数URL化http地址 + /alipay"
	},
```
    4. 短信配置
```
	"service": {
		"sms": {
			"name": "应用名称，对应短信模版的name",
			"codeExpiresIn": 600,
			"smsKey": "短信密钥key",
			"smsSecret": "短信密钥secret"
		},
		"smscode": {
			"templateId": "验证码短信模板Id"
		}
	}
```
    5. 快递100
```
	"kd100": {
		"customer": "快递100 customer",
		"key": "快递100 授权KEY"
	}
```
5. 运行 uniCloud -> cloudfunctions（右键：上传所有云函数、公共模块及actions）  
6. 配置 manifest.json [官方文档](https://uniapp.dcloud.io/collocation/manifest)
    1. 基础配置
    2. 微信小程序配置
    3. h5配置
7. 工具栏 -> 运行(R) ->  
    1. 运行到浏览器([体验h5版本]) 注意[配置跨域](https://uniapp.dcloud.io/uniCloud/quickstart?id=useinh5)。
    2. 运行到小程序模拟器(微信开发者工具[体验微信小程序版本])。
8. **注意点（重要）**  
    > 1. 连接本地云函数（右键 uniCloud -> database 下载所有DB Schema及扩展校验函数）[注意事项](https://uniapp.dcloud.io/uniCloud/quickstart?id=%e8%b0%83%e7%94%a8%e6%9c%ac%e5%9c%b0%e4%ba%91%e5%87%bd%e6%95%b0%e6%b3%a8%e6%84%8f%e4%ba%8b%e9%a1%b9) 。 
    > 2. 连接本地云函数运行出错，则需右键云函数 usemall -> 管理公共模块依赖 -> 更新选中依赖。  
    > 3. 连接云端云函数，注意小程序开发工具（校验|不校验合法域名、web-view（业务域名）、TLS版本以及HTTPS证书）。
    > 4. 小程序中使用 uniCloud [白名单配置](https://uniapp.dcloud.io/uniCloud/quickstart?id=%e5%b0%8f%e7%a8%8b%e5%ba%8f%e4%b8%ad%e4%bd%bf%e7%94%a8unicloud%e7%9a%84%e7%99%bd%e5%90%8d%e5%8d%95%e9%85%8d%e7%bd%ae)。
9. **开源不易，请勿以差评的评论方式提问，谢谢！有任何问题欢迎加群咨询。**

## 欢迎加QQ群（[1020565856](https://qm.qq.com/cgi-bin/qm/qr?k=BNUlrZAQXPolwALtcBm_rMabq0bx3_n-&jump_from=usecloud)）、永久免费获取v1.0.9版本管理后台源代码、各种活动福利。
## 个人微信扫码添加企业微信，vip 一对一服务。
<img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-d7265b2d-188d-44bf-83cb-f04b9e27f865/df0230c7-a54d-4a78-88c9-725c71f73cc2.png" />
