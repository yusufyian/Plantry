<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">⚙️ 设置</h1>
        <p class="text-gray-600">个性化您的 Plantry 体验</p>
      </div>

      <!-- 设置分类 -->
      <div class="space-y-8">
        <!-- 个人资料 -->
        <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <UserCircleIcon class="h-6 w-6 mr-2" />
            个人资料
          </h2>
          
          <div class="space-y-6">
            <div class="flex items-center space-x-6">
              <div class="relative">
                <div class="h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-2xl font-medium">
                  {{ userProfile.name.charAt(0) }}
                </div>
                <button class="absolute -bottom-1 -right-1 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                  <PencilIcon class="h-3 w-3" />
                </button>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900">{{ userProfile.name }}</h3>
                <p class="text-gray-600">{{ userProfile.email }}</p>
                <p class="text-sm text-gray-500">团队成员 · 加入于 {{ userProfile.joinDate }}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                <input 
                  v-model="userProfile.name"
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                <input 
                  v-model="userProfile.email"
                  type="email" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">时区</label>
                <select 
                  v-model="userProfile.timezone"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Asia/Shanghai">北京时间 (GMT+8)</option>
                  <option value="Asia/Tokyo">东京时间 (GMT+9)</option>
                  <option value="Europe/London">伦敦时间 (GMT+0)</option>
                  <option value="America/New_York">纽约时间 (GMT-5)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">语言</label>
                <select 
                  v-model="userProfile.language"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="zh-CN">中文简体</option>
                  <option value="zh-TW">中文繁体</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <BellIcon class="h-6 w-6 mr-2" />
            通知设置
          </h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between py-2">
              <div>
                <h3 class="text-sm font-medium text-gray-900">任务截止提醒</h3>
                <p class="text-sm text-gray-500">任务即将到期时发送通知</p>
              </div>
              <button 
                @click="toggleNotification('deadlineReminders')"
                :class="`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  notifications.deadlineReminders ? 'bg-blue-600' : 'bg-gray-200'
                }`"
              >
                <span :class="`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.deadlineReminders ? 'translate-x-5' : 'translate-x-0'
                }`" />
              </button>
            </div>
            
            <div class="flex items-center justify-between py-2">
              <div>
                <h3 class="text-sm font-medium text-gray-900">新任务通知</h3>
                <p class="text-sm text-gray-500">有新任务分配时通知</p>
              </div>
              <button 
                @click="toggleNotification('newTasks')"
                :class="`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  notifications.newTasks ? 'bg-blue-600' : 'bg-gray-200'
                }`"
              >
                <span :class="`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.newTasks ? 'translate-x-5' : 'translate-x-0'
                }`" />
              </button>
            </div>
            
            <div class="flex items-center justify-between py-2">
              <div>
                <h3 class="text-sm font-medium text-gray-900">团队活动通知</h3>
                <p class="text-sm text-gray-500">团队成员更新任务时通知</p>
              </div>
              <button 
                @click="toggleNotification('teamActivity')"
                :class="`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  notifications.teamActivity ? 'bg-blue-600' : 'bg-gray-200'
                }`"
              >
                <span :class="`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.teamActivity ? 'translate-x-5' : 'translate-x-0'
                }`" />
              </button>
            </div>
            
            <div class="flex items-center justify-between py-2">
              <div>
                <h3 class="text-sm font-medium text-gray-900">AI 建议通知</h3>
                <p class="text-sm text-gray-500">AI 系统有新建议时通知</p>
              </div>
              <button 
                @click="toggleNotification('aiSuggestions')"
                :class="`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  notifications.aiSuggestions ? 'bg-blue-600' : 'bg-gray-200'
                }`"
              >
                <span :class="`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.aiSuggestions ? 'translate-x-5' : 'translate-x-0'
                }`" />
              </button>
            </div>
          </div>
        </div>

        <!-- AI 设置 -->
        <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <CpuChipIcon class="h-6 w-6 mr-2" />
            AI 设置
          </h2>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">任务识别敏感度</label>
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-500">保守</span>
                <input 
                  v-model="aiSettings.sensitivity"
                  type="range" 
                  min="1" 
                  max="5" 
                  class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                >
                <span class="text-sm text-gray-500">激进</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                当前设置：{{ getSensitivityLabel(aiSettings.sensitivity) }}
              </p>
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">自动确认高置信度任务</h3>
                <p class="text-sm text-gray-500">置信度超过 90% 的任务自动添加到看板</p>
              </div>
              <button 
                @click="toggleAISetting('autoConfirm')"
                :class="`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  aiSettings.autoConfirm ? 'bg-blue-600' : 'bg-gray-200'
                }`"
              >
                <span :class="`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  aiSettings.autoConfirm ? 'translate-x-5' : 'translate-x-0'
                }`" />
              </button>
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">学习个人习惯</h3>
                <p class="text-sm text-gray-500">AI 根据您的使用习惯优化识别准确率</p>
              </div>
              <button 
                @click="toggleAISetting('personalLearning')"
                :class="`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  aiSettings.personalLearning ? 'bg-blue-600' : 'bg-gray-200'
                }`"
              >
                <span :class="`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  aiSettings.personalLearning ? 'translate-x-5' : 'translate-x-0'
                }`" />
              </button>
            </div>
          </div>
        </div>

        <!-- 隐私与安全 -->
        <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <ShieldCheckIcon class="h-6 w-6 mr-2" />
            隐私与安全
          </h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between py-2">
              <div>
                <h3 class="text-sm font-medium text-gray-900">端到端加密</h3>
                <p class="text-sm text-gray-500">所有数据传输采用端到端加密</p>
              </div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                已启用
              </span>
            </div>
            
            <div class="flex items-center justify-between py-2">
              <div>
                <h3 class="text-sm font-medium text-gray-900">数据本地存储</h3>
                <p class="text-sm text-gray-500">敏感数据仅存储在本地设备</p>
              </div>
              <button 
                @click="togglePrivacy('localStorage')"
                :class="`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  privacy.localStorage ? 'bg-blue-600' : 'bg-gray-200'
                }`"
              >
                <span :class="`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  privacy.localStorage ? 'translate-x-5' : 'translate-x-0'
                }`" />
              </button>
            </div>
            
            <div class="flex items-center justify-between py-2">
              <div>
                <h3 class="text-sm font-medium text-gray-900">匿名统计</h3>
                <p class="text-sm text-gray-500">帮助改进产品的匿名使用数据</p>
              </div>
              <button 
                @click="togglePrivacy('analytics')"
                :class="`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  privacy.analytics ? 'bg-blue-600' : 'bg-gray-200'
                }`"
              >
                <span :class="`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  privacy.analytics ? 'translate-x-5' : 'translate-x-0'
                }`" />
              </button>
            </div>
          </div>
          
          <div class="mt-6 pt-4 border-t border-gray-200">
            <button class="text-red-600 hover:text-red-700 text-sm font-medium">
              删除所有数据
            </button>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="flex justify-end space-x-4">
          <button class="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
            重置
          </button>
          <button 
            @click="saveSettings"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNotifications } from '@/stores/notifications'
import {
  UserCircleIcon,
  BellIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'

const notificationsStore = useNotifications()

const userProfile = ref({
  name: '演示用户',
  email: 'demo@plantry.com',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN',
  joinDate: '2024年1月'
})

const notifications = ref({
  deadlineReminders: true,
  newTasks: true,
  teamActivity: false,
  aiSuggestions: true
})

const aiSettings = ref({
  sensitivity: 3,
  autoConfirm: false,
  personalLearning: true
})

const privacy = ref({
  localStorage: true,
  analytics: true
})

const toggleNotification = (key) => {
  notifications.value[key] = !notifications.value[key]
}

const toggleAISetting = (key) => {
  aiSettings.value[key] = !aiSettings.value[key]
}

const togglePrivacy = (key) => {
  privacy.value[key] = !privacy.value[key]
}

const getSensitivityLabel = (value) => {
  const labels = {
    1: '非常保守',
    2: '保守',
    3: '平衡',
    4: '积极',
    5: '非常积极'
  }
  return labels[value] || '平衡'
}

const saveSettings = () => {
  notificationsStore.addNotification('设置已保存', 'success')
}
</script> 