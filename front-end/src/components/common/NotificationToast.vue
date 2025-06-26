<template>
  <teleport to="body">
    <div class="fixed top-20 right-4 z-50 space-y-2">
      <transition-group name="toast" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'max-w-sm w-full glass-effect rounded-lg shadow-lg p-4 border-l-4',
            notificationClasses[notification.type]
          ]"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component :is="notificationIcons[notification.type]" class="w-5 h-5" />
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
              <p class="mt-1 text-sm text-gray-500">{{ notification.message }}</p>
            </div>
            <button @click="removeNotification(notification.id)" class="ml-4 text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useNotifications } from '@/stores/notifications'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const notificationsStore = useNotifications()

const notifications = computed(() => notificationsStore.notifications)

const notificationIcons = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon
}

const notificationClasses = {
  success: 'border-green-500 bg-green-50/90',
  warning: 'border-yellow-500 bg-yellow-50/90',
  error: 'border-red-500 bg-red-50/90',
  info: 'border-blue-500 bg-blue-50/90'
}

const removeNotification = (id) => {
  notificationsStore.removeNotification(id)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style> 