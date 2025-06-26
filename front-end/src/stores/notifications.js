import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotifications = defineStore('notifications', () => {
  const notifications = ref([])
  
  const addNotification = (notification) => {
    const id = Date.now()
    const newNotification = {
      id,
      type: 'info', // info, success, warning, error
      title: '',
      message: '',
      duration: 5000,
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    // 自动移除通知
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }
  
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const clearAll = () => {
    notifications.value = []
  }
  
  // 快捷方法
  const success = (message, title = '成功') => {
    return addNotification({ type: 'success', title, message })
  }
  
  const error = (message, title = '错误') => {
    return addNotification({ type: 'error', title, message, duration: 8000 })
  }
  
  const warning = (message, title = '警告') => {
    return addNotification({ type: 'warning', title, message })
  }
  
  const info = (message, title = '信息') => {
    return addNotification({ type: 'info', title, message })
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}) 