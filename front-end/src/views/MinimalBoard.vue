<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold gradient-text mb-2">最小化看板测试 🌱</h1>
        <p class="text-gray-600">这是一个最小化的看板页面，用于测试基本功能</p>
      </div>

      <!-- 测试按钮 -->
      <div class="flex items-center space-x-4 mb-8">
        <button @click="testNavigation" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
          测试导航
        </button>
        <button @click="testSinglePage('/inbox')" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          测试任务箱
        </button>
        <button @click="testSinglePage('/analytics')" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
          测试分析
        </button>
        <router-link to="/" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
          返回首页
        </router-link>
      </div>

      <!-- 简单内容 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-semibold mb-4">测试内容</h2>
        <p class="text-gray-600 mb-4">这是一个简单的测试页面，用于验证路由和组件加载是否正常。</p>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-yellow-50 p-4 rounded border">
            <h3 class="font-medium text-yellow-800">🌰 Seed</h3>
            <p class="text-sm text-yellow-600">种子阶段</p>
          </div>
          <div class="bg-green-50 p-4 rounded border">
            <h3 class="font-medium text-green-800">🌱 Sprout</h3>
            <p class="text-sm text-green-600">萌芽阶段</p>
          </div>
          <div class="bg-purple-50 p-4 rounded border">
            <h3 class="font-medium text-purple-800">🌸 Blossom</h3>
            <p class="text-sm text-purple-600">开花阶段</p>
          </div>
          <div class="bg-blue-50 p-4 rounded border">
            <h3 class="font-medium text-blue-800">✅ Done</h3>
            <p class="text-sm text-blue-600">完成阶段</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

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
      
      // 返回测试页面
      console.log('返回测试页面...')
      await router.push('/minimal-board')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`❌ ${page.name} 页面跳转失败:`, error)
      // 返回测试页面
      await router.push('/minimal-board')
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
    
    // 返回测试页面
    console.log('返回测试页面...')
    await router.push('/minimal-board')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  } catch (error) {
    console.error(`❌ ${path} 页面跳转失败:`, error)
    await router.push('/minimal-board')
  }
}
</script> 