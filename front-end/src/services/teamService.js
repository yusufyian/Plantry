import { apiService } from './api.js'

export const teamService = {
  // 获取用户所在的团队列表
  getMyTeams: () => {
    return apiService.get('/teams/my')
  },
  
  // 获取团队详情
  getTeam: (teamId) => {
    return apiService.get(`/teams/${teamId}`)
  },
  
  // 创建团队
  createTeam: (teamData) => {
    return apiService.post('/teams', teamData)
  },
  
  // 更新团队信息
  updateTeam: (teamId, teamData) => {
    return apiService.patch(`/teams/${teamId}`, teamData)
  },
  
  // 删除团队
  deleteTeam: (teamId) => {
    return apiService.delete(`/teams/${teamId}`)
  },
  
  // 获取团队成员
  getTeamMembers: (teamId) => {
    return apiService.get(`/teams/${teamId}/members`)
  },
  
  // 邀请成员加入团队
  inviteMember: (teamId, memberData) => {
    return apiService.post(`/teams/${teamId}/members`, memberData)
  },
  
  // 更新成员角色
  updateMemberRole: (teamId, memberId, role) => {
    return apiService.patch(`/teams/${teamId}/members/${memberId}`, { role })
  },
  
  // 移除团队成员
  removeMember: (teamId, memberId) => {
    return apiService.delete(`/teams/${teamId}/members/${memberId}`)
  },
  
  // 离开团队
  leaveTeam: (teamId) => {
    return apiService.delete(`/teams/${teamId}/leave`)
  },
  
  // 获取团队统计信息
  getTeamStatistics: (teamId) => {
    return apiService.get(`/teams/${teamId}/statistics`)
  },
  
  // 获取团队设置
  getTeamSettings: (teamId) => {
    return apiService.get(`/teams/${teamId}/settings`)
  },
  
  // 更新团队设置
  updateTeamSettings: (teamId, settingKey, settingValue) => {
    return apiService.put(`/teams/${teamId}/settings`, {
      setting_key: settingKey,
      setting_value: settingValue
    })
  },
  
  // 连接Telegram群组
  connectTelegram: (teamId, telegramData) => {
    return apiService.post(`/teams/${teamId}/telegram`, telegramData)
  },
  
  // 断开Telegram连接
  disconnectTelegram: (teamId) => {
    return apiService.delete(`/teams/${teamId}/telegram`)
  },
  
  // 获取Telegram连接状态
  getTelegramStatus: (teamId) => {
    return apiService.get(`/teams/${teamId}/telegram/status`)
  },
  
  // 生成Telegram连接码
  generateTelegramConnectionCode: (teamId) => {
    return apiService.post(`/teams/${teamId}/telegram/connection-code`)
  },
  
  // 验证Telegram连接码
  verifyTelegramConnectionCode: (teamId, connectionCode) => {
    return apiService.post(`/teams/${teamId}/telegram/verify`, {
      connection_code: connectionCode
    })
  }
} 