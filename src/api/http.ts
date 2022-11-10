import axios  from 'axios';
import global from '@/static/js/global'
let baseURL = global.apiUrlFn()
// baseURL = `http://scene.unitsyscloud.com/hw4/api`
const http = axios.create({
	baseURL,
	timeout: 10000,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
		'OCS-APIRequest': true,
	},
	adapter(config: any) {
		const { url, method, data, params, headers } = config
		return new Promise((resolve, reject) => {
			uni.request({
				method: method!.toUpperCase() as any,
				url: baseURL+url,
				header: headers,
				data: method=='get'?params:data,
				dataType: 'json',
				responseType: config.responseType,
				success: (res: any) => {
					res.statusCode  ==200?resolve(res):reject(res)
					uni.hideLoading()
				},
				fail: (err: any) => { 
					uni.hideLoading()
					reject(err)
				}
			})
		})
	}
})

// 请求之前拦截
http.interceptors.request.use(
	(config: any) => {
		if (uni.getStorageSync('token')) {
			uni.showLoading({ title: '加载中...', mask: true });
			config.headers['Authorization'] = 'Bearer '+ uni.getStorageSync('token')
		}
		return config;
	},
	(error: any) => {
		return Promise.reject(error);
	}
)

// 响应之后拦截
http.interceptors.response.use(
	(response: any) => {
		// 返回code值为200请求成功
		return Promise.resolve(response.data);
	},
	(error: any) => { 
		// 登陆过期
		if (error.statusCode == 403 || error.statusCode == 401) {
			if(uni.getStorageSync('scene') == 'h5') { //h5 token过期跳转位置
				clearStorageFn()
				uni.reLaunch({ url: '/pages/blank/index' })
			}else { //app token过期跳转未知
				uni.clearStorageSync()
				uni.reLaunch({ url: '/pages/appblank/index' })
			}
			return Promise.reject('登陆已过期');
		} else {
			// 其他错误
			return Promise.reject(error);
		}
	}
)

function clearStorageFn() {
	uni.removeStorageSync('userInfo')
	uni.removeStorageSync('token')
}


export default http
