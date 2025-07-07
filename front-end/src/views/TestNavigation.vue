<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">🧪 导航测试页面</h1>
      
      <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">当前路由信息</h2>
        <div class="space-y-2 text-sm">
          <p><strong>当前路径:</strong> {{ $route.path }}</p>
          <p><strong>路由名称:</strong> {{ $route.name }}</p>
          <p><strong>认证状态:</strong> {{ isAuthenticated ? '已认证' : '未认证' }}</p>
          <p><strong>Token:</strong> {{ token ? '存在' : '不存在' }}</p>
        </div>
      </div>
      
      <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">路由测试</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link 
            to="/" 
            class="p-4 bg-blue-100 rounded-lg text-center hover:bg-blue-200 transition-colors"
          >
            首页
          </router-link>
          <router-link 
            to="/board" 
            class="p-4 bg-green-100 rounded-lg text-center hover:bg-green-200 transition-colors"
          >
            看板
          </router-link>
          <router-link 
            to="/inbox" 
            class="p-4 bg-yellow-100 rounded-lg text-center hover:bg-yellow-200 transition-colors"
          >
            任务箱
          </router-link>
          <router-link 
            to="/analytics" 
            class="p-4 bg-purple-100 rounded-lg text-center hover:bg-purple-200 transition-colors"
          >
            分析
          </router-link>
          <router-link 
            to="/telegram" 
            class="p-4 bg-indigo-100 rounded-lg text-center hover:bg-indigo-200 transition-colors"
          >
            Telegram
          </router-link>
          <router-link 
            to="/settings" 
            class="p-4 bg-gray-100 rounded-lg text-center hover:bg-gray-200 transition-colors"
          >
            设置
          </router-link>
        </div>
      </div>
      
      <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">编程式导航测试</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            @click="navigateTo('/')" 
            class="p-4 bg-blue-100 rounded-lg text-center hover:bg-blue-200 transition-colors"
          >
            首页
          </button>
          <button 
            @click="navigateTo('/board')" 
            class="p-4 bg-green-100 rounded-lg text-center hover:bg-green-200 transition-colors"
          >
            看板
          </button>
          <button 
            @click="navigateTo('/inbox')" 
            class="p-4 bg-yellow-100 rounded-lg text-center hover:bg-yellow-200 transition-colors"
          >
            任务箱
          </button>
          <button 
            @click="navigateTo('/analytics')" 
            class="p-4 bg-purple-100 rounded-lg text-center hover:bg-purple-200 transition-colors"
          >
            分析
          </button>
          <button 
            @click="navigateTo('/telegram')" 
            class="p-4 bg-indigo-100 rounded-lg text-center hover:bg-indigo-200 transition-colors"
          >
            Telegram
          </button>
          <button 
            @click="navigateTo('/settings')" 
            class="p-4 bg-gray-100 rounded-lg text-center hover:bg-gray-200 transition-colors"
          >
            设置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const token = computed(() => localStorage.getItem('user-token'))
const isAuthenticated = computed(() => !!token.value)

const navigateTo = (path) => {
  console.log('编程式导航到:', path)
  router.push(path)
}
</script> 