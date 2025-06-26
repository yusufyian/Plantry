<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold gradient-text mb-2">任务确认箱 📥</h1>
        <p class="text-gray-600">AI 从 Telegram 消息中识别的任务候选，等待您的确认</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 text-sm">待确认</p>
              <p class="text-2xl font-bold">{{ pendingTasks.length }}</p>
            </div>
            <ClockIcon class="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div class="card bg-gradient-to-r from-green-400 to-emerald-500 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">今日已确认</p>
              <p class="text-2xl font-bold">{{ todayConfirmed }}</p>
            </div>
            <CheckCircleIcon class="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div class="card bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">AI 准确率</p>
              <p class="text-2xl font-bold">{{ accuracyRate }}%</p>
            </div>
            <CpuChipIcon class="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      <!-- 过滤和操作栏 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div class="flex items-center space-x-4 mb-4 md:mb-0">
          <div class="flex items-center space-x-2">
            <label for="confidence" class="text-sm text-gray-600">置信度:</label>
            <select 
              id="confidence" 
              v-model="confidenceFilter"
              class="border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
            >
              <option value="all">全部</option>
              <option value="high">高 (>80%)</option>
              <option value="medium">中 (60-80%)</option>
              <option value="low">低 (<60%)</option>
            </select>
          </div>
          <div class="flex items-center space-x-2">
            <label for="source" class="text-sm text-gray-600">来源:</label>
            <select 
              id="source" 
              v-model="sourceFilter"
              class="border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
            >
              <option value="all">全部</option>
              <option value="telegram">Telegram</option>
              <option value="email">邮件</option>
              <option value="slack">Slack</option>
            </select>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button @click="selectAll" class="btn-secondary text-sm">
            全选
          </button>
          <button @click="batchConfirm" :disabled="selectedTasks.length === 0" class="btn-primary text-sm">
            批量确认 ({{ selectedTasks.length }})
          </button>
          <button @click="batchReject" :disabled="selectedTasks.length === 0" class="text-red-600 hover:text-red-800 text-sm font-medium">
            批量忽略 ({{ selectedTasks.length }})
          </button>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="space-y-4">
        <div v-if="filteredTasks.length === 0" class="text-center py-12">
          <InboxIcon class="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无待确认任务</h3>
          <p class="text-gray-500">AI 会持续监听 Telegram 消息，发现任务候选时会出现在这里</p>
        </div>

        <div 
          v-for="task in filteredTasks" 
          :key="task.id"
          class="card hover:shadow-lg transition-all duration-200"
        >
          <div class="flex items-start space-x-4">
            <!-- 选择框 -->
            <input
              type="checkbox"
              v-model="selectedTasks"
              :value="task.id"
              class="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />

            <!-- 置信度指示器 -->
            <div class="flex-shrink-0 mt-1">
              <div 
                :class="[
                  'w-3 h-3 rounded-full',
                  getConfidenceColor(task.confidence_score)
                ]"
                :title="`置信度: ${Math.round(task.confidence_score * 100)}%`"
              ></div>
            </div>

            <!-- 主要内容 -->
            <div class="flex-1 min-w-0">
              <!-- 原始消息 -->
              <div class="mb-4">
                                  <div class="flex items-center justify-between mb-2">
                    <h4 class="text-sm font-medium text-gray-900">原始消息</h4>
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500">
                        {{ dayjs(task.created_at).format('MM-DD HH:mm') }}
                      </span>
                      <span :class="getSourceBadgeClass('telegram')">
                        {{ getSourceText('telegram') }}
                      </span>
                    </div>
                  </div>
                <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  "{{ task.original_message }}"
                </div>
              </div>

              <!-- 识别结果 -->
              <div class="mb-4">
                <h4 class="text-sm font-medium text-gray-900 mb-2">AI 识别结果</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="text-xs text-gray-500">任务标题:</span>
                    <p class="text-sm font-medium text-gray-900">{{ task.extracted_data.title }}</p>
                  </div>
                  <div v-if="task.extracted_data.assignee_username">
                    <span class="text-xs text-gray-500">负责人:</span>
                    <p class="text-sm text-gray-700">{{ task.extracted_data.assignee_username }}</p>
                  </div>
                  <div v-if="task.extracted_data.due_date">
                    <span class="text-xs text-gray-500">截止日期:</span>
                    <p class="text-sm text-gray-700">{{ dayjs(task.extracted_data.due_date).format('YYYY-MM-DD') }}</p>
                  </div>
                  <div>
                    <span class="text-xs text-gray-500">优先级:</span>
                    <span :class="getPriorityBadgeClass(task.extracted_data.priority)">
                      {{ getPriorityText(task.extracted_data.priority) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 置信度详情 -->
              <div class="mb-4">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">AI 置信度</span>
                  <span class="text-xs font-medium text-gray-700">{{ Math.round(task.confidence_score * 100) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    :class="[
                      'h-2 rounded-full transition-all duration-300',
                      getConfidenceBarColor(task.confidence_score)
                    ]"
                    :style="{ width: `${task.confidence_score * 100}%` }"
                  ></div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex items-center justify-between">
                <div class="flex space-x-3">
                  <button 
                    @click="confirmTask(task)"
                    class="btn-primary text-sm"
                  >
                    <CheckIcon class="w-4 h-4 mr-1" />
                    确认任务
                  </button>
                  <button 
                    @click="showEditModal(task)"
                    class="btn-secondary text-sm"
                  >
                    <PencilIcon class="w-4 h-4 mr-1" />
                    编辑后确认
                  </button>
                </div>
                <button 
                  @click="rejectTask(task.id)"
                  class="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  忽略
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑模态框 -->
    <TaskEditModal
      v-if="editingTask"
      :inbox-task="editingTask"
      @close="editingTask = null"
      @save="handleEditSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '../stores/tasks.js'
import { useTeamsStore } from '../stores/teams.js'
import { useNotifications } from '../stores/notifications.js'
import { ENUMS } from '../config/database.js'
import dayjs from 'dayjs'
import {
  ClockIcon,
  CheckCircleIcon,
  CpuChipIcon,
  InboxIcon,
  CheckIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'
import TaskEditModal from '@/components/inbox/TaskEditModal.vue'

const tasksStore = useTasksStore()
const teamsStore = useTeamsStore()
const { notify } = useNotifications()

const confidenceFilter = ref('all')
const sourceFilter = ref('all')
const selectedTasks = ref([])
const editingTask = ref(null)

const pendingTasks = computed(() => tasksStore.pendingExtractions)

// 过滤任务
const filteredTasks = computed(() => {
  let tasks = pendingTasks.value

  // 按置信度过滤
  if (confidenceFilter.value !== 'all') {
    tasks = tasks.filter(task => {
      const confidence = task.confidence_score
      switch (confidenceFilter.value) {
        case 'high': return confidence > 0.8
        case 'medium': return confidence >= 0.6 && confidence <= 0.8
        case 'low': return confidence < 0.6
        default: return true
      }
    })
  }

  // 按来源过滤 (目前主要是telegram)
  if (sourceFilter.value !== 'all' && sourceFilter.value !== 'telegram') {
    tasks = []
  }

  return tasks
})

// 统计数据
const todayConfirmed = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return tasksStore.tasks.filter(task => 
    task.ai_extracted && 
    dayjs(task.created_at).format('YYYY-MM-DD') === today
  ).length
})

const accuracyRate = 89 // 模拟数据

// 置信度相关
const getConfidenceColor = (confidence) => {
  if (confidence > 0.8) return 'bg-green-500'
  if (confidence > 0.6) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getConfidenceBarColor = (confidence) => {
  if (confidence > 0.8) return 'bg-green-500'
  if (confidence > 0.6) return 'bg-yellow-500'
  return 'bg-red-500'
}

// 来源相关
const getSourceText = (source) => {
  const map = {
    telegram: 'Telegram',
    email: '邮件',
    slack: 'Slack'
  }
  return map[source] || source
}

const getSourceBadgeClass = (source) => {
  const classes = {
    telegram: 'bg-blue-100 text-blue-800',
    email: 'bg-purple-100 text-purple-800',
    slack: 'bg-green-100 text-green-800'
  }
  return `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes[source] || 'bg-gray-100 text-gray-800'}`
}

// 优先级相关
const getPriorityText = (priority) => {
  const map = { high: '高', medium: '中', low: '低' }
  return map[priority] || priority
}

const getPriorityBadgeClass = (priority) => {
  const classes = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }
  return `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes[priority] || 'bg-gray-100 text-gray-800'}`
}

// 操作方法
const selectAll = () => {
  if (selectedTasks.value.length === filteredTasks.value.length) {
    selectedTasks.value = []
  } else {
    selectedTasks.value = filteredTasks.value.map(task => task.id)
  }
}

const confirmTask = async (task) => {
  try {
    await tasksStore.confirmExtraction(task.id)
    notify(`任务"${task.extracted_data.title}"已确认并添加到看板`, 'success')
    
    // 从选择列表中移除
    selectedTasks.value = selectedTasks.value.filter(id => id !== task.id)
  } catch (error) {
    notify('确认任务失败', 'error')
  }
}

const rejectTask = async (taskId) => {
  try {
    await tasksStore.rejectExtraction(taskId)
    notify('任务已忽略', 'info')
    
    // 从选择列表中移除
    selectedTasks.value = selectedTasks.value.filter(id => id !== taskId)
  } catch (error) {
    notify('忽略任务失败', 'error')
  }
}

const batchConfirm = async () => {
  const count = selectedTasks.value.length
  try {
    for (const taskId of selectedTasks.value) {
      await tasksStore.confirmExtraction(taskId)
    }
    selectedTasks.value = []
    notify(`已确认 ${count} 个任务`, 'success')
  } catch (error) {
    notify('批量确认失败', 'error')
  }
}

const batchReject = async () => {
  const count = selectedTasks.value.length
  try {
    for (const taskId of selectedTasks.value) {
      await tasksStore.rejectExtraction(taskId)
    }
    selectedTasks.value = []
    notify(`已忽略 ${count} 个任务`, 'info')
  } catch (error) {
    notify('批量忽略失败', 'error')
  }
}

const showEditModal = (task) => {
  editingTask.value = task
}

const handleEditSave = async (taskData) => {
  // 更新任务数据后确认
  const task = pendingTasks.value.find(t => t.id === editingTask.value.id)
  if (task) {
    // 更新提取的任务数据
    Object.assign(task.extracted_data, taskData)
    // 确认任务
    await confirmTask(task)
  }
  editingTask.value = null
}

// 初始化数据
onMounted(async () => {
  await teamsStore.loadMyTeams()
  if (teamsStore.currentTeam) {
    await tasksStore.initialize(teamsStore.currentTeam.id)
  }
})
</script> 