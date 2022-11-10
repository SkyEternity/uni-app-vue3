import http from '../http'
export class ceshiSvr {
	// 获取验证码
	getMessage(params: any, success: any, error: any): void {
		http.get(`/generate/message`, {
			params: {
				...params
			}
		}).then((res: any) => {
			res.code == 0 ? success(res.data) : error(res.message)
		}).catch((err: any) => {
			error(err)
		})
	}
	login(data: any, success: any, error: any): void {
		http.post(`/login`, data).then((res: any) => {
			res.code == 0 ? success(res.data) : error(res.message)
		}).catch((err: any) => {
			error(err)
		})
	}
}
