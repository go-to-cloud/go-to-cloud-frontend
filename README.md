# Go-To-Cloud Frontend

## 前端

> 前端默认端口：`8090` 后端默认端口：`8080`

```shell
pnpm run dev
```

`vite.config.ts`配置
```
server: {
      port: 8090,
      proxy: {
      
        '/api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        }
      },
      hmr: {
        overlay: false
      },
      host: '0.0.0.0'
    },
```

> `axios`配置
```
base_url: {
// 开发环境接口前缀
base: '/api',

// 打包开发环境接口前缀
dev: '',

// 打包生产环境接口前缀
pro: '',

// 打包测试环境接口前缀
test: ''
},
```
