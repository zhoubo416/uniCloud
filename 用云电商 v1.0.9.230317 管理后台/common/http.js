// 导入axios
import { Message, Loading } from 'element-ui';
import axios from 'axios'

// 创建一个副本 设置基地址
axios.defaults.baseURL = 'https://mall-os-api.use-cloud.com/nb/';
let loading;
window.$axios_config = {};
// axios的拦截器
axios.interceptors.request.use(
    function (config) {

        if (window.$axios_config && window.$axios_config.loading) {
            loading = Loading.service({
                lock: true,
                text: '加载中……',
                background: 'rgba(255, 255, 255, 0)',
            })
        }

        if (config.method === 'get' || config.method === 'delete') {
            //  给data赋值以绕过if判断
            config.data = 1
        }

        // 统一的设置token
        config.headers['access_token'] = window.localStorage.getItem('token');
        config.headers['content-type'] = 'application/json; charset=utf-8';
        // 在发请求之后干一些事
        return config
    },
    function (error) {
        window.$axios_config.loading = true;
        // 隐藏 loading
        loading && loading.close()
        // 在请求失败的时候干一些事
        return Promise.reject(error)
    }
)

let cnt_401 = 0;
// 响应拦截器
axios.interceptors.response.use(
    function (response) {
        // console.log(response);
        window.$axios_config.loading = true;

        if (response.data.code != 200) {
            if (response.data.msg) {
                if (response.data.code == 401) {
                    cnt_401++;
                    if (cnt_401 <= 1) {
                        Message.error(response.data.msg);
                    }
                } else {
                    Message.error(response.data.msg);
                }
            }
        } else {
            cnt_401 = 0;
        }

        window.$axios_config.loading = true;

        // 隐藏 loading
        loading && loading.close();
        return response.data;
    },
    function (error) {
        // 在响应出错的时候

        window.$axios_config.loading = true;

        // 隐藏 loading
        loading && loading.close()
        return Promise.reject(error)
    }
)

export default axios