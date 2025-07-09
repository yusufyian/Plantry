import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { teamService } from '../services/teamService.js'

export const useTeamsStore = defineStore('teams', () => {
  const teams = ref([])
  const currentTeam = ref(null)
  const loading = ref(false)
  
  // 模拟数据
  const mockTeams = [
    {
      id: 'demo-team',
      name: '演示团队',
      description: '这是一个演示团队，用于展示Plantry的功能',
      owner_id: 'demo-user',
      telegram_chat_id: null,
      telegram_chat_type: null,
      settings: {},
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      my_role: 'admin',
      member_count: 3,
      total_tasks: 12,
      completed_tasks: 8,
      overdue_tasks: 1
    }
  ]
  
  // Computed
  const userTeams = computed(() => teams.value)
  const activeTeam = computed(() => currentTeam.value)
  
  // Actions
  const loadUserTeams = async () => {
    loading.value = true
    try {
      console.log('正在加载团队数据...')
      const response = await teamService.getMyTeams()
      teams.value = response.data
      console.log('团队数据加载完成:', this.teams)
      if (this.teams.length > 0) {
        setCurrentTeam(this.teams[0].id)
      }
    } catch (error) {
      console.error('Failed to load teams, using mock data:', error)
      // 使用模拟数据作为后备
      this.teams = [
        { id: 'demo-team', name: 'Plantry Demo' }
      ]
      this.setCurrentTeam('demo-team')
    } finally {
      loading.value = false
    }
  }
  
  const setCurrentTeam = (teamId) => {
    currentTeam.value = teams.value.find(team => team.id === teamId) || null
  }
  
  const createTeam = async (teamData) => {
    try {
      const newTeam = await teamService.createTeam(teamData)
      teams.value.push(newTeam)
      return newTeam
    } catch (error) {
      // 回退到本地创建
      const newTeam = {
        id: `team-${Date.now()}`,
        ...teamData,
        owner_id: 'demo-user',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        my_role: 'admin',
        member_count: 1,
        total_tasks: 0,
        completed_tasks: 0,
        overdue_tasks: 0
      }
      teams.value.push(newTeam)
      return newTeam
    }
  }
  
  const updateTeam = async (teamId, updates) => {
    try {
      const updatedTeam = await teamService.updateTeam(teamId, updates)
      const index = teams.value.findIndex(t => t.id === teamId)
      if (index !== -1) {
        teams.value[index] = { ...teams.value[index], ...updatedTeam }
      }
      return updatedTeam
    } catch (error) {
      // 回退到本地更新
      const team = teams.value.find(t => t.id === teamId)
      if (team) {
        Object.assign(team, updates, { updated_at: new Date().toISOString() })
      }
      throw error
    }
  }
  
  const deleteTeam = async (teamId) => {
    try {
      await teamService.deleteTeam(teamId)
      const index = teams.value.findIndex(t => t.id === teamId)
      if (index !== -1) {
        teams.value.splice(index, 1)
      }
    } catch (error) {
      // 回退到本地删除
      const index = teams.value.findIndex(t => t.id === teamId)
      if (index !== -1) {
        teams.value.splice(index, 1)
      }
    }
  }
  
  const getTeamMembers = async (teamId) => {
    try {
      const response = await teamService.getTeamMembers(teamId)
      return response.members || []
    } catch (error) {
      // 返回模拟成员数据
      return [
        {
          id: 'member-1',
          role: 'admin',
          joined_at: new Date().toISOString(),
          user: {
            id: 'demo-user',
            username: 'demo_user',
            first_name: '演示',
            last_name: '用户',
            email: 'demo@plantry.com',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
          }
        }
      ]
    }
  }
  
  const getTeamStatistics = async (teamId) => {
    try {
      const response = await teamService.getTeamStatistics(teamId)
      return response.statistics
    } catch (error) {
      // 返回模拟统计数据
      return {
        team_id: teamId,
        member_count: 3,
        total_tasks: 12,
        completed_tasks: 8,
        overdue_tasks: 1,
        project_count: 2
      }
    }
  }
  
  // 初始化
  const initialize = async () => {
    await loadUserTeams()
    if (teams.value.length > 0) {
      setCurrentTeam(teams.value[0].id)
    }
  }
  
  return {
    teams,
    currentTeam,
    loading,
    userTeams,
    activeTeam,
    loadUserTeams,
    setCurrentTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeamMembers,
    getTeamStatistics,
    initialize
  }
}) 