<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">📊 简化分析页面</h1>
        <p class="text-gray-600">这是一个简化版的分析页面，用于测试路由是否正常工作</p>
      </div>

      <!-- 简单内容 -->
      <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">测试内容</h2>
        <p class="text-gray-600 mb-4">如果您能看到这个页面，说明路由是正常工作的！</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-blue-100 rounded-lg">
            <h3 class="font-medium text-blue-900">任务完成率</h3>
            <p class="text-2xl font-bold text-blue-600">78%</p>
          </div>
          <div class="p-4 bg-green-100 rounded-lg">
            <h3 class="font-medium text-green-900">AI 识别准确率</h3>
            <p class="text-2xl font-bold text-green-600">94%</p>
          </div>
          <div class="p-4 bg-purple-100 rounded-lg">
            <h3 class="font-medium text-purple-900">平均完成时间</h3>
            <p class="text-2xl font-bold text-purple-600">2.3天</p>
          </div>
        </div>
        
        <div class="mt-6">
          <router-link to="/board" class="text-blue-600 hover:text-blue-800 underline">
            返回看板
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

console.log('SimpleAnalytics 组件已加载')

onMounted(() => {
  console.log('SimpleAnalytics 组件已挂载')
})
</script> 