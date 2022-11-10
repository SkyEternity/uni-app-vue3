import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
	plugins: [uni()],
	server: {
		port: 7070,
		host: '0.0.0.0',
		proxy: {
			'/api': {
				// target: 'http://10.10.20.7:7777/', // 苍龙
				target: 'http://10.10.20.53:88/', // 俊华
				changeOrigin: true
			}
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@components': path.resolve(__dirname, './src/components')
		}
	}
})
console.log(path);
