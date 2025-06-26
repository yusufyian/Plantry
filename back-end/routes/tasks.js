import express from 'express'
import { query, withTransaction } from '../config/database.js'
import { checkTeamMember } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { v4 as uuidv4 } from 'uuid'
import Joi from 'joi'

const router = express.Router()

// 获取任务列表（看板视图）
router.get('/board', asyncHandler(async (req, res) => {
  const { team_id, status } = req.query
  const userId = req.user.id

  if (!team_id) {
    throw new AppError('团队ID是必需的', 400, 'TEAM_ID_REQUIRED')
  }

  // 检查团队成员权限
  req.params.teamId = team_id
  await checkTeamMember(req, res, () => {})

  let whereClause = 'WHERE t.team_id = $1'
  let params = [team_id]
  let paramIndex = 2

  if (status) {
    whereClause += ` AND t.status = $${paramIndex}`
    params.push(status)
    paramIndex++
  }

  const tasksResult = await query(`
    SELECT 
      t.id, t.title, t.description, t.status, t.priority, t.assignee_id,
      t.creator_id, t.due_date, t.estimated_hours, t.actual_hours,
      t.ai_extracted, t.ai_confidence, t.telegram_message_id,
      t.metadata, t.position, t.created_at, t.updated_at,
      u.username as assignee_username, u.first_name as assignee_first_name, u.last_name as assignee_last_name,
      u.avatar_url as assignee_avatar,
      c.username as creator_username, c.first_name as creator_first_name, c.last_name as creator_last_name,
      c.avatar_url as creator_avatar
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN users c ON t.creator_id = c.id
    ${whereClause}
    ORDER BY t.position ASC, t.created_at DESC
  `, params)

  const tasks = tasksResult.rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assignee_id: row.assignee_id,
    creator_id: row.creator_id,
    due_date: row.due_date,
    estimated_hours: row.estimated_hours,
    actual_hours: row.actual_hours,
    ai_extracted: row.ai_extracted,
    ai_confidence: row.ai_confidence,
    telegram_message_id: row.telegram_message_id,
    metadata: row.metadata,
    position: row.position,
    created_at: row.created_at,
    updated_at: row.updated_at,
    assignee: row.assignee_id ? {
      id: row.assignee_id,
      username: row.assignee_username,
      first_name: row.assignee_first_name,
      last_name: row.assignee_last_name,
      avatar_url: row.assignee_avatar
    } : null,
    creator: {
      id: row.creator_id,
      username: row.creator_username,
      first_name: row.creator_first_name,
      last_name: row.creator_last_name,
      avatar_url: row.creator_avatar
    }
  }))

  res.json({
    tasks
  })
}))

// 创建新任务
router.post('/', asyncHandler(async (req, res) => {
  const { 
    team_id, title, description, status = 'seed', priority = 'medium',
    assignee_id, due_date, estimated_hours, metadata = {}
  } = req.body
  const userId = req.user.id

  if (!team_id || !title) {
    throw new AppError('团队ID和任务标题是必需的', 400, 'MISSING_REQUIRED_FIELDS')
  }

  // 检查团队成员权限
  req.params.teamId = team_id
  await checkTeamMember(req, res, () => {})

  // 验证数据
  const taskSchema = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    status: Joi.string().valid('seed', 'sprout', 'blossom', 'done').required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').required(),
    assignee_id: Joi.string().uuid().optional().allow(null),
    due_date: Joi.date().iso().optional().allow(null),
    estimated_hours: Joi.number().positive().optional().allow(null),
    metadata: Joi.object().optional()
  })

  const { error } = taskSchema.validate({
    title, description, status, priority, assignee_id, due_date, estimated_hours, metadata
  })

  if (error) {
    throw new AppError(`数据验证失败: ${error.details[0].message}`, 400, 'VALIDATION_ERROR')
  }

  const taskId = uuidv4()

  const taskResult = await query(`
    INSERT INTO tasks (
      id, team_id, title, description, status, priority, assignee_id,
      creator_id, due_date, estimated_hours, metadata, position, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
      COALESCE((SELECT MAX(position) + 1 FROM tasks WHERE team_id = $2 AND status = $5), 0),
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    RETURNING *
  `, [
    taskId, team_id, title, description || '', status, priority,
    assignee_id, userId, due_date, estimated_hours, metadata
  ])

  const newTask = taskResult.rows[0]

  res.status(201).json({
    message: '任务创建成功',
    task: newTask
  })
}))

// 获取单个任务详情
router.get('/:taskId', asyncHandler(async (req, res) => {
  const { taskId } = req.params

  const taskResult = await query(`
    SELECT 
      t.*,
      u.username as assignee_username, u.first_name as assignee_first_name, u.last_name as assignee_last_name,
      u.avatar_url as assignee_avatar,
      c.username as creator_username, c.first_name as creator_first_name, c.last_name as creator_last_name,
      c.avatar_url as creator_avatar
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN users c ON t.creator_id = c.id
    WHERE t.id = $1
  `, [taskId])

  if (taskResult.rows.length === 0) {
    throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND')
  }

  const task = taskResult.rows[0]

  // 检查团队成员权限
  req.params.teamId = task.team_id
  await checkTeamMember(req, res, () => {})

  const taskWithUsers = {
    ...task,
    assignee: task.assignee_id ? {
      id: task.assignee_id,
      username: task.assignee_username,
      first_name: task.assignee_first_name,
      last_name: task.assignee_last_name,
      avatar_url: task.assignee_avatar
    } : null,
    creator: {
      id: task.creator_id,
      username: task.creator_username,
      first_name: task.creator_first_name,
      last_name: task.creator_last_name,
      avatar_url: task.creator_avatar
    }
  }

  res.json({
    task: taskWithUsers
  })
}))

// 更新任务
router.put('/:taskId', asyncHandler(async (req, res) => {
  const { taskId } = req.params
  const updates = req.body
  const userId = req.user.id

  // 获取任务信息
  const taskResult = await query('SELECT * FROM tasks WHERE id = $1', [taskId])
  
  if (taskResult.rows.length === 0) {
    throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND')
  }

  const task = taskResult.rows[0]

  // 检查团队成员权限
  req.params.teamId = task.team_id
  await checkTeamMember(req, res, () => {})

  // 允许更新的字段
  const allowedFields = [
    'title', 'description', 'status', 'priority', 'assignee_id',
    'due_date', 'estimated_hours', 'actual_hours', 'metadata'
  ]

  const updateFields = []
  const updateValues = []
  let paramIndex = 1

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = $${paramIndex}`)
      updateValues.push(value)
      paramIndex++
    }
  }

  if (updateFields.length === 0) {
    throw new AppError('没有有效的更新字段', 400, 'NO_VALID_FIELDS')
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(taskId)

  const updateQuery = `
    UPDATE tasks 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `

  const updatedResult = await query(updateQuery, updateValues)
  const updatedTask = updatedResult.rows[0]

  res.json({
    message: '任务更新成功',
    task: updatedTask
  })
}))

// 删除任务
router.delete('/:taskId', asyncHandler(async (req, res) => {
  const { taskId } = req.params

  // 获取任务信息
  const taskResult = await query('SELECT * FROM tasks WHERE id = $1', [taskId])
  
  if (taskResult.rows.length === 0) {
    throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND')
  }

  const task = taskResult.rows[0]

  // 检查团队成员权限
  req.params.teamId = task.team_id
  await checkTeamMember(req, res, () => {})

  await query('DELETE FROM tasks WHERE id = $1', [taskId])

  res.json({
    message: '任务删除成功'
  })
}))

// 更新任务状态（拖拽排序）
router.patch('/:taskId/status', asyncHandler(async (req, res) => {
  const { taskId } = req.params
  const { status, position } = req.body

  if (!status) {
    throw new AppError('新状态是必需的', 400, 'STATUS_REQUIRED')
  }

  // 获取任务信息
  const taskResult = await query('SELECT * FROM tasks WHERE id = $1', [taskId])
  
  if (taskResult.rows.length === 0) {
    throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND')
  }

  const task = taskResult.rows[0]

  // 检查团队成员权限
  req.params.teamId = task.team_id
  await checkTeamMember(req, res, () => {})

  // 使用事务更新任务状态和位置
  await withTransaction(async (client) => {
    // 更新当前任务
    await client.query(`
      UPDATE tasks 
      SET status = $1, position = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [status, position || 0, taskId])

    // 重新排序同状态下的其他任务
    if (position !== undefined) {
      await client.query(`
        UPDATE tasks 
        SET position = position + 1
        WHERE team_id = $1 AND status = $2 AND id != $3 AND position >= $4
      `, [task.team_id, status, taskId, position])
    }
  })

  res.json({
    message: '任务状态更新成功'
  })
}))

// 获取任务统计信息
router.get('/statistics', asyncHandler(async (req, res) => {
  const { team_id } = req.query
  const userId = req.user.id

  if (!team_id) {
    throw new AppError('团队ID是必需的', 400, 'TEAM_ID_REQUIRED')
  }

  // 检查团队成员权限
  req.params.teamId = team_id
  await checkTeamMember(req, res, () => {})

  const statsResult = await query(`
    SELECT 
      status,
      COUNT(*) as count,
      COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'done' THEN 1 END) as overdue_count
    FROM tasks 
    WHERE team_id = $1
    GROUP BY status
  `, [team_id])

  const totalResult = await query(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'done' THEN 1 END) as completed,
      COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'done' THEN 1 END) as overdue
    FROM tasks 
    WHERE team_id = $1
  `, [team_id])

  const statusStats = {}
  statsResult.rows.forEach(row => {
    statusStats[row.status] = {
      count: parseInt(row.count),
      overdue_count: parseInt(row.overdue_count)
    }
  })

  const total = totalResult.rows[0]

  res.json({
    statistics: {
      total: parseInt(total.total),
      completed: parseInt(total.completed),
      overdue: parseInt(total.overdue),
      by_status: statusStats
    }
  })
}))

export default router 