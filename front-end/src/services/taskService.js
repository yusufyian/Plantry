import { apiService } from './api.js'

export const taskService = {
  // 获取任务列表
  getTasks: (params = {}) => {
    return apiService.get('/tasks', params)
  },
  
  // 获取单个任务详情
  getTask: (taskId) => {
    return apiService.get(`/tasks/${taskId}`)
  },
  
  // 创建任务
  createTask: (taskData) => {
    return apiService.post('/tasks', taskData)
  },
  
  // 更新任务
  updateTask: (taskId, taskData) => {
    return apiService.patch(`/tasks/${taskId}`, taskData)
  },
  
  // 删除任务
  deleteTask: (taskId) => {
    return apiService.delete(`/tasks/${taskId}`)
  },
  
  // 更新任务状态
  updateTaskStatus: (taskId, status) => {
    return apiService.patch(`/tasks/${taskId}/status`, { status })
  },
  
  // 分配任务
  assignTask: (taskId, assigneeId) => {
    return apiService.patch(`/tasks/${taskId}/assign`, { assignee_id: assigneeId })
  },
  
  // 获取看板任务（按状态分组）
  getKanbanTasks: (teamId, projectId = null) => {
    const params = { team_id: teamId }
    if (projectId) params.project_id = projectId
    return apiService.get('/tasks/kanban', params)
  },
  
  // 批量更新任务位置（拖拽排序）
  updateTaskPositions: (updates) => {
    return apiService.patch('/tasks/positions', { updates })
  },
  
  // 获取子任务
  getSubtasks: (parentTaskId) => {
    return apiService.get(`/tasks/${parentTaskId}/subtasks`)
  },
  
  // 创建子任务
  createSubtask: (parentTaskId, subtaskData) => {
    return apiService.post(`/tasks/${parentTaskId}/subtasks`, subtaskData)
  },
  
  // 获取任务评论
  getTaskComments: (taskId) => {
    return apiService.get(`/tasks/${taskId}/comments`)
  },
  
  // 添加任务评论
  addTaskComment: (taskId, content) => {
    return apiService.post(`/tasks/${taskId}/comments`, { content })
  },
  
  // 获取任务附件
  getTaskAttachments: (taskId) => {
    return apiService.get(`/tasks/${taskId}/attachments`)
  },
  
  // 上传任务附件
  uploadTaskAttachment: (taskId, file, onProgress = null) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiService.upload(`/tasks/${taskId}/attachments`, formData, onProgress)
  },
  
  // 删除任务附件
  deleteTaskAttachment: (taskId, attachmentId) => {
    return apiService.delete(`/tasks/${taskId}/attachments/${attachmentId}`)
  },
  
  // 获取任务依赖
  getTaskDependencies: (taskId) => {
    return apiService.get(`/tasks/${taskId}/dependencies`)
  },
  
  // 添加任务依赖
  addTaskDependency: (predecessorId, successorId) => {
    return apiService.post('/tasks/dependencies', {
      predecessor_id: predecessorId,
      successor_id: successorId
    })
  },
  
  // 删除任务依赖
  removeTaskDependency: (dependencyId) => {
    return apiService.delete(`/tasks/dependencies/${dependencyId}`)
  },
  
  // 搜索任务
  searchTasks: (query, filters = {}) => {
    return apiService.get('/tasks/search', { q: query, ...filters })
  },
  
  // 获取过期任务
  getOverdueTasks: (teamId) => {
    return apiService.get('/tasks/overdue', { team_id: teamId })
  },
  
  // 获取我的任务
  getMyTasks: (status = null) => {
    const params = {}
    if (status) params.status = status
    return apiService.get('/tasks/my', params)
  },
  
  // 记录工作时间
  startWorkSession: (taskId) => {
    return apiService.post(`/tasks/${taskId}/work-sessions`, {
      start_time: new Date().toISOString()
    })
  },
  
  // 结束工作时间
  endWorkSession: (sessionId, description = '') => {
    return apiService.patch(`/work-sessions/${sessionId}`, {
      end_time: new Date().toISOString(),
      description
    })
  },
  
  // 获取任务工作时间记录
  getTaskWorkSessions: (taskId) => {
    return apiService.get(`/tasks/${taskId}/work-sessions`)
  }
} 