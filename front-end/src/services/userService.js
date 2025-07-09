import { apiService } from './api.js'

export const userService = {
  // 用户认证
  login: (credentials) => {
    return apiService.post('/auth/login', credentials)
  },
  
  // 用户注册
  register: (userData) => {
    return apiService.post('/auth/register', userData)
  },
  
  // 演示登录
  demoLogin: () => {
    return apiService.post('/auth/demo')
  },
  
  // 刷新token
  refreshToken: () => {
    return apiService.post('/auth/refresh')
  },
  
  // 登出
  logout: () => {
    return apiService.post('/auth/logout')
  },
  
  // 获取当前用户信息
  getCurrentUser: () => {
    return apiService.get('/users/me')
  },
  
  // 更新用户信息
  updateProfile: (userData) => {
    return apiService.patch('/users/me', userData)
  },
  
  // 更新头像
  updateAvatar: (avatarFile) => {
    const formData = new FormData()
    formData.append('avatar', avatarFile)
    return apiService.upload('/users/me/avatar', formData)
  },
  
  // 更改密码
  changePassword: (passwordData) => {
    return apiService.patch('/users/me/password', passwordData)
  },
  
  // 获取用户设置
  getUserSettings: (teamId = null) => {
    const params = teamId ? { team_id: teamId } : {}
    return apiService.get('/users/me/settings', params)
  },
  
  // 更新用户设置
  updateUserSettings: (settingKey, settingValue, teamId = null) => {
    return apiService.put('/users/me/settings', {
      setting_key: settingKey,
      setting_value: settingValue,
      team_id: teamId
    })
  },
  
  // 通过Telegram ID查找用户
  findByTelegramId: (telegramId) => {
    return apiService.get(`/users/telegram/${telegramId}`)
  },
  
  // 搜索用户
  searchUsers: (query, teamId = null) => {
    const params = { q: query }
    if (teamId) params.team_id = teamId
    return apiService.get('/users/search', params)
  },
  
  // 获取用户通知
  getNotifications: (page = 1, limit = 20) => {
    return apiService.get('/users/me/notifications', { page, limit })
  },
  
  // 标记通知为已读
  markNotificationRead: (notificationId) => {
    return apiService.patch(`/notifications/${notificationId}/read`)
  },
  
  // 标记所有通知为已读
  markAllNotificationsRead: () => {
    return apiService.patch('/users/me/notifications/read-all')
  }
} 