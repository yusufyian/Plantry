import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userService } from '../services/userService.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('user-token'))
  const loading = ref(false)
  
  // Computed
  const isAuthenticated = computed(() => !!token.value)
  const userInfo = computed(() => user.value)
  
  // Actions
  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await userService.login(credentials)
      
      user.value = {
        id: response.user.id,
        telegram_id: response.user.telegram_id,
        username: response.user.username,
        first_name: response.user.first_name,
        last_name: response.user.last_name,
        email: response.user.email,
        phone: response.user.phone,
        timezone: response.user.timezone || 'UTC',
        language_code: response.user.language_code || 'zh-CN',
        avatar_url: response.user.avatar_url,
        is_active: response.user.is_active,
        last_seen_at: response.user.last_seen_at,
        created_at: response.user.created_at,
        updated_at: response.user.updated_at
      }
      
      token.value = response.token
      localStorage.setItem('user-token', token.value)
      localStorage.setItem('user-info', JSON.stringify(user.value))
      
      return response
    } catch (error) {
      // 如果API调用失败，回退到演示模式
      if (credentials.email === 'demo@plantry.com' && credentials.password === 'demo123') {
        user.value = {
          id: 'demo-uuid',
          telegram_id: null,
          username: 'demo_user',
          first_name: '演示',
          last_name: '用户',
          email: 'demo@plantry.com',
          phone: null,
          timezone: 'Asia/Shanghai',
          language_code: 'zh-CN',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
          is_active: true,
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        token.value = 'demo-token-123'
        localStorage.setItem('user-token', token.value)
        localStorage.setItem('user-info', JSON.stringify(user.value))
        
        return { user: user.value, token: token.value }
      }
      throw error
    } finally {
      loading.value = false
    }
  }
  
  const register = async (userData) => {
    loading.value = true
    try {
      const response = await userService.register({
        telegram_id: userData.telegram_id || null,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
                email: userData.email,
        phone: userData.phone || null,
        timezone: userData.timezone || 'UTC',
        language_code: userData.language_code || 'zh-CN',
        avatar_url: userData.avatar_url || null
      })
      
      user.value = response.user
      token.value = response.token
      localStorage.setItem('user-token', token.value)
      localStorage.setItem('user-info', JSON.stringify(user.value))
      
      return response
    } catch (error) {
      // 如果API调用失败，回退到演示模式
      user.value = {
        id: `demo-${Date.now()}`,
        telegram_id: null,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone || null,
        timezone: userData.timezone || 'Asia/Shanghai',
        language_code: userData.language_code || 'zh-CN',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
        is_active: true,
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      token.value = `demo-token-${Date.now()}`
      localStorage.setItem('user-token', token.value)
      localStorage.setItem('user-info', JSON.stringify(user.value))
      
      return { user: user.value, token: token.value }
    } finally {
      loading.value = false
    }
  }
  
  const logout = async () => {
    try {
      await userService.logout()
    } catch (error) {
      // 即使API调用失败也要清除本地状态
      console.warn('Logout API call failed:', error)
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('user-token')
      localStorage.removeItem('user-info')
    }
  }
  
  const updateProfile = async (profileData) => {
    loading.value = true
    try {
      const updatedUser = await userService.updateProfile(profileData)
      user.value = { ...user.value, ...updatedUser }
      localStorage.setItem('user-info', JSON.stringify(user.value))
      return updatedUser
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }
  
  const changePassword = async (passwordData) => {
    loading.value = true
    try {
      await userService.changePassword(passwordData)
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }
  
  const loadUserFromStorage = () => {
    const storedUser = localStorage.getItem('user-info')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }
  
  const refreshUserData = async () => {
    if (!token.value) {
      console.log('Auth - refreshUserData: 没有token，跳过刷新')
      return
    }
    
    console.log('Auth - refreshUserData: 开始刷新用户数据，token:', token.value)
    
    try {
      const userData = await userService.getCurrentUser()
      console.log('Auth - refreshUserData: 成功获取用户数据:', userData)
      user.value = userData
      localStorage.setItem('user-info', JSON.stringify(user.value))
    } catch (error) {
      console.warn('Auth - refreshUserData: 刷新用户数据失败:', error)
      console.log('Auth - refreshUserData: 错误详情:', {
        message: error.message,
        status: error.status,
        data: error.data
      })
      
      // 如果是演示token，使用演示数据
      if (token.value === 'demo-token-123' || token.value.startsWith('demo-token-')) {
        console.log('Auth - refreshUserData: 使用演示数据')
        const demoUser = {
          id: 'demo-uuid',
          telegram_id: null,
          username: 'demo_user',
          first_name: '演示',
          last_name: '用户',
          email: 'demo@plantry.com',
          phone: null,
          timezone: 'Asia/Shanghai',
          language_code: 'zh-CN',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
          is_active: true,
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        user.value = demoUser
        localStorage.setItem('user-info', JSON.stringify(user.value))
      }
    }
  }
  
  // 初始化时加载用户信息
  if (token.value) {
    loadUserFromStorage()
    // 尝试刷新用户数据
    refreshUserData()
  }
  
  return {
    user,
    token,
    loading,
    isAuthenticated,
    userInfo,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    loadUserFromStorage,
    refreshUserData
  }
}) 