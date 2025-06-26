<template>
  <div :class="[
    'flex items-center justify-center',
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
  ]">
    <div :class="[
      'animate-spin rounded-full border-2 border-gray-300',
      size === 'sm' ? 'w-4 h-4 border-t-green-500' : 
      size === 'lg' ? 'w-12 h-12 border-t-green-500 border-4' : 
      'w-8 h-8 border-t-green-500'
    ]"></div>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'md', // sm, md, lg
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})
</script> 