<template>
  <div v-if="showDebugPanel" class="fixed bottom-4 right-4 z-50">
    <div class="bg-black/80 text-white p-4 rounded-lg max-w-sm text-xs">
      <h3 class="font-bold mb-2">调试面板</h3>
      
      <div class="space-y-2">
        <div>
          <strong>认证状态:</strong> {{ authStore.isAuthenticated ? '已登录' : '未登录' }}
        </div>
        
        <div>
          <strong>用户信息:</strong>
          <pre class="text-xs mt-1">{{ JSON.stringify(authStore.userInfo, null, 2) }}</pre>
        </div>
        
        <div>
          <strong>任务数量:</strong> {{ tasksStore.tasks.length }}
        </div>
        
        <div>
          <strong>待确认抽取:</strong> {{ tasksStore.pendingExtractions.length }}
        </div>
        
        <div>
          <strong>当前团队:</strong> {{ tasksStore.currentTeamId || '未设置' }}
        </div>
        
        <div>
          <strong>API基础URL:</strong> {{ apiBaseUrl }}
        </div>
      </div>
      
      <div class="mt-3 space-y-1">
        <button 
          @click="loadMockData" 
          class="bg-blue-600 px-2 py-1 rounded text-xs mr-2"
        >
          加载模拟数据
        </button>
        
        <button 
          @click="clearData" 
          class="bg-red-600 px-2 py-1 rounded text-xs"
        >
          清除数据
        </button>
      </div>
    </div>
  </div>
  
  <!-- 调试开关 -->
  <button 
    @click="toggleDebugPanel" 
    class="fixed bottom-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-full"
  >
    🐛
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { API_CONFIG } from '@/config/database.js'

const authStore = useAuthStore()
const tasksStore = useTasksStore()

const showDebugPanel = ref(false)
const apiBaseUrl = computed(() => API_CONFIG.baseURL)

const toggleDebugPanel = () => {
  showDebugPanel.value = !showDebugPanel.value
}

const loadMockData = async () => {
  console.log('Debug - 加载模拟数据')
  await tasksStore.initialize('demo-team')
}

const clearData = () => {
  console.log('Debug - 清除数据')
  tasksStore.tasks = []
  tasksStore.extractions = []
}
</script> 