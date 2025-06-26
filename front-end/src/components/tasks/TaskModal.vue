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
              {{ isEditing ? '编辑任务' : '创建新任务' }}
            </h3>
            <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-6 h-6" />
            </button>
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

            <!-- 子任务 -->
            <div>
              <label class="block text-sm font-medium text-gray-700">子任务</label>
              <div class="mt-2 space-y-2">
                <div v-for="(subtask, index) in form.subtasks" :key="index" class="flex items-center space-x-2">
                  <input
                    v-model="subtask.title"
                    type="text"
                    class="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="子任务标题"
                  />
                  <button @click="removeSubtask(index)" class="text-red-500 hover:text-red-700">
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </div>
                <button @click="addSubtask" type="button" class="text-sm text-green-600 hover:text-green-700">
                  + 添加子任务
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- 底部按钮 -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="handleSubmit"
            :disabled="!form.title.trim()"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 btn-primary text-base font-medium sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isEditing ? '更新' : '创建' }}
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
import { ref, watch, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import dayjs from 'dayjs'

const props = defineProps({
  task: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
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
  tags: [],
  subtasks: []
})

const tagsInput = ref('')

// 初始化表单
const initializeForm = () => {
  if (props.task && props.isEditing) {
    form.value = {
      title: props.task.title || '',
      description: props.task.description || '',
      assigneeId: props.task.assignee?.id || '',
      priority: props.task.priority || 'medium',
      dueDate: props.task.dueDate ? dayjs(props.task.dueDate).format('YYYY-MM-DD') : '',
      tags: [...(props.task.tags || [])],
      subtasks: [...(props.task.subtasks || [])]
    }
    tagsInput.value = form.value.tags.join(', ')
  } else {
    form.value = {
      title: '',
      description: '',
      assigneeId: '',
      priority: 'medium',
      dueDate: '',
      tags: [],
      subtasks: []
    }
    tagsInput.value = ''
  }
}

// 监听标签输入
watch(tagsInput, (newValue) => {
  form.value.tags = newValue.split(',').map(tag => tag.trim()).filter(tag => tag)
})

const removeTag = (tagToRemove) => {
  form.value.tags = form.value.tags.filter(tag => tag !== tagToRemove)
  tagsInput.value = form.value.tags.join(', ')
}

const addSubtask = () => {
  form.value.subtasks.push({ id: Date.now(), title: '', completed: false })
}

const removeSubtask = (index) => {
  form.value.subtasks.splice(index, 1)
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
    subtasks: form.value.subtasks.filter(st => st.title.trim())
  }

  emit('save', taskData)
}

// 初始化
initializeForm()
</script> 