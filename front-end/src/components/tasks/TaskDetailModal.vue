<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- 背景遮罩 -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- 模态框 -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
          <!-- 头部 -->
          <div class="flex items-start justify-between mb-6">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ task.title }}</h3>
              <div class="flex items-center space-x-4">
                <span :class="getStatusBadgeClass(task.status)">
                  {{ getStatusText(task.status) }}
                </span>
                <span :class="getPriorityBadgeClass(task.priority)">
                  {{ getPriorityText(task.priority) }}
                </span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button @click="$emit('edit', task)" class="text-gray-400 hover:text-gray-600">
                <PencilIcon class="w-5 h-5" />
              </button>
              <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- 内容 -->
          <div class="space-y-6">
            <!-- 基本信息 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-2">负责人</h4>
                <div v-if="task.assignee" class="flex items-center space-x-3">
                  <img :src="task.assignee.avatar" :alt="task.assignee.name" class="w-8 h-8 rounded-full" />
                  <span class="text-sm text-gray-700">{{ task.assignee.name }}</span>
                </div>
                <span v-else class="text-sm text-gray-400">未分配</span>
              </div>

              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-2">截止日期</h4>
                <div v-if="task.dueDate" class="flex items-center space-x-2">
                  <CalendarDaysIcon class="w-4 h-4 text-gray-400" />
                  <span :class="[
                    'text-sm',
                    isOverdue ? 'text-red-600' : isToday ? 'text-orange-600' : 'text-gray-700'
                  ]">
                    {{ formattedDueDate }}
                  </span>
                </div>
                <span v-else class="text-sm text-gray-400">未设置</span>
              </div>
            </div>

            <!-- 描述 -->
            <div v-if="task.description">
              <h4 class="text-sm font-medium text-gray-900 mb-2">任务描述</h4>
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ task.description }}</p>
            </div>

            <!-- 标签 -->
            <div v-if="task.tags && task.tags.length > 0">
              <h4 class="text-sm font-medium text-gray-900 mb-2">标签</h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tag in task.tags" 
                  :key="tag"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- 子任务 -->
            <div v-if="task.subtasks && task.subtasks.length > 0">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-medium text-gray-900">子任务</h4>
                <span class="text-xs text-gray-500">
                  {{ completedSubtasks }}/{{ task.subtasks.length }} 已完成
                </span>
              </div>
              <div class="space-y-2">
                <div v-for="subtask in task.subtasks" :key="subtask.id" class="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    v-model="subtask.completed"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    @change="updateSubtask(subtask)"
                  />
                  <span :class="[
                    'text-sm',
                    subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'
                  ]">
                    {{ subtask.title }}
                  </span>
                </div>
              </div>
              <div class="mt-3">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-green-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${subtaskProgress}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 时间信息 -->
            <div class="border-t pt-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span class="font-medium">创建时间：</span>
                  {{ dayjs(task.createdAt).format('YYYY-MM-DD HH:mm') }}
                </div>
                <div v-if="task.completedAt">
                  <span class="font-medium">完成时间：</span>
                  {{ dayjs(task.completedAt).format('YYYY-MM-DD HH:mm') }}
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center justify-between mt-8 pt-4 border-t">
            <div class="flex space-x-3">
              <button
                v-if="task.status !== 'done'"
                @click="markAsCompleted"
                class="btn-primary"
              >
                <CheckIcon class="w-4 h-4 mr-2" />
                标记完成
              </button>
              <button
                @click="$emit('edit', task)"
                class="btn-secondary"
              >
                <PencilIcon class="w-4 h-4 mr-2" />
                编辑任务
              </button>
            </div>
            <button
              @click="confirmDelete"
              class="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              删除任务
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { 
  XMarkIcon, 
  PencilIcon, 
  CheckIcon, 
  CalendarDaysIcon 
} from '@heroicons/vue/24/outline'
import { useTasksStore } from '@/stores/tasks'
import { useNotifications } from '@/stores/notifications'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'edit', 'delete'])

const tasksStore = useTasksStore()
const notificationsStore = useNotifications()

// 计算属性
const completedSubtasks = computed(() => {
  return props.task.subtasks?.filter(subtask => subtask.completed).length || 0
})

const subtaskProgress = computed(() => {
  const total = props.task.subtasks?.length || 0
  if (total === 0) return 0
  return Math.round((completedSubtasks.value / total) * 100)
})

const formattedDueDate = computed(() => {
  if (!props.task.dueDate) return ''
  return dayjs(props.task.dueDate).format('YYYY年MM月DD日')
})

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.status === 'done') return false
  return dayjs(props.task.dueDate).isBefore(dayjs(), 'day')
})

const isToday = computed(() => {
  if (!props.task.dueDate) return false
  return dayjs(props.task.dueDate).isSame(dayjs(), 'day')
})

// 状态和优先级显示
const getStatusText = (status) => {
  const map = {
    seed: '种子',
    sprout: '萌芽',
    blossom: '开花',
    done: '完成'
  }
  return map[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    seed: 'bg-yellow-100 text-yellow-800',
    sprout: 'bg-green-100 text-green-800',
    blossom: 'bg-purple-100 text-purple-800',
    done: 'bg-blue-100 text-blue-800'
  }
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[status] || 'bg-gray-100 text-gray-800'}`
}

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
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[priority] || 'bg-gray-100 text-gray-800'}`
}

// 操作方法
const updateSubtask = (subtask) => {
  tasksStore.updateTask(props.task.id, {
    subtasks: props.task.subtasks
  })
}

const markAsCompleted = () => {
  tasksStore.updateTaskStatus(props.task.id, 'done')
  notificationsStore.success('任务已标记为完成')
  emit('close')
}

const confirmDelete = () => {
  if (confirm('确定要删除这个任务吗？此操作不可撤销。')) {
    emit('delete', props.task.id)
  }
}
</script> 