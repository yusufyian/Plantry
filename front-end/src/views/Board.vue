<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 页面标题和操作 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold gradient-text mb-2">看板 🌱</h1>
          <p class="text-gray-600">这是一个看板页面，用于测试导航</p>
        </div>
        <div class="flex items-center space-x-4 mt-4 md:mt-0">
          <button @click="testNavigation" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
            测试导航
          </button>
          <button @click="testSinglePage('/inbox')" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            测试任务箱
          </button>
          <button @click="testSinglePage('/analytics')" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
            测试分析
          </button>
        </div>
      </div>

      <!-- 简化看板视图 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Seed 列 -->
        <div class="bg-gradient-to-b from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
          <h3 class="font-semibold text-gray-800 flex items-center mb-4">
            🌰 Seed
            <span class="ml-2 bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">
              {{ tasksByStatus.seed.length }}
            </span>
          </h3>
          <div class="space-y-3">
            <div v-for="task in tasksByStatus.seed" :key="task.id" class="bg-white p-3 rounded border">
              <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
              <p class="text-sm text-gray-600">{{ task.description }}</p>
            </div>
          </div>
        </div>

        <!-- Sprout 列 -->
        <div class="bg-gradient-to-b from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <h3 class="font-semibold text-gray-800 flex items-center mb-4">
            🌱 Sprout
            <span class="ml-2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
              {{ tasksByStatus.sprout.length }}
            </span>
          </h3>
          <div class="space-y-3">
            <div v-for="task in tasksByStatus.sprout" :key="task.id" class="bg-white p-3 rounded border">
              <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
              <p class="text-sm text-gray-600">{{ task.description }}</p>
            </div>
          </div>
        </div>

        <!-- Blossom 列 -->
        <div class="bg-gradient-to-b from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <h3 class="font-semibold text-gray-800 flex items-center mb-4">
            🌸 Blossom
            <span class="ml-2 bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
              {{ tasksByStatus.blossom.length }}
            </span>
          </h3>
          <div class="space-y-3">
            <div v-for="task in tasksByStatus.blossom" :key="task.id" class="bg-white p-3 rounded border">
              <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
              <p class="text-sm text-gray-600">{{ task.description }}</p>
            </div>
          </div>
        </div>

        <!-- Done 列 -->
        <div class="bg-gradient-to-b from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <h3 class="font-semibold text-gray-800 flex items-center mb-4">
            ✅ Done
            <span class="ml-2 bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
              {{ tasksByStatus.done.length }}
            </span>
          </h3>
          <div class="space-y-3">
            <div v-for="task in tasksByStatus.done" :key="task.id" class="bg-white p-3 rounded border">
              <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
              <p class="text-sm text-gray-600">{{ task.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试链接 -->
      <div class="mt-8 text-center">
        <router-link to="/" class="text-blue-600 hover:text-blue-800 underline">
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '../stores/tasks.js'
import { useTeamsStore } from '../stores/teams.js'
import { useNotifications } from '../stores/notifications.js'
import { ENUMS } from '../config/database.js'
import { useRouter } from 'vue-router'

const tasksStore = useTasksStore()
const teamsStore = useTeamsStore()
const { notify } = useNotifications()
const router = useRouter()

const tasksByStatus = computed(() => tasksStore.tasksByStatus)

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
    }, 1000)
    
    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 返回看板页面
    console.log('返回看板页面...')
    await router.push('/board')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  } catch (error) {
    console.error(`❌ ${path} 页面跳转失败:`, error)
    await router.push('/board')
  }
}

// 初始化数据
onMounted(async () => {
  try {
    console.log('SimpleBoard - 开始初始化数据')
    await teamsStore.loadUserTeams()
    console.log('SimpleBoard - 团队数据加载完成:', teamsStore.currentTeam)
    
    if (teamsStore.currentTeam) {
      await tasksStore.initialize(teamsStore.currentTeam.id)
      console.log('SimpleBoard - 任务数据加载完成:', tasksStore.tasks.length)
    } else {
      console.log('SimpleBoard - 使用默认团队数据')
      await tasksStore.initialize('demo-team')
    }
  } catch (error) {
    console.error('SimpleBoard - 初始化失败:', error)
    // 确保有默认数据
    if (!tasksStore.tasks.length) {
      await tasksStore.initialize('demo-team')
    }
  }
})
</script> 