<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold gradient-text">欢迎回来，{{ userInfo?.name }}</h1>
        <p class="text-gray-600 mt-2">让我们一起种下想法，见证成长 🌱</p>
      </div>

      <!-- 快速统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">总任务数</p>
              <p class="text-2xl font-bold">{{ totalTasks }}</p>
            </div>
            <RectangleStackIcon class="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div class="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">已完成</p>
              <p class="text-2xl font-bold">{{ completedTasks }}</p>
            </div>
            <CheckCircleIcon class="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div class="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-100 text-sm">进行中</p>
              <p class="text-2xl font-bold">{{ inProgressTasks }}</p>
            </div>
            <PlayIcon class="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div class="card bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-red-100 text-sm">即将到期</p>
              <p class="text-2xl font-bold">{{ overdueTasks.length }}</p>
            </div>
            <ExclamationTriangleIcon class="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧主要内容 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 待确认任务 -->
          <div v-if="pendingInboxTasks.length > 0" class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <InboxIcon class="w-5 h-5 mr-2 text-green-600" />
                待确认任务
                <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {{ pendingInboxTasks.length }}
                </span>
              </h2>
              <router-link to="/inbox" class="text-sm text-green-600 hover:text-green-700 font-medium">
                查看全部 →
              </router-link>
            </div>
            <div class="space-y-3">
              <div 
                v-for="task in pendingInboxTasks.slice(0, 3)" 
                :key="task.id"
                class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <p class="text-sm text-gray-600 mb-2">原始消息：{{ task.originalMessage }}</p>
                <p class="text-sm font-medium text-gray-900">识别任务：{{ task.extractedTask.title }}</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-xs text-gray-500">
                    置信度：{{ Math.round(task.confidence * 100) }}%
                  </span>
                  <div class="flex space-x-2">
                    <button 
                      @click="confirmTask(task.id)"
                      class="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      确认
                    </button>
                    <button 
                      @click="rejectTask(task.id)"
                      class="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                    >
                      忽略
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 最近任务动态 -->
          <div class="card">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon class="w-5 h-5 mr-2 text-green-600" />
              最近活动
            </h2>
            <div class="space-y-4">
              <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    activity.type === 'created' ? 'bg-green-100' : 
                    activity.type === 'completed' ? 'bg-blue-100' : 'bg-yellow-100'
                  ]">
                    <component :is="activity.icon" :class="[
                      'w-4 h-4',
                      activity.type === 'created' ? 'text-green-600' : 
                      activity.type === 'completed' ? 'text-blue-600' : 'text-yellow-600'
                    ]" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900">
                    <span class="font-medium">{{ activity.user }}</span>
                    {{ activity.action }}
                    <span class="font-medium">{{ activity.task }}</span>
                  </p>
                  <p class="text-xs text-gray-500">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 今日任务概览 -->
          <div class="card">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarDaysIcon class="w-5 h-5 mr-2 text-green-600" />
              今日任务
            </h2>
            <div class="space-y-3">
              <div v-if="todayTasks.length === 0" class="text-center py-8 text-gray-500">
                <CalendarDaysIcon class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>今天没有到期的任务</p>
                <p class="text-sm">享受轻松的一天吧！</p>
              </div>
              <TaskCard 
                v-for="task in todayTasks" 
                :key="task.id" 
                :task="task"
                @click="goToBoard"
              />
            </div>
          </div>
        </div>

        <!-- 右侧边栏 -->
        <div class="space-y-6">
          <!-- 快速操作 -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
            <div class="space-y-3">
              <router-link to="/board" class="block w-full btn-primary text-center">
                查看看板
              </router-link>
              <router-link to="/inbox" class="block w-full btn-secondary text-center">
                任务确认箱
              </router-link>
              <router-link to="/telegram" class="block w-full btn-secondary text-center">
                Telegram 集成
              </router-link>
            </div>
          </div>

          <!-- 团队效率趋势 -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">本周效率</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">任务完成率</span>
                <span class="text-sm font-medium text-green-600">{{ completionRate }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-green-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${completionRate}%` }"
                ></div>
              </div>
              <div class="grid grid-cols-2 gap-4 pt-2">
                <div class="text-center">
                  <p class="text-2xl font-bold text-gray-900">{{ thisWeekCompleted }}</p>
                  <p class="text-xs text-gray-600">本周完成</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-gray-900">{{ thisWeekCreated }}</p>
                  <p class="text-xs text-gray-600">本周新增</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Telegram Bot 状态 -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Telegram Bot</h3>
            <div class="flex items-center space-x-3 mb-3">
              <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-gray-600">Bot 运行正常</span>
            </div>
            <div class="text-xs text-gray-500 space-y-1">
              <p>• 本周捕获 {{ weeklyCapture }} 条消息</p>
              <p>• 识别 {{ weeklyTasks }} 个任务候选</p>
              <p>• 准确率 {{ accuracy }}%</p>
            </div>
            <router-link to="/telegram" class="mt-3 block text-sm text-green-600 hover:text-green-700">
              查看详情 →
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { useNotifications } from '@/stores/notifications'
import dayjs from 'dayjs'
import {
  RectangleStackIcon,
  CheckCircleIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  ClockIcon,
  CalendarDaysIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import TaskCard from '@/components/common/TaskCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const tasksStore = useTasksStore()
const notificationsStore = useNotifications()

const userInfo = computed(() => authStore.userInfo)
const tasks = computed(() => tasksStore.tasks)
const pendingInboxTasks = computed(() => tasksStore.pendingExtractions || [])
const overdueTasks = computed(() => tasksStore.overdueTasks)

// 统计数据
const totalTasks = computed(() => tasks.value.length)
const completedTasks = computed(() => tasks.value.filter(t => t.status === 'done').length)
const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'sprout' || t.status === 'blossom').length)

// 今日任务
const todayTasks = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return tasks.value.filter(task => 
    task.dueDate && dayjs(task.dueDate).format('YYYY-MM-DD') === today && task.status !== 'done'
  )
})

// 完成率
const completionRate = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((completedTasks.value / totalTasks.value) * 100)
})

// 本周数据
const thisWeekCompleted = computed(() => {
  const weekStart = dayjs().startOf('week')
  return tasks.value.filter(task => 
    task.completedAt && dayjs(task.completedAt).isAfter(weekStart)
  ).length
})

const thisWeekCreated = computed(() => {
  const weekStart = dayjs().startOf('week')
  return tasks.value.filter(task => 
    dayjs(task.createdAt).isAfter(weekStart)
  ).length
})

// 模拟数据
const weeklyCapture = 145
const weeklyTasks = 23
const accuracy = 89

// 最近活动
const recentActivities = computed(() => [
  {
    id: 1,
    type: 'created',
    user: '张三',
    action: '创建了任务',
    task: '设计新的登录页面',
    time: '2 小时前',
    icon: PlusIcon
  },
  {
    id: 2,
    type: 'completed',
    user: '李四',
    action: '完成了任务',
    task: 'API 接口开发',
    time: '4 小时前',
    icon: CheckCircleIcon
  },
  {
    id: 3,
    type: 'updated',
    user: '王五',
    action: '更新了任务',
    task: '数据库设计优化',
    time: '6 小时前',
    icon: ArrowPathIcon
  }
])

// 操作方法
const confirmTask = (taskId) => {
  tasksStore.confirmInboxTask(taskId)
  notificationsStore.success('任务已确认并添加到看板')
}

const rejectTask = (taskId) => {
  tasksStore.rejectInboxTask(taskId)
  notificationsStore.info('任务已忽略')
}

const goToBoard = () => {
  router.push('/board')
}
</script> 