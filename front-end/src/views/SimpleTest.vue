<template>
  <div class="min-h-screen bg-blue-100 p-8">
    <h1 class="text-3xl font-bold text-blue-900 mb-4">简单测试页面</h1>
    <p class="text-blue-700">如果您能看到这个页面，说明路由是正常工作的！</p>
    <div class="mt-4">
      <router-link to="/" class="text-blue-600 hover:text-blue-800 underline">
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup>
console.log('SimpleTest 组件已加载')
</script> 