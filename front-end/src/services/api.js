import axios from 'axios'
import { API_CONFIG } from '../config/database.js'

// 创建axios实例
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('user-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      // 未授权，清除本地存储并跳转登录
      localStorage.removeItem('user-token')
      localStorage.removeItem('user-info')
      window.location.href = '/login'
    }
    
    return Promise.reject({
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data
    })
  }
)

// 通用API方法
export const apiService = {
  // GET请求
  get: (url, params = {}) => {
    return api.get(url, { params })
  },
  
  // POST请求
  post: (url, data = {}) => {
    return api.post(url, data)
  },
  
  // PUT请求
  put: (url, data = {}) => {
    return api.put(url, data)
  },
  
  // PATCH请求
  patch: (url, data = {}) => {
    return api.patch(url, data)
  },
  
  // DELETE请求
  delete: (url) => {
    return api.delete(url)
  },
  
  // 文件上传
  upload: (url, formData, onProgress = null) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress
    })
  }
}

export default api 