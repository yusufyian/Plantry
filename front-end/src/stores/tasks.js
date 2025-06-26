import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskService } from '../services/taskService.js'
import { extractionService } from '../services/extractionService.js'
import { ENUMS } from '../config/database.js'
import dayjs from 'dayjs'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const extractions = ref([])
  const loading = ref(false)
  const currentTeamId = ref(null) // 当前选中的团队ID
  
  // 模拟数据（当API不可用时使用）
  const mockTasks = [
    {
      id: 'mock-1',
      team_id: 'demo-team',
      project_id: null,
      parent_task_id: null,
      title: '设计新的登录页面',
      description: '创建现代化的登录界面，包含社交媒体登录选项',
      status: ENUMS.TASK_STATUS.SEED,
      priority: ENUMS.TASK_PRIORITY.HIGH,
      assignee_id: 'demo-user-1',
      creator_id: 'demo-user',
      due_date: dayjs().add(3, 'day').toISOString(),
      completed_at: null,
      estimated_hours: 8,
      actual_hours: null,
      position: 0,
      telegram_message_id: null,
      telegram_thread_id: null,
      ai_extracted: false,
      ai_confidence: null,
      metadata: { tags: ['UI设计', '前端'] },
      created_at: dayjs().subtract(2, 'day').toISOString(),
      updated_at: dayjs().subtract(2, 'day').toISOString(),
      // 关联数据
      assignee: {
        id: 'demo-user-1',
        username: 'zhang_san',
        first_name: '张',
        last_name: '三',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang'
      }
    },
    {
      id: 'mock-2',
      team_id: 'demo-team',
      project_id: null,
      parent_task_id: null,
      title: 'API 接口开发',
      description: '开发用户认证相关的后端接口',
      status: ENUMS.TASK_STATUS.SPROUT,
      priority: ENUMS.TASK_PRIORITY.MEDIUM,
      assignee_id: 'demo-user-2',
      creator_id: 'demo-user',
      due_date: dayjs().add(5, 'day').toISOString(),
      completed_at: null,
      estimated_hours: 16,
      actual_hours: 6,
      position: 0,
      telegram_message_id: null,
      telegram_thread_id: null,
      ai_extracted: false,
      ai_confidence: null,
      metadata: { tags: ['后端', 'API'] },
      created_at: dayjs().subtract(3, 'day').toISOString(),
      updated_at: dayjs().subtract(1, 'day').toISOString(),
      assignee: {
        id: 'demo-user-2',
        username: 'li_si',
        first_name: '李',
        last_name: '四',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li'
      }
    }
  ]
  
  const mockExtractions = [
    {
      id: 'extraction-1',
      team_id: 'demo-team',
      telegram_message_id: 12345,
      original_message: '@张三 需要优化一下首页的加载速度，用户反馈比较慢',
      extracted_data: {
        title: '优化首页加载速度',
        description: '用户反馈首页加载速度较慢需要优化',
        assignee_username: '张三',
        priority: ENUMS.TASK_PRIORITY.MEDIUM,
        due_date: null
      },
      confidence_score: 0.92,
      confidence_level: ENUMS.EXTRACTION_CONFIDENCE.HIGH,
      is_confirmed: null,
      confirmed_by: null,
      confirmed_at: null,
      task_id: null,
      created_at: dayjs().subtract(2, 'hour').toISOString()
    },
    {
      id: 'extraction-2',
      team_id: 'demo-team',
      telegram_message_id: 12346,
      original_message: '明天下午开会讨论Q4规划，大家准备一下材料',
      extracted_data: {
        title: '准备Q4规划会议材料',
        description: '为明天下午的Q4规划会议准备相关材料',
        assignee_username: null,
        priority: ENUMS.TASK_PRIORITY.HIGH,
        due_date: dayjs().add(1, 'day').toISOString()
      },
      confidence_score: 0.85,
      confidence_level: ENUMS.EXTRACTION_CONFIDENCE.HIGH,
      is_confirmed: null,
      confirmed_by: null,
      confirmed_at: null,
      task_id: null,
      created_at: dayjs().subtract(1, 'hour').toISOString()
    }
  ]
  
  // Computed
  const tasksByStatus = computed(() => {
    return {
      seed: tasks.value.filter(task => task.status === ENUMS.TASK_STATUS.SEED),
      sprout: tasks.value.filter(task => task.status === ENUMS.TASK_STATUS.SPROUT),
      blossom: tasks.value.filter(task => task.status === ENUMS.TASK_STATUS.BLOSSOM),
      done: tasks.value.filter(task => task.status === ENUMS.TASK_STATUS.DONE)
    }
  })
  
  const pendingExtractions = computed(() => {
    const result = extractions.value.filter(extraction => extraction.is_confirmed === null)
    console.log('Tasks - pendingExtractions computed:', {
      totalExtractions: extractions.value.length,
      pendingCount: result.length,
      extractions: extractions.value
    })
    return result
  })
  
  const overdueTasks = computed(() => {
    const now = dayjs()
    return tasks.value.filter(task => 
      task.status !== ENUMS.TASK_STATUS.DONE && 
      task.due_date && 
      dayjs(task.due_date).isBefore(now)
    )
  })
  
  // Actions
  const setCurrentTeam = (teamId) => {
    currentTeamId.value = teamId
  }
  
  const loadTasks = async (teamId = null) => {
    loading.value = true
    try {
      const team = teamId || currentTeamId.value
      if (!team) {
        tasks.value = mockTasks
        return
      }
      
      const response = await taskService.getKanbanTasks(team)
      tasks.value = response.tasks || []
    } catch (error) {
      console.warn('Failed to load tasks, using mock data:', error)
      tasks.value = mockTasks
    } finally {
      loading.value = false
    }
  }
  
  const loadExtractions = async (teamId = null) => {
    loading.value = true
    try {
      const team = teamId || currentTeamId.value
      if (!team) {
        extractions.value = mockExtractions
        return
      }
      
      const response = await extractionService.getPendingExtractions(team)
      extractions.value = response.extractions || []
    } catch (error) {
      console.warn('Failed to load extractions, using mock data:', error)
      extractions.value = mockExtractions
    } finally {
      loading.value = false
    }
  }
  
  const createTask = async (taskData) => {
    try {
      const task = await taskService.createTask({
        team_id: currentTeamId.value,
        title: taskData.title,
        description: taskData.description,
        status: ENUMS.TASK_STATUS.SEED,
        priority: taskData.priority || ENUMS.TASK_PRIORITY.MEDIUM,
        assignee_id: taskData.assignee_id,
        due_date: taskData.due_date,
        estimated_hours: taskData.estimated_hours,
        project_id: taskData.project_id,
        parent_task_id: taskData.parent_task_id,
        metadata: taskData.metadata || {}
      })
      
      tasks.value.push(task)
      return task
    } catch (error) {
      // 回退到本地创建
      const newTask = {
        id: `mock-${Date.now()}`,
        team_id: currentTeamId.value,
        ...taskData,
        status: ENUMS.TASK_STATUS.SEED,
        creator_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ai_extracted: false,
        ai_confidence: null,
        position: 0
      }
      tasks.value.push(newTask)
      return newTask
    }
  }
  
  const updateTask = async (taskId, updates) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, updates)
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], ...updatedTask }
      }
      return updatedTask
    } catch (error) {
      // 回退到本地更新
      const task = tasks.value.find(t => t.id === taskId)
      if (task) {
        Object.assign(task, updates, { updated_at: new Date().toISOString() })
      }
      throw error
    }
  }
  
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus)
      const task = tasks.value.find(t => t.id === taskId)
      if (task) {
        task.status = newStatus
        task.updated_at = new Date().toISOString()
        if (newStatus === ENUMS.TASK_STATUS.DONE) {
          task.completed_at = new Date().toISOString()
        }
      }
    } catch (error) {
      // 回退到本地更新
      const task = tasks.value.find(t => t.id === taskId)
      if (task) {
        task.status = newStatus
        task.updated_at = new Date().toISOString()
        if (newStatus === ENUMS.TASK_STATUS.DONE) {
          task.completed_at = new Date().toISOString()
        }
      }
    }
  }
  
  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId)
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value.splice(index, 1)
      }
    } catch (error) {
      // 回退到本地删除
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value.splice(index, 1)
      }
    }
  }
  
  const confirmExtraction = async (extractionId, taskData = {}) => {
    try {
      const task = await extractionService.confirmExtraction(extractionId, taskData)
      tasks.value.push(task)
      
      // 更新抽取记录状态
      const extraction = extractions.value.find(e => e.id === extractionId)
      if (extraction) {
        extraction.is_confirmed = true
        extraction.confirmed_at = new Date().toISOString()
        extraction.task_id = task.id
      }
      
      return task
    } catch (error) {
      // 回退到本地确认
      const extraction = extractions.value.find(e => e.id === extractionId)
      if (extraction) {
        const newTask = {
          id: `task-${Date.now()}`,
          team_id: currentTeamId.value,
          title: extraction.extracted_data.title,
          description: extraction.extracted_data.description || `从 Telegram 消息抽取：${extraction.original_message}`,
          status: ENUMS.TASK_STATUS.SEED,
          priority: extraction.extracted_data.priority || ENUMS.TASK_PRIORITY.MEDIUM,
          assignee_id: null, // 需要根据username查找ID
          creator_id: 'demo-user',
          due_date: extraction.extracted_data.due_date,
          ai_extracted: true,
          ai_confidence: extraction.confidence_score,
          telegram_message_id: extraction.telegram_message_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: { tags: ['Telegram'] }
        }
        
        tasks.value.push(newTask)
        extraction.is_confirmed = true
        extraction.confirmed_at = new Date().toISOString()
        extraction.task_id = newTask.id
        
        return newTask
      }
    }
  }
  
  const rejectExtraction = async (extractionId, reason = '') => {
    try {
      await extractionService.rejectExtraction(extractionId, reason)
      const index = extractions.value.findIndex(e => e.id === extractionId)
      if (index !== -1) {
        extractions.value.splice(index, 1)
      }
    } catch (error) {
      // 回退到本地拒绝
      const index = extractions.value.findIndex(e => e.id === extractionId)
      if (index !== -1) {
        extractions.value.splice(index, 1)
      }
    }
  }
  
  const analyzeMessage = async (message) => {
    try {
      const result = await extractionService.analyzeMessage(message, currentTeamId.value)
      return result
    } catch (error) {
      // 回退到模拟分析
      return {
        tasks: [
          {
            title: '分析结果示例',
            description: '这是对消息的模拟分析结果',
            confidence: 0.75,
            priority: ENUMS.TASK_PRIORITY.MEDIUM
          }
        ]
      }
    }
  }
  
  // 初始化
  const initialize = async (teamId) => {
    setCurrentTeam(teamId)
    await Promise.all([
      loadTasks(teamId),
      loadExtractions(teamId)
    ])
  }
  
  return {
    tasks,
    extractions,
    loading,
    currentTeamId,
    tasksByStatus,
    pendingExtractions,
    overdueTasks,
    setCurrentTeam,
    loadTasks,
    loadExtractions,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    confirmExtraction,
    rejectExtraction,
    analyzeMessage,
    initialize
  }
}) 