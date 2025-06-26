<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">📱 Telegram 集成</h1>
        <p class="text-gray-600">连接您的 Telegram，开启 AI 智能任务管理</p>
      </div>

      <!-- 连接状态卡片 -->
      <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">连接状态</h2>
          <div class="flex items-center space-x-2">
            <div :class="`h-3 w-3 rounded-full ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`"></div>
            <span :class="`text-sm font-medium ${connectionStatus.connected ? 'text-green-700' : 'text-red-700'}`">
              {{ connectionStatus.connected ? '已连接' : '未连接' }}
            </span>
          </div>
        </div>
        
        <div v-if="!connectionStatus.connected" class="text-center py-8">
          <div class="mb-6">
            <div class="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftRightIcon class="h-8 w-8 text-blue-600" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">连接您的 Telegram</h3>
            <p class="text-gray-600 mb-6">通过 Telegram Bot 开启智能任务管理体验</p>
          </div>
          
          <div class="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h4 class="font-medium text-blue-900 mb-3">连接步骤：</h4>
            <ol class="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>在 Telegram 中搜索 <code class="bg-blue-200 px-1 rounded">@PlantryBot</code></li>
              <li>发送 <code class="bg-blue-200 px-1 rounded">/start</code> 命令启动机器人</li>
              <li>点击下方按钮获取连接码</li>
              <li>将连接码发送给机器人完成绑定</li>
            </ol>
          </div>
          
          <button 
            @click="generateConnectionCode"
            :disabled="loading"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {{ loading ? '生成中...' : '获取连接码' }}
          </button>
          
          <div v-if="connectionCode" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 mb-2">您的连接码：</p>
            <div class="flex items-center justify-center space-x-2">
              <code class="bg-white px-4 py-2 rounded border text-lg font-mono">{{ connectionCode }}</code>
              <button 
                @click="copyCode"
                class="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ClipboardIcon class="h-5 w-5" />
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-2">连接码将在 5 分钟后过期</p>
          </div>
        </div>
        
        <div v-else class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckIcon class="h-6 w-6 text-white" />
              </div>
              <div>
                <p class="font-medium text-green-900">{{ connectionStatus.botInfo.name }}</p>
                <p class="text-sm text-green-700">@{{ connectionStatus.botInfo.username }}</p>
              </div>
            </div>
            <button 
              @click="disconnectBot"
              class="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              断开连接
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-2xl font-bold text-gray-900">{{ stats.messagesProcessed }}</p>
              <p class="text-sm text-gray-600">已处理消息</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-2xl font-bold text-gray-900">{{ stats.tasksExtracted }}</p>
              <p class="text-sm text-gray-600">识别任务</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-2xl font-bold text-gray-900">{{ stats.accuracy }}%</p>
              <p class="text-sm text-gray-600">识别准确率</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 消息监听设置 -->
      <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <EyeIcon class="h-6 w-6 mr-2" />
          消息监听设置
        </h2>
        
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-900">监听群组消息</h3>
              <p class="text-sm text-gray-500">从群组聊天中提取任务信息</p>
            </div>
            <button 
              @click="toggleSetting('groupMessages')"
              :class="`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.groupMessages ? 'bg-blue-600' : 'bg-gray-200'
              }`"
            >
              <span :class="`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.groupMessages ? 'translate-x-5' : 'translate-x-0'
              }`" />
            </button>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-900">监听私聊消息</h3>
              <p class="text-sm text-gray-500">从与机器人的私聊中提取任务</p>
            </div>
            <button 
              @click="toggleSetting('privateMessages')"
              :class="`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.privateMessages ? 'bg-blue-600' : 'bg-gray-200'
              }`"
            >
              <span :class="`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.privateMessages ? 'translate-x-5' : 'translate-x-0'
              }`" />
            </button>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-900">实时通知</h3>
              <p class="text-sm text-gray-500">新任务识别时立即通知</p>
            </div>
            <button 
              @click="toggleSetting('realTimeNotifications')"
              :class="`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.realTimeNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`"
            >
              <span :class="`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.realTimeNotifications ? 'translate-x-5' : 'translate-x-0'
              }`" />
            </button>
          </div>
        </div>
      </div>

      <!-- AI 识别配置 -->
      <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <CpuChipIcon class="h-6 w-6 mr-2" />
          AI 识别配置
        </h2>
        
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">关键词触发</label>
            <div class="space-y-2">
              <div class="flex flex-wrap gap-2">
                <span v-for="keyword in aiConfig.keywords" :key="keyword" 
                      class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {{ keyword }}
                  <button @click="removeKeyword(keyword)" class="ml-2 hover:text-blue-600">
                    <XMarkIcon class="h-3 w-3" />
                  </button>
                </span>
              </div>
              <div class="flex space-x-2">
                <input 
                  v-model="newKeyword"
                  @keyup.enter="addKeyword"
                  placeholder="添加关键词..."
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <button 
                  @click="addKeyword"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">最低置信度阈值</label>
            <div class="flex items-center space-x-4">
              <input 
                v-model="aiConfig.confidenceThreshold"
                type="range" 
                min="50" 
                max="95" 
                class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              >
              <span class="text-sm font-medium text-gray-900 w-12">{{ aiConfig.confidenceThreshold }}%</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">低于此阈值的任务将被过滤</p>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-900">智能学习</h3>
              <p class="text-sm text-gray-500">AI 根据您的确认反馈自动优化</p>
            </div>
            <button 
              @click="toggleAIConfig('smartLearning')"
              :class="`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                aiConfig.smartLearning ? 'bg-blue-600' : 'bg-gray-200'
              }`"
            >
              <span :class="`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                aiConfig.smartLearning ? 'translate-x-5' : 'translate-x-0'
              }`" />
            </button>
          </div>
        </div>
      </div>

      <!-- 测试区域 -->
      <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
        <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <BeakerIcon class="h-6 w-6 mr-2" />
          连接测试
        </h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">测试消息</label>
            <textarea 
              v-model="testMessage"
              placeholder="输入一条测试消息，看看 AI 能否识别出任务..."
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
          
          <div class="flex space-x-4">
            <button 
              @click="testMessage && analyzeMessage()"
              :disabled="!testMessage || testing"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {{ testing ? '分析中...' : '分析消息' }}
            </button>
            <button 
              @click="sendTestNotification"
              class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              测试通知
            </button>
          </div>
          
          <div v-if="testResult" class="p-4 bg-gray-50 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-2">分析结果：</h4>
            <div v-if="testResult.tasks.length > 0">
              <div v-for="(task, index) in testResult.tasks" :key="index" 
                   class="mb-3 p-3 bg-white rounded border">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium">{{ task.title }}</span>
                  <span :class="`px-2 py-1 text-xs rounded-full ${getConfidenceClass(task.confidence)}`">
                    {{ task.confidence }}%
                  </span>
                </div>
                <p class="text-sm text-gray-600">{{ task.description }}</p>
              </div>
            </div>
            <div v-else>
              <p class="text-gray-600">未识别到任务信息</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNotifications } from '@/stores/notifications'
import {
  ChatBubbleLeftRightIcon,
  ClipboardIcon,
  CheckIcon,
  EyeIcon,
  CpuChipIcon,
  BeakerIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const notificationsStore = useNotifications()

const connectionStatus = ref({
  connected: false,
  botInfo: {
    name: 'Plantry Bot',
    username: 'PlantryBot'
  }
})

const loading = ref(false)
const testing = ref(false)
const connectionCode = ref('')
const testMessage = ref('')
const testResult = ref(null)
const newKeyword = ref('')

const stats = ref({
  messagesProcessed: 1247,
  tasksExtracted: 89,
  accuracy: 94
})

const settings = ref({
  groupMessages: true,
  privateMessages: true,
  realTimeNotifications: false
})

const aiConfig = ref({
  keywords: ['任务', '待办', '需要', '记得', '安排', '完成'],
  confidenceThreshold: 75,
  smartLearning: true
})

const generateConnectionCode = async () => {
  loading.value = true
  // 模拟生成连接码
  setTimeout(() => {
    connectionCode.value = 'PLANTRY-' + Math.random().toString(36).substr(2, 8).toUpperCase()
    loading.value = false
  }, 1000)
}

const copyCode = () => {
  navigator.clipboard.writeText(connectionCode.value)
  notificationsStore.addNotification('连接码已复制', 'success')
}

const disconnectBot = () => {
  connectionStatus.value.connected = false
  notificationsStore.addNotification('已断开 Telegram 连接', 'info')
}

const toggleSetting = (key) => {
  settings.value[key] = !settings.value[key]
}

const toggleAIConfig = (key) => {
  aiConfig.value[key] = !aiConfig.value[key]
}

const addKeyword = () => {
  if (newKeyword.value && !aiConfig.value.keywords.includes(newKeyword.value)) {
    aiConfig.value.keywords.push(newKeyword.value)
    newKeyword.value = ''
  }
}

const removeKeyword = (keyword) => {
  const index = aiConfig.value.keywords.indexOf(keyword)
  if (index > -1) {
    aiConfig.value.keywords.splice(index, 1)
  }
}

const analyzeMessage = async () => {
  testing.value = true
  // 模拟 AI 分析
  setTimeout(() => {
    testResult.value = {
      tasks: [
        {
          title: '完成项目报告',
          description: '根据消息内容分析得出的任务',
          confidence: 87
        }
      ]
    }
    testing.value = false
  }, 1500)
}

const sendTestNotification = () => {
  notificationsStore.addNotification('这是一条测试通知', 'info')
}

const getConfidenceClass = (confidence) => {
  if (confidence >= 80) return 'bg-green-100 text-green-800'
  if (confidence >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}
</script> 