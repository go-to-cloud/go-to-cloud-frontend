import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

import { ElMessage } from 'element-plus'

import qs from 'qs'

import { config } from '@/config/axios/config'
import { useCache } from '@/hooks/web/useCache'
import { UserType } from '@/api/login/types'
import { resetRouter } from '@/router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useRouter } from 'vue-router'
const router = useRouter()

// import { UserType } from '@/api/login/types'

const { result_code, base_url } = config

export const PATH_URL = base_url[import.meta.env.VITE_API_BASEPATH]

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: PATH_URL, // api 的 base_url
  timeout: config.request_timeout // 请求超时时间
})
const { wsCache } = useCache()

const tagsViewStore = useTagsViewStore()

// request拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (
      config.method === 'post' &&
      config!.headers!['Content-Type'] === 'application/x-www-form-urlencoded'
    ) {
      config.data = qs.stringify(config.data)
    }

    const userInfo = wsCache.get('userInfo')
    if (userInfo != null) {
      const user = userInfo as UserType
      config!.headers!['Authorization'] = 'Bearer ' + user.token
    }

    // get参数编码
    if (config.method === 'get' && config.params) {
      let url = config.url as string
      url += '?'
      const keys = Object.keys(config.params)
      for (const key of keys) {
        if (config.params[key] !== void 0 && config.params[key] !== null) {
          url += `${key}=${encodeURIComponent(config.params[key])}&`
        }
      }
      url = url.substring(0, url.length - 1)
      config.params = {}
      config.url = url
    }
    return config
  },
  (error: AxiosError) => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  (response: AxiosResponse<Recordable>) => {
    if (response.data.code === result_code) {
      return response
    } else {
      ElMessage.error(response.data.message)
    }
  },
  (error: AxiosError) => {
    if (error.response?.status == 401) {
      wsCache.clear()
      tagsViewStore.delAllViews()
      resetRouter() // 重置静态路由表
      router.replace('/login').then((_) => {})
    }

    if (error.response?.status == 403) {
      // @ts-ignore
      ElMessage.error(error.response?.data?.message)
    } else {
      ElMessage.error(error.message)
    }
    return Promise.reject(error)
  }
)

export { service }
