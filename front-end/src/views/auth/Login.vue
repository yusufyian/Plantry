<template>
  <div class="min-h-screen flex">
    <!-- 左侧背景区域 -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 relative overflow-hidden">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative z-10 flex flex-col justify-center px-12 text-white">
        <h1 class="text-4xl font-bold mb-6">欢迎来到 Plantry</h1>
        <p class="text-xl mb-8 opacity-90">让想法在团队中生根发芽</p>
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-white/60 rounded-full"></div>
            <span>AI 驱动的任务识别</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-white/60 rounded-full"></div>
            <span>无缝 Telegram 集成</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-white/60 rounded-full"></div>
            <span>可视化项目看板</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-white/60 rounded-full"></div>
            <span>智能效率分析</span>
          </div>
        </div>
      </div>
      
      <!-- 装饰性元素 -->
      <div class="absolute top-20 right-20 w-32 h-32 border border-white/20 rounded-full animate-pulse"></div>
      <div class="absolute bottom-20 left-20 w-24 h-24 border border-white/20 rounded-full animate-pulse delay-1000"></div>
    </div>
    
    <!-- 右侧登录表单 -->
    <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <!-- Logo -->
        <div class="flex items-center justify-center lg:justify-start mb-8">
          <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
            <span class="text-white font-bold text-lg">P</span>
          </div>
          <span class="text-2xl font-bold gradient-text">Plantry</span>
        </div>
        
        <div>
          <h2 class="text-3xl font-bold text-gray-900">登录您的账户</h2>
          <p class="mt-2 text-sm text-gray-600">
            还没有账户？
            <router-link to="/register" class="font-medium text-green-600 hover:text-green-500">
              立即注册
            </router-link>
          </p>
        </div>

        <div class="mt-8">
          <!-- 演示账户提示 -->
          <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 class="text-sm font-medium text-blue-800 mb-2">演示账户</h3>
            <p class="text-xs text-blue-600 mb-2">邮箱: demo@plantry.com</p>
            <p class="text-xs text-blue-600">密码: demo123</p>
          </div>
          
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                邮箱地址
              </label>
              <div class="mt-1">
                <input
                  id="email"
                  v-model="form.email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="输入您的邮箱"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                密码
              </label>
              <div class="mt-1 relative">
                <input
                  id="password"
                  v-model="form.password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="输入您的密码"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <EyeIcon v-if="!showPassword" class="w-5 h-5 text-gray-400" />
                  <EyeSlashIcon v-else class="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  v-model="form.rememberMe"
                  name="remember-me"
                  type="checkbox"
                  class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                  记住我
                </label>
              </div>

              <div class="text-sm">
                <a href="#" class="font-medium text-green-600 hover:text-green-500">
                  忘记密码？
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                :disabled="loading"
                class="group relative w-full flex justify-center py-3 px-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LoadingSpinner v-if="loading" size="sm" />
                <span v-else>登录</span>
              </button>
            </div>
          </form>

          <!-- 社交登录分隔线 -->
          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">或者使用</span>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span class="ml-2">Google</span>
              </button>

              <button
                type="button"
                class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
                <span class="ml-2">Twitter</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/stores/notifications'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationsStore = useNotifications()

const showPassword = ref(false)
const loading = ref(false)
const form = ref({
  email: 'demo@plantry.com',
  password: 'demo123',
  rememberMe: false
})

const handleLogin = async () => {
  loading.value = true
  try {
    await authStore.login(form.value)
    notificationsStore.success('登录成功，欢迎回来！')
    router.push('/')
  } catch (error) {
    notificationsStore.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script> 