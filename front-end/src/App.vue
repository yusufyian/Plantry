<template>
  <div id="app" class="min-h-screen">
    <!-- 动态背景 -->
    <div class="floating-background"></div>
    
    <!-- 主导航 -->
    <Navigation v-if="!isAuthPage" />
    
    <!-- 主内容区域 -->
    <main :class="{ 'pt-16': !isAuthPage }">
      <router-view />
    </main>
    
    <!-- 全局通知 -->
    <NotificationToast />
    
    <!-- 调试面板 -->
    <DebugPanel />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navigation from './components/layout/Navigation.vue'
import NotificationToast from './components/common/NotificationToast.vue'
import DebugPanel from './components/common/DebugPanel.vue'

const route = useRoute()

// 判断是否为认证页面
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})
</script> 