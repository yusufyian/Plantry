import { apiService } from './api.js'

export const extractionService = {
  // 获取待确认的任务抽取
  getPendingExtractions: (teamId, page = 1, limit = 20) => {
    return apiService.get('/extractions/pending', {
      team_id: teamId,
      page,
      limit
    })
  },
  
  // 获取所有抽取日志
  getExtractionLogs: (teamId, filters = {}) => {
    return apiService.get('/extractions/logs', {
      team_id: teamId,
      ...filters
    })
  },
  
  // 获取单个抽取记录
  getExtraction: (extractionId) => {
    return apiService.get(`/extractions/${extractionId}`)
  },
  
  // 确认抽取的任务并创建真实任务
  confirmExtraction: (extractionId, taskData = {}) => {
    return apiService.post(`/extractions/${extractionId}/confirm`, taskData)
  },
  
  // 拒绝抽取的任务
  rejectExtraction: (extractionId, reason = '') => {
    return apiService.post(`/extractions/${extractionId}/reject`, { reason })
  },
  
  // 批量确认抽取的任务
  confirmMultipleExtractions: (extractionIds, taskData = {}) => {
    return apiService.post('/extractions/confirm-batch', {
      extraction_ids: extractionIds,
      task_data: taskData
    })
  },
  
  // 批量拒绝抽取的任务
  rejectMultipleExtractions: (extractionIds, reason = '') => {
    return apiService.post('/extractions/reject-batch', {
      extraction_ids: extractionIds,
      reason
    })
  },
  
  // 编辑抽取的任务信息
  updateExtraction: (extractionId, extractedData) => {
    return apiService.patch(`/extractions/${extractionId}`, {
      extracted_data: extractedData
    })
  },
  
  // 手动触发消息分析
  analyzeMessage: (message, teamId) => {
    return apiService.post('/extractions/analyze', {
      message,
      team_id: teamId
    })
  },
  
  // 重新分析已有的抽取记录
  reanalyzeExtraction: (extractionId) => {
    return apiService.post(`/extractions/${extractionId}/reanalyze`)
  },
  
  // 获取抽取统计信息
  getExtractionStatistics: (teamId, dateRange = {}) => {
    return apiService.get('/extractions/statistics', {
      team_id: teamId,
      ...dateRange
    })
  },
  
  // 获取AI模型的置信度分布
  getConfidenceDistribution: (teamId, dateRange = {}) => {
    return apiService.get('/extractions/confidence-distribution', {
      team_id: teamId,
      ...dateRange
    })
  },
  
  // 训练反馈（用于改进AI模型）
  submitTrainingFeedback: (extractionId, feedback) => {
    return apiService.post(`/extractions/${extractionId}/feedback`, feedback)
  },
  
  // 获取抽取关键词配置
  getExtractionKeywords: (teamId) => {
    return apiService.get(`/extractions/keywords/${teamId}`)
  },
  
  // 更新抽取关键词配置
  updateExtractionKeywords: (teamId, keywords) => {
    return apiService.put(`/extractions/keywords/${teamId}`, { keywords })
  },
  
  // 测试抽取规则
  testExtractionRules: (teamId, testMessage) => {
    return apiService.post('/extractions/test', {
      team_id: teamId,
      message: testMessage
    })
  }
} 