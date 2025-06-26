import express from 'express'
import { query, withTransaction } from '../config/database.js'
import { checkTeamMember, checkTeamAdmin } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { v4 as uuidv4 } from 'uuid'
import Joi from 'joi'

const router = express.Router()

// 获取用户所在的团队列表
router.get('/my', asyncHandler(async (req, res) => {
  const userId = req.user.id

  const teamsResult = await query(`
    SELECT 
      t.id, t.name, t.description, t.owner_id, t.telegram_chat_id,
      t.telegram_chat_type, t.settings, t.is_active, t.created_at, t.updated_at,
      tm.role as my_role,
      ts.member_count, ts.total_tasks, ts.completed_tasks, ts.overdue_tasks
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    LEFT JOIN team_statistics ts ON t.id = ts.team_id
    WHERE tm.user_id = $1 AND t.is_active = true
    ORDER BY t.created_at DESC
  `, [userId])

  res.json({
    teams: teamsResult.rows
  })
}))

// 获取团队详情
router.get('/:teamId', checkTeamMember, asyncHandler(async (req, res) => {
  const { teamId } = req.params

  const teamResult = await query(`
    SELECT 
      t.*,
      ts.member_count, ts.total_tasks, ts.completed_tasks, ts.overdue_tasks,
      u.username as owner_username, u.first_name as owner_first_name, u.last_name as owner_last_name
    FROM teams t
    LEFT JOIN team_statistics ts ON t.id = ts.team_id
    LEFT JOIN users u ON t.owner_id = u.id
    WHERE t.id = $1
  `, [teamId])

  if (teamResult.rows.length === 0) {
    throw new AppError('团队不存在', 404, 'TEAM_NOT_FOUND')
  }

  const team = teamResult.rows[0]
  
  res.json({
    team: {
      ...team,
      owner: {
        username: team.owner_username,
        first_name: team.owner_first_name,
        last_name: team.owner_last_name
      }
    }
  })
}))

// 创建团队
router.post('/', asyncHandler(async (req, res) => {
  const { name, description, settings = {} } = req.body
  const userId = req.user.id

  if (!name || name.trim().length === 0) {
    throw new AppError('团队名称不能为空', 400, 'TEAM_NAME_REQUIRED')
  }

  // 使用事务创建团队并添加创建者为管理员
  const result = await withTransaction(async (client) => {
    // 创建团队
    const teamId = uuidv4()
    const teamResult = await client.query(`
      INSERT INTO teams (id, name, description, owner_id, settings, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [teamId, name.trim(), description || '', userId, settings])

    // 添加创建者为管理员
    await client.query(`
      INSERT INTO team_members (id, team_id, user_id, role, joined_at)
      VALUES ($1, $2, $3, 'admin', CURRENT_TIMESTAMP)
    `, [uuidv4(), teamId, userId])

    return teamResult.rows[0]
  })

  res.status(201).json({
    message: '团队创建成功',
    team: result
  })
}))

// 获取团队成员
router.get('/:teamId/members', checkTeamMember, asyncHandler(async (req, res) => {
  const { teamId } = req.params

  const membersResult = await query(`
    SELECT 
      tm.id, tm.role, tm.joined_at,
      u.id as user_id, u.username, u.first_name, u.last_name, 
      u.email, u.avatar_url, u.last_seen_at
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    WHERE tm.team_id = $1
    ORDER BY tm.joined_at ASC
  `, [teamId])

  const members = membersResult.rows.map(row => ({
    id: row.id,
    role: row.role,
    joined_at: row.joined_at,
    user: {
      id: row.user_id,
      username: row.username,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      avatar_url: row.avatar_url,
      last_seen_at: row.last_seen_at
    }
  }))

  res.json({
    members
  })
}))

// 获取团队设置
router.get('/:teamId/settings', checkTeamMember, asyncHandler(async (req, res) => {
  const { teamId } = req.params

  const settingsResult = await query(`
    SELECT setting_key, setting_value
    FROM team_settings
    WHERE team_id = $1
  `, [teamId])

  const settings = {}
  settingsResult.rows.forEach(row => {
    settings[row.setting_key] = row.setting_value
  })

  res.json({
    settings
  })
}))

// 更新团队设置
router.put('/:teamId/settings', checkTeamAdmin, asyncHandler(async (req, res) => {
  const { teamId } = req.params
  const { setting_key, setting_value } = req.body

  if (!setting_key) {
    throw new AppError('设置键名不能为空', 400, 'SETTING_KEY_REQUIRED')
  }

  await query(`
    INSERT INTO team_settings (id, team_id, setting_key, setting_value, created_at, updated_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (team_id, setting_key) 
    DO UPDATE SET 
      setting_value = EXCLUDED.setting_value,
      updated_at = CURRENT_TIMESTAMP
  `, [uuidv4(), teamId, setting_key, setting_value])

  res.json({
    message: '设置更新成功'
  })
}))

// 获取团队统计信息
router.get('/:teamId/statistics', checkTeamMember, asyncHandler(async (req, res) => {
  const { teamId } = req.params

  const statsResult = await query(`
    SELECT * FROM team_statistics WHERE team_id = $1
  `, [teamId])

  if (statsResult.rows.length === 0) {
    // 如果视图中没有数据，返回默认值
    res.json({
      statistics: {
        team_id: teamId,
        member_count: 0,
        total_tasks: 0,
        completed_tasks: 0,
        overdue_tasks: 0,
        project_count: 0
      }
    })
  } else {
    res.json({
      statistics: statsResult.rows[0]
    })
  }
}))

// Telegram 连接状态
router.get('/:teamId/telegram/status', checkTeamMember, asyncHandler(async (req, res) => {
  const { teamId } = req.params

  const teamResult = await query(`
    SELECT telegram_chat_id, telegram_chat_type, bot_token
    FROM teams
    WHERE id = $1
  `, [teamId])

  if (teamResult.rows.length === 0) {
    throw new AppError('团队不存在', 404, 'TEAM_NOT_FOUND')
  }

  const team = teamResult.rows[0]
  const connected = !!(team.telegram_chat_id && team.bot_token)

  res.json({
    status: {
      connected,
      chat_id: team.telegram_chat_id,
      chat_type: team.telegram_chat_type,
      last_message_at: null // 这里可以从消息日志获取
    }
  })
}))

// 生成 Telegram 连接码
router.post('/:teamId/telegram/connection-code', checkTeamAdmin, asyncHandler(async (req, res) => {
  const { teamId } = req.params
  
  // 生成一个临时连接码
  const connectionCode = `PLANTRY_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  
  // 在实际应用中，这个连接码应该存储到 Redis 或数据库中，并设置过期时间
  
  res.json({
    connection_code: connectionCode,
    expires_in: 300 // 5分钟过期
  })
}))

export default router 