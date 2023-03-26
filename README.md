
# GO-TO-CLOUD 面向小型团队的快速部署工具

## Intro 介绍

**Go-To-Cloud**，简称`GTC`，是一款非常适合小型团队快速将代码通过构建后发布到K8S的部署工具。不需要学习专业的k8s、容器镜像知识也能轻松上手使用，工具的部署也做到了极简，抛开了大多数CI/CD工具依赖的平台，比如`jenkins`、`ArgoCD`等，仅需MySQL、镜像仓库，并指定用于构建和部署的K8S机器，即可搭建一套自己的CI/CD服务平台。

> Go-To-Cloud正在奔跑中成长，非常渴望倾听你们的[**声音**](https://github.com/go-to-cloud/go-to-cloud/issues)

## Features 功能

- 项目管理
    - 创建项目，并配置项目的代码分支、构建及部署环境
    - 构建项目：将项目打包为镜像放到镜像仓库并打上tag
    - 部署项目：配置项目运行的环境、端口、健康检查等参数，并将项目镜像`发布`或`回滚`到目标k8s环境
    - 监控项目：查看在k8s中运行的项目实例，并可`伸缩`、`重启`实例，以及查看`容器日志`和进入容器内部执行`Shell`命令
- 配置管理
    - 代码仓库：用于创建项目的时候指定代码及分支，以及构建过程中拉取代码
    - 构建节点：用于执行构建和打包镜像指令的k8s环境
    - 制品仓库：构建的镜像存放的仓库，管理构建的结果、复制镜像地址，查看历史构建记录
    - 部署环境：项目最终运行的k8s环境
- 应用监控：伸缩、重启及管理应用
- 账号管理：
    - 创建用户：系统的使用者
    - 创建组织：项目是由`组织`维护，同一`组织`里的用户可以查看及管理归属的`项目`
    - 权限管理：项目权限是基于`RBAC`模型管理，[查看介绍](https://github.com/go-to-cloud/go-to-cloud/tree/main/internal/auth)

## Install 安装

[使用文档](https://go-to-cloud.github.io/go-to-cloud-press)

## Develop 开发环境

### 开发环境

- [vue-element-plus-admin](https://github.com/PanJiaChen/vue-element-admin) `v1.6`
- NodeJS `v16.16.0`
> NodeJS推荐使用[nvm](https://github.com/nvm-sh/nvm)管理，`Windows`平台：[nvm-windows](https://github.com/coreybutler/nvm-windows)

### 准备工作

1. 启动后端服务
> 后端服务位于另一个仓库: [后端仓库](https://github.com/go-to-cloud/go-to-cloud)

2. 配置项目

- `vite.config.ts`
```
server: {
      port: 18090,
      proxy: {
      
        '/api': {
          target: 'http://127.0.0.1:18080',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        }
      },
      hmr: {
        overlay: false
      },
      host: '0.0.0.0'
    }, ...
```

- `axios`配置
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

3. 启动前端服务
```shell
npm run dev
```

## About 联系方式

E-Mail: 993921@qq.com
