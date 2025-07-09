<template>
  <nav class="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold">P</span>
          </div>
          <span class="text-xl font-bold gradient-text">Plantry</span>
        </router-link>
        
        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link 
            v-for="item in navItems" 
            :key="item.name"
            :to="item.path"
            class="nav-link"
            :class="{ 'nav-link-active': $route.path === item.path }"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.name }}</span>
          </router-link>
        </div>
        
        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <button @click="toggleNotifications" class="relative p-2 rounded-lg hover:bg-white/20 transition-colors">
            <BellIcon class="w-6 h-6 text-gray-600" />
            <span v-if="pendingCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ pendingCount }}
            </span>
          </button>
          
          <!-- User Avatar -->
          <div class="relative" ref="userMenuRef">
            <button @click="toggleUserMenu" class="flex items-center space-x-2 p-1 rounded-lg hover:bg-white/20 transition-colors">
              <img :src="userInfo?.avatar" :alt="userInfo?.name" class="w-8 h-8 rounded-full" />
              <ChevronDownIcon class="w-4 h-4 text-gray-600" />
            </button>
            
            <!-- User Dropdown -->
            <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 glass-effect rounded-lg shadow-lg py-2">
              <div class="px-4 py-2 border-b border-white/20">
                <p class="text-sm font-medium text-gray-900">{{ userInfo?.name }}</p>
                <p class="text-xs text-gray-500">{{ userInfo?.email }}</p>
              </div>
              <router-link to="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-white/20 transition-colors">
                设置
              </router-link>
              <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-white/20 transition-colors">
                退出登录
              </button>
            </div>
          </div>
        </div>
        
        <!-- Mobile Menu Button -->
        <button @click="toggleMobileMenu" class="md:hidden p-2 rounded-lg hover:bg-white/20 transition-colors">
          <Bars3Icon v-if="!showMobileMenu" class="w-6 h-6 text-gray-600" />
          <XMarkIcon v-else class="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </div>
    
    <!-- Mobile Navigation -->
    <div v-if="showMobileMenu" class="md:hidden border-t border-white/20 bg-white/10 backdrop-blur-md">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <router-link 
          v-for="item in navItems" 
          :key="item.name"
          :to="item.path"
          @click="showMobileMenu = false"
          class="mobile-nav-link"
          :class="{ 'mobile-nav-link-active': $route.path === item.path }"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.name }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { 
  HomeIcon, 
  RectangleStackIcon, 
  InboxIcon, 
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  BellIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const tasksStore = useTasksStore()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const showNotifications = ref(false)
const userMenuRef = ref(null)

const userInfo = computed(() => authStore.userInfo)
const pendingCount = computed(() => {
  const count = tasksStore.pendingExtractions?.length || 0
  console.log('Navigation - pendingExtractions:', tasksStore.pendingExtractions)
  console.log('Navigation - pendingCount:', count)
  return count
})

const navItems = [
  { name: '首页', path: '/', icon: HomeIcon },
  { name: '看板', path: '/board', icon: RectangleStackIcon },
  { name: '任务箱', path: '/inbox', icon: InboxIcon },
  { name: '分析', path: '/analytics', icon: ChartBarIcon },
  { name: 'Telegram', path: '/telegram', icon: ChatBubbleLeftRightIcon }
]

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.nav-link {
  @apply flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white/20 transition-all duration-200 font-medium;
}

.nav-link-active {
  @apply text-green-600 bg-green-50/50;
}

.mobile-nav-link {
  @apply flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white/20 transition-all duration-200 font-medium;
}

.mobile-nav-link-active {
  @apply text-green-600 bg-green-50/50;
}
</style> 