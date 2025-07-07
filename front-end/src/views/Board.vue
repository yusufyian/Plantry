<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 页面标题和操作 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold gradient-text mb-2">Grow Board 🌱</h1>
          <p class="text-gray-600">见证想法从种子到花朵的成长历程</p>
        </div>
        <div class="flex items-center space-x-4 mt-4 md:mt-0">
          <button @click="showCreateModal = true" class="btn-primary">
            <PlusIcon class="w-4 h-4 mr-2" />
            新建任务
          </button>
          <button @click="testNavigation" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
            测试导航
          </button>
          <button @click="testSinglePage('/inbox')" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            测试任务箱
          </button>
          <button @click="testSinglePage('/analytics')" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
            测试分析
          </button>
          <button @click="testSinglePage('/simple-analytics')" class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
            测试简化分析
          </button>
          <button @click="testComponentLoading('/analytics')" class="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
            测试组件加载
          </button>
          <div class="flex items-center space-x-2">
            <button 
              @click="viewMode = 'kanban'"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                viewMode === 'kanban' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              ]"
            >
              看板视图
            </button>
            <button 
              @click="viewMode = 'list'"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                viewMode === 'list' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              ]"
            >
              列表视图
            </button>
          </div>
        </div>
      </div>

      <!-- 看板视图 -->
      <div v-if="viewMode === 'kanban'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Seed 列 -->
        <div class="kanban-column bg-gradient-to-b from-yellow-50 to-yellow-100 border-yellow-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800 flex items-center">
              🌰 Seed
              <span class="ml-2 bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {{ tasksByStatus.seed.length }}
              </span>
            </h3>
          </div>
          <div class="space-y-3 min-h-[500px]">
            <VueDraggable
              v-model="tasksByStatus.seed"
              group="tasks"
              @change="onTaskMove"
              class="min-h-full space-y-3"
              item-key="id"
              :animation="150"
              ghost-class="sortable-ghost"
              chosen-class="sortable-chosen"
              :disabled="false"
              :force-fallback="true"
              :fallback-class="'sortable-fallback'"
              :fallback-on-body="true"
            >
              <template #item="{ element }">
                <div class="bg-white p-3 rounded border shadow-sm hover:shadow-md transition-shadow">
                  <h4 class="font-medium text-gray-900">{{ element.title }}</h4>
                  <p class="text-sm text-gray-600">{{ element.description }}</p>
                </div>
              </template>
            </VueDraggable>
          </div>
        </div>

        <!-- Sprout 列 -->
        <div class="kanban-column bg-gradient-to-b from-green-50 to-green-100 border-green-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800 flex items-center">
              🌱 Sprout
              <span class="ml-2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                {{ tasksByStatus.sprout.length }}
              </span>
            </h3>
          </div>
          <div class="space-y-3 min-h-[500px]">
            <VueDraggable
              v-model="tasksByStatus.sprout"
              group="tasks"
              @change="onTaskMove"
              class="min-h-full space-y-3"
              item-key="id"
              :animation="150"
              ghost-class="sortable-ghost"
              chosen-class="sortable-chosen"
              :disabled="false"
              :force-fallback="true"
              :fallback-class="'sortable-fallback'"
              :fallback-on-body="true"
            >
              <template #item="{ element }">
                <div class="bg-white p-3 rounded border shadow-sm hover:shadow-md transition-shadow">
                  <h4 class="font-medium text-gray-900">{{ element.title }}</h4>
                  <p class="text-sm text-gray-600">{{ element.description }}</p>
                </div>
              </template>
            </VueDraggable>
          </div>
        </div>

        <!-- Blossom 列 -->
        <div class="kanban-column bg-gradient-to-b from-purple-50 to-purple-100 border-purple-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800 flex items-center">
              🌸 Blossom
              <span class="ml-2 bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
                {{ tasksByStatus.blossom.length }}
              </span>
            </h3>
          </div>
          <div class="space-y-3 min-h-[500px]">
            <VueDraggable
              v-model="tasksByStatus.blossom"
              group="tasks"
              @change="onTaskMove"
              class="min-h-full space-y-3"
              item-key="id"
              :animation="150"
              ghost-class="sortable-ghost"
              chosen-class="sortable-chosen"
              :disabled="false"
              :force-fallback="true"
              :fallback-class="'sortable-fallback'"
              :fallback-on-body="true"
            >
              <template #item="{ element }">
                <div class="bg-white p-3 rounded border shadow-sm hover:shadow-md transition-shadow">
                  <h4 class="font-medium text-gray-900">{{ element.title }}</h4>
                  <p class="text-sm text-gray-600">{{ element.description }}</p>
                </div>
              </template>
            </VueDraggable>
          </div>
        </div>

        <!-- Done 列 -->
        <div class="kanban-column bg-gradient-to-b from-blue-50 to-blue-100 border-blue-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800 flex items-center">
              ✅ Done
              <span class="ml-2 bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                {{ tasksByStatus.done.length }}
              </span>
            </h3>
          </div>
          <div class="space-y-3 min-h-[500px]">
            <VueDraggable
              v-model="tasksByStatus.done"
              group="tasks"
              @change="onTaskMove"
              class="min-h-full space-y-3"
              item-key="id"
              :animation="150"
              ghost-class="sortable-ghost"
              chosen-class="sortable-chosen"
              :disabled="false"
              :force-fallback="true"
              :fallback-class="'sortable-fallback'"
              :fallback-on-body="true"
            >
              <template #item="{ element }">
                <div class="bg-white p-3 rounded border shadow-sm hover:shadow-md transition-shadow">
                  <h4 class="font-medium text-gray-900">{{ element.title }}</h4>
                  <p class="text-sm text-gray-600">{{ element.description }}</p>
                </div>
              </template>
            </VueDraggable>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  任务
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  负责人
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  优先级
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  截止日期
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="task in allTasks" :key="task.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ task.title }}</div>
                  <div class="text-sm text-gray-500">{{ task.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(task.status)">
                    {{ getStatusText(task.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="task.assignee" class="flex items-center">
                    <img :src="task.assignee.avatar_url" :alt="task.assignee.first_name" class="w-6 h-6 rounded-full mr-2" />
                    <span class="text-sm text-gray-900">{{ task.assignee.first_name }} {{ task.assignee.last_name }}</span>
                  </div>
                  <span v-else class="text-sm text-gray-400">未分配</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getPriorityBadgeClass(task.priority)">
                    {{ getPriorityText(task.priority) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ task.due_date ? dayjs(task.due_date).format('YYYY-MM-DD') : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button @click="openTaskDetail(task)" class="text-green-600 hover:text-green-900 mr-3">
                    查看
                  </button>
                  <button @click="openTaskEdit(task)" class="text-blue-600 hover:text-blue-900">
                    编辑
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 任务创建/编辑模态框 -->
    <TaskModal 
      v-if="showCreateModal || showEditModal"
      :task="editingTask"
      :is-editing="showEditModal"
      @close="closeModals"
      @save="handleTaskSave"
    />

    <!-- 任务详情模态框 -->
    <TaskDetailModal
      v-if="showDetailModal"
      :task="selectedTask"
      @close="showDetailModal = false"
      @edit="openTaskEdit"
      @delete="handleTaskDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '../stores/tasks.js'
import { useTeamsStore } from '../stores/teams.js'
import { useNotifications } from '../stores/notifications.js'
import { ENUMS } from '../config/database.js'
import { PlusIcon } from '@heroicons/vue/24/outline'
import dayjs from 'dayjs'
import { VueDraggable } from 'vue-draggable-plus'
import TaskModal from '../components/tasks/TaskModal.vue'
import TaskDetailModal from '../components/tasks/TaskDetailModal.vue'
import { useRouter } from 'vue-router'

const tasksStore = useTasksStore()
const teamsStore = useTeamsStore()
const { notify } = useNotifications()
const router = useRouter()

const viewMode = ref('kanban')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const editingTask = ref(null)
const selectedTask = ref(null)

const tasksByStatus = computed(() => tasksStore.tasksByStatus)
const allTasks = computed(() => tasksStore.tasks)

// 状态映射
const statusMap = {
  [ENUMS.TASK_STATUS.SEED]: { text: '种子', emoji: '🌰' },
  [ENUMS.TASK_STATUS.SPROUT]: { text: '萌芽', emoji: '🌱' },
  [ENUMS.TASK_STATUS.BLOSSOM]: { text: '开花', emoji: '🌸' },
  [ENUMS.TASK_STATUS.DONE]: { text: '完成', emoji: '✅' }
}

const getStatusText = (status) => statusMap[status]?.text || status
const getStatusBadgeClass = (status) => {
  const classes = {
    [ENUMS.TASK_STATUS.SEED]: 'bg-yellow-100 text-yellow-800',
    [ENUMS.TASK_STATUS.SPROUT]: 'bg-green-100 text-green-800',
    [ENUMS.TASK_STATUS.BLOSSOM]: 'bg-purple-100 text-purple-800',
    [ENUMS.TASK_STATUS.DONE]: 'bg-blue-100 text-blue-800'
  }
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[status] || 'bg-gray-100 text-gray-800'}`
}

const getPriorityText = (priority) => {
  const map = { 
    [ENUMS.TASK_PRIORITY.HIGH]: '高',
    [ENUMS.TASK_PRIORITY.MEDIUM]: '中', 
    [ENUMS.TASK_PRIORITY.LOW]: '低',
    [ENUMS.TASK_PRIORITY.URGENT]: '紧急'
  }
  return map[priority] || priority
}

const getPriorityBadgeClass = (priority) => {
  const classes = {
    [ENUMS.TASK_PRIORITY.URGENT]: 'bg-red-100 text-red-800',
    [ENUMS.TASK_PRIORITY.HIGH]: 'bg-orange-100 text-orange-800',
    [ENUMS.TASK_PRIORITY.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [ENUMS.TASK_PRIORITY.LOW]: 'bg-green-100 text-green-800'
  }
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[priority] || 'bg-gray-100 text-gray-800'}`
}

// 事件处理
const onTaskMove = async (event) => {
  if (event.moved) {
    const { element, newIndex } = event.moved
    const newStatus = getStatusFromColumn(newIndex, event.to)
    if (newStatus && element.status !== newStatus) {
      try {
        await tasksStore.updateTaskStatus(element.id, newStatus)
        notify(`任务已移动到 ${getStatusText(newStatus)}`, 'success')
      } catch (error) {
        notify('更新任务状态失败', 'error')
      }
    }
  }
}

const getStatusFromColumn = (index, column) => {
  // 根据列的类名或其他标识确定状态
  const columnClasses = column.className
  if (columnClasses.includes('from-yellow')) return ENUMS.TASK_STATUS.SEED
  if (columnClasses.includes('from-green')) return ENUMS.TASK_STATUS.SPROUT
  if (columnClasses.includes('from-purple')) return ENUMS.TASK_STATUS.BLOSSOM
  if (columnClasses.includes('from-blue')) return ENUMS.TASK_STATUS.DONE
  return null
}

const openTaskDetail = (task) => {
  selectedTask.value = task
  showDetailModal.value = true
}

const openTaskEdit = (task) => {
  editingTask.value = task
  showEditModal.value = true
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingTask.value = null
}

const handleTaskSave = async (taskData) => {
  try {
    if (showEditModal.value) {
      await tasksStore.updateTask(editingTask.value.id, taskData)
      notify('任务已更新', 'success')
    } else {
      await tasksStore.createTask(taskData)
      notify('任务已创建', 'success')
    }
    closeModals()
  } catch (error) {
    notify('保存任务失败', 'error')
  }
}

const handleTaskDelete = async (taskId) => {
  try {
    await tasksStore.deleteTask(taskId)
    notify('任务已删除', 'success')
    showDetailModal.value = false
  } catch (error) {
    notify('删除任务失败', 'error')
  }
}

const testNavigation = async () => {
  console.log('开始测试关键页面导航...')
  
  const pages = [
    { name: '任务箱', path: '/inbox' },
    { name: '分析', path: '/analytics' },
    { name: '设置', path: '/settings' },
    { name: 'Telegram', path: '/telegram' }
  ]
  
  for (const page of pages) {
    console.log(`\n=== 测试页面: ${page.name} ===`)
    
    try {
      console.log(`正在跳转到 ${page.path}...`)
      await router.push(page.path)
      console.log(`✅ ${page.name} 页面跳转成功`)
      
      // 等待页面加载
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 返回看板页面
      console.log('返回看板页面...')
      await router.push('/board')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`❌ ${page.name} 页面跳转失败:`, error)
      // 返回看板页面
      await router.push('/board')
    }
  }
  
  console.log('\n=== 导航测试完成 ===')
}

const testSinglePage = async (path) => {
  console.log(`\n=== 测试单个页面: ${path} ===`)
  
  try {
    console.log(`正在跳转到 ${path}...`)
    console.log('当前路由:', router.currentRoute.value.path)
    
    await router.push(path)
    console.log(`✅ ${path} 页面跳转成功`)
    console.log('跳转后路由:', router.currentRoute.value.path)
    
    // 检查页面内容
    setTimeout(() => {
      const pageTitle = document.title
      const pageContent = document.body.innerHTML
      console.log('页面标题:', pageTitle)
      console.log('页面内容长度:', pageContent.length)
      console.log('页面是否包含内容:', pageContent.includes('效率分析') || pageContent.includes('任务箱') || pageContent.includes('设置'))
      
      // 检查是否有错误信息
      const errorElements = document.querySelectorAll('.error, [class*="error"], [id*="error"]')
      console.log('页面中的错误元素数量:', errorElements.length)
      
      // 检查Vue组件是否正常渲染
      const vueElements = document.querySelectorAll('[data-v-]')
      console.log('Vue组件元素数量:', vueElements.length)
      
      // 检查页面是否为空
      const mainContent = document.querySelector('main')
      if (mainContent) {
        console.log('主内容区域HTML:', mainContent.innerHTML.substring(0, 200) + '...')
      }
    }, 1000)
    
    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 返回看板页面
    console.log('返回看板页面...')
    await router.push('/board')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  } catch (error) {
    console.error(`❌ ${path} 页面跳转失败:`, error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    // 返回看板页面
    await router.push('/board')
  }
}

const testComponentLoading = async (path) => {
  console.log(`\n=== 测试组件加载: ${path} ===`)
  
  try {
    console.log(`开始跳转到 ${path}...`)
    await router.push(path)
    console.log(`✅ ${path} 页面跳转成功`)
    
    // 等待组件加载
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 检查页面内容
    const pageContent = document.body.innerHTML
    console.log('页面内容长度:', pageContent.length)
    console.log('页面是否包含内容:', pageContent.includes('效率分析') || pageContent.includes('任务箱') || pageContent.includes('设置'))
    
    // 返回看板页面
    console.log('返回看板页面...')
    await router.push('/board')
    
  } catch (error) {
    console.error(`❌ 组件加载测试失败:`, error)
    await router.push('/board')
  }
}

// 初始化数据
onMounted(async () => {
  try {
    console.log('Board - 开始初始化数据')
    await teamsStore.loadUserTeams()
    console.log('Board - 团队数据加载完成:', teamsStore.currentTeam)
    
    if (teamsStore.currentTeam) {
      await tasksStore.initialize(teamsStore.currentTeam.id)
      console.log('Board - 任务数据加载完成:', tasksStore.tasks.length)
    } else {
      console.log('Board - 使用默认团队数据')
      await tasksStore.initialize('demo-team')
    }
  } catch (error) {
    console.error('Board - 初始化失败:', error)
    // 确保有默认数据
    if (!tasksStore.tasks.length) {
      await tasksStore.initialize('demo-team')
    }
  }
})
</script> 