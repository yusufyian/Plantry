<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">📊 效率分析</h1>
        <p class="text-gray-600">深入了解团队的工作效率和项目进展</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">任务完成率</p>
              <p class="text-2xl font-bold text-green-600">78%</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <CheckCircleIcon class="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm text-green-600">
              <ArrowUpIcon class="h-4 w-4 mr-1" />
              +12% 较上周
            </div>
          </div>
        </div>

        <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">AI 识别准确率</p>
              <p class="text-2xl font-bold text-blue-600">94%</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <CpuChipIcon class="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm text-blue-600">
              <ArrowUpIcon class="h-4 w-4 mr-1" />
              +3% 较上周
            </div>
          </div>
        </div>

        <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">平均完成时间</p>
              <p class="text-2xl font-bold text-purple-600">2.3天</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <ClockIcon class="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm text-red-600">
              <ArrowDownIcon class="h-4 w-4 mr-1" />
              -0.5天 较上周
            </div>
          </div>
        </div>

        <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">团队活跃度</p>
              <p class="text-2xl font-bold text-orange-600">92%</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-full">
              <UserGroupIcon class="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm text-green-600">
              <ArrowUpIcon class="h-4 w-4 mr-1" />
              +8% 较上周
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- 任务完成趋势 -->
        <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📈 任务完成趋势</h3>
          <div class="h-64 flex items-center justify-center">
            <div class="text-center">
              <ChartBarIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500">图表组件加载中...</p>
            </div>
          </div>
        </div>

        <!-- 任务分布 -->
        <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🥧 任务状态分布</h3>
          <div class="h-64 flex items-center justify-center">
            <div class="text-center">
              <ChartPieIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500">图表组件加载中...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 团队表现 -->
      <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">👥 团队成员表现</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 font-medium text-gray-500">成员</th>
                <th class="text-left py-3 px-4 font-medium text-gray-500">完成任务</th>
                <th class="text-left py-3 px-4 font-medium text-gray-500">平均效率</th>
                <th class="text-left py-3 px-4 font-medium text-gray-500">本周表现</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in teamMembers" :key="member.id" class="border-b border-gray-100">
                <td class="py-3 px-4">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium mr-3">
                      {{ member.name.charAt(0) }}
                    </div>
                    <span class="font-medium text-gray-900">{{ member.name }}</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-gray-600">{{ member.completedTasks }}</td>
                <td class="py-3 px-4">
                  <span :class="`px-2 py-1 text-xs rounded-full ${getEfficiencyClass(member.efficiency)}`">
                    {{ member.efficiency }}%
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center">
                    <component :is="member.trend > 0 ? ArrowUpIcon : ArrowDownIcon" 
                               :class="`h-4 w-4 mr-1 ${member.trend > 0 ? 'text-green-500' : 'text-red-500'}`" />
                    <span :class="`text-sm ${member.trend > 0 ? 'text-green-600' : 'text-red-600'}`">
                      {{ member.trend > 0 ? '+' : '' }}{{ member.trend }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- AI 洞察 -->
      <div class="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🤖 AI 洞察与建议</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h4 class="font-medium text-blue-900 mb-2">效率提升建议</h4>
            <p class="text-sm text-blue-700">团队在周三和周四的工作效率最高，建议将重要任务安排在这两天。</p>
          </div>
          <div class="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
            <h4 class="font-medium text-green-900 mb-2">任务分配优化</h4>
            <p class="text-sm text-green-700">AI 发现某些类型的任务更适合特定成员，建议优化任务分配策略。</p>
          </div>
          <div class="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <h4 class="font-medium text-yellow-900 mb-2">风险预警</h4>
            <p class="text-sm text-yellow-700">检测到2个任务可能延期，建议及时调整资源分配。</p>
          </div>
          <div class="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
            <h4 class="font-medium text-purple-900 mb-2">协作改进</h4>
            <p class="text-sm text-purple-700">团队成员间的协作频率有所提升，建议继续保持当前的沟通模式。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  UserGroupIcon,
  CpuChipIcon,
  ChartBarIcon,
  ChartPieIcon
} from '@heroicons/vue/24/outline'

console.log('Analytics 组件开始加载')

const teamMembers = ref([
  {
    id: 1,
    name: '张小明',
    completedTasks: 23,
    efficiency: 95,
    trend: 12
  },
  {
    id: 2,
    name: '李小红',
    completedTasks: 18,
    efficiency: 87,
    trend: 5
  },
  {
    id: 3,
    name: '王小刚',
    completedTasks: 21,
    efficiency: 92,
    trend: -3
  },
  {
    id: 4,
    name: '赵小美',
    completedTasks: 19,
    efficiency: 89,
    trend: 8
  }
])

const getEfficiencyClass = (efficiency) => {
  if (efficiency >= 90) return 'bg-green-100 text-green-800'
  if (efficiency >= 80) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

onMounted(() => {
  console.log('Analytics 组件已挂载')
  console.log('团队成员数据:', teamMembers.value)
})
</script> 