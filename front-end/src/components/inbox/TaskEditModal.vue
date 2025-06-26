<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- 背景遮罩 -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- 模态框 -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              编辑并确认任务
            </h3>
            <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- 原始消息显示 -->
          <div class="mb-6 p-3 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-2">原始消息</h4>
            <p class="text-sm text-gray-600">"{{ inboxTask.originalMessage }}"</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- 标题 -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700">任务标题</label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="输入任务标题"
              />
            </div>

            <!-- 描述 -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">任务描述</label>
              <textarea
                id="description"
                v-model="form.description"
                rows="3"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="描述任务详情（可选）"
              ></textarea>
            </div>

            <!-- 负责人 -->
            <div>
              <label for="assignee" class="block text-sm font-medium text-gray-700">负责人</label>
              <select
                id="assignee"
                v-model="form.assigneeId"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              >
                <option value="">请选择负责人</option>
                <option v-for="member in teamMembers" :key="member.id" :value="member.id">
                  {{ member.name }}
                </option>
              </select>
            </div>

            <!-- 优先级 -->
            <div>
              <label for="priority" class="block text-sm font-medium text-gray-700">优先级</label>
              <select
                id="priority"
                v-model="form.priority"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>

            <!-- 截止日期 -->
            <div>
              <label for="dueDate" class="block text-sm font-medium text-gray-700">截止日期</label>
              <input
                id="dueDate"
                v-model="form.dueDate"
                type="date"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <!-- 标签 -->
            <div>
              <label for="tags" class="block text-sm font-medium text-gray-700">标签</label>
              <input
                id="tags"
                v-model="tagsInput"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="用逗号分隔多个标签"
              />
              <div v-if="form.tags.length > 0" class="mt-2 flex flex-wrap gap-2">
                <span 
                  v-for="tag in form.tags" 
                  :key="tag"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                >
                  {{ tag }}
                  <button @click="removeTag(tag)" class="ml-1 text-gray-400 hover:text-gray-600">
                    <XMarkIcon class="w-3 h-3" />
                  </button>
                </span>
              </div>
            </div>
          </form>

          <!-- AI 置信度显示 -->
          <div class="mt-4 p-3 bg-blue-50 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-blue-800">AI 识别置信度</span>
              <span class="text-sm text-blue-600">{{ Math.round(inboxTask.confidence * 100) }}%</span>
            </div>
            <div class="w-full bg-blue-200 rounded-full h-2">
              <div 
                class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${inboxTask.confidence * 100}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="handleSubmit"
            :disabled="!form.title.trim()"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 btn-primary text-base font-medium sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认并创建任务
          </button>
          <button
            @click="$emit('close')"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import dayjs from 'dayjs'

const props = defineProps({
  inboxTask: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

// 模拟团队成员数据
const teamMembers = [
  { id: 'zhang', name: '张三' },
  { id: 'li', name: '李四' },
  { id: 'wang', name: '王五' },
  { id: 'zhao', name: '赵六' }
]

const form = ref({
  title: '',
  description: '',
  assigneeId: '',
  priority: 'medium',
  dueDate: '',
  tags: ['Telegram']
})

const tagsInput = ref('')

// 初始化表单
const initializeForm = () => {
  const extracted = props.inboxTask.extractedTask
  form.value = {
    title: extracted.title || '',
    description: `从 Telegram 消息抽取：${props.inboxTask.originalMessage}`,
    assigneeId: '',
    priority: extracted.priority || 'medium',
    dueDate: extracted.dueDate ? dayjs(extracted.dueDate).format('YYYY-MM-DD') : '',
    tags: ['Telegram']
  }
  
  // 查找负责人
  if (extracted.assignee) {
    const member = teamMembers.find(m => m.name === extracted.assignee)
    if (member) {
      form.value.assigneeId = member.id
    }
  }
  
  tagsInput.value = form.value.tags.join(', ')
}

// 监听标签输入
watch(tagsInput, (newValue) => {
  form.value.tags = newValue.split(',').map(tag => tag.trim()).filter(tag => tag)
})

const removeTag = (tagToRemove) => {
  form.value.tags = form.value.tags.filter(tag => tag !== tagToRemove)
  tagsInput.value = form.value.tags.join(', ')
}

const handleSubmit = () => {
  if (!form.value.title.trim()) return

  const assignee = form.value.assigneeId 
    ? teamMembers.find(m => m.id === form.value.assigneeId)
    : null

  const taskData = {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    assignee: assignee ? {
      id: assignee.id,
      name: assignee.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignee.id}`
    } : null,
    priority: form.value.priority,
    dueDate: form.value.dueDate ? dayjs(form.value.dueDate).toISOString() : null,
    tags: form.value.tags,
    subtasks: []
  }

  emit('save', taskData)
}

// 初始化
initializeForm()
</script> 