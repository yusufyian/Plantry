<template>
  <div 
    :class="[
      'kanban-card group',
      priorityColors[task.priority],
      { 'opacity-60': task.status === 'done' }
    ]"
    @click="$emit('click', task)"
  >
    <!-- 卡片头部 -->
    <div class="flex items-start justify-between mb-3">
      <h3 class="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
        {{ task.title }}
      </h3>
      <div class="flex items-center space-x-1 ml-2 flex-shrink-0">
        <span :class="[
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
          priorityClasses[task.priority]
        ]">
          {{ priorityText[task.priority] }}
        </span>
      </div>
    </div>
    
    <!-- 卡片内容 -->
    <p v-if="task.description" class="text-xs text-gray-500 mb-3 line-clamp-2">
      {{ task.description }}
    </p>
    
    <!-- 标签 -->
    <div v-if="task.tags && task.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
      <span 
        v-for="tag in task.tags" 
        :key="tag"
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
      >
        {{ tag }}
      </span>
    </div>
    
    <!-- 子任务进度 -->
    <div v-if="task.subtasks && task.subtasks.length > 0" class="mb-3">
      <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>子任务</span>
        <span>{{ completedSubtasks }}/{{ task.subtasks.length }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          class="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
          :style="{ width: `${subtaskProgress}%` }"
        ></div>
      </div>
    </div>
    
    <!-- 卡片底部 -->
    <div class="flex items-center justify-between">
      <!-- 负责人头像 -->
      <div v-if="task.assignee" class="flex items-center space-x-2">
        <img 
          :src="task.assignee.avatar" 
          :alt="task.assignee.name"
          class="w-6 h-6 rounded-full border-2 border-white shadow-sm"
        />
        <span class="text-xs text-gray-600">{{ task.assignee.name }}</span>
      </div>
      <div v-else class="text-xs text-gray-400">未分配</div>
      
      <!-- 截止日期 -->
      <div v-if="task.dueDate" :class="[
        'text-xs flex items-center space-x-1',
        isOverdue ? 'text-red-500' : isToday ? 'text-orange-500' : 'text-gray-500'
      ]">
        <ClockIcon class="w-3 h-3" />
        <span>{{ formattedDueDate }}</span>
      </div>
    </div>
    
    <!-- 悬浮操作按钮 -->
    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        @click.stop="$emit('edit', task)"
        class="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
      >
        <PencilIcon class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { ClockIcon, PencilIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'edit'])

// 优先级配置
const priorityColors = {
  high: 'border-red-400',
  medium: 'border-yellow-400',
  low: 'border-green-400'
}

const priorityClasses = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
}

const priorityText = {
  high: '高',
  medium: '中',
  low: '低'
}

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
  return dayjs(props.task.dueDate).format('MM/DD')
})

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.status === 'done') return false
  return dayjs(props.task.dueDate).isBefore(dayjs(), 'day')
})

const isToday = computed(() => {
  if (!props.task.dueDate) return false
  return dayjs(props.task.dueDate).isSame(dayjs(), 'day')
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 