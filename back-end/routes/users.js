import express from 'express'
import { query } from '../config/database.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import Joi from 'joi'

const router = express.Router()

// 获取当前用户信息
router.get('/me', asyncHandler(async (req, res) => {
  const userId = req.user.id
  
  const userResult = await query(`
    SELECT 
      id, telegram_id, username, first_name, last_name, email, 
      phone, timezone, language_code, avatar_url, is_active, 
      last_seen_at, created_at, updated_at
    FROM users 
    WHERE id = $1
  `, [userId])

  if (userResult.rows.length === 0) {
    throw new AppError('用户不存在', 404, 'USER_NOT_FOUND')
  }

  res.json({
    user: userResult.rows[0]
  })
}))

// 更新用户资料
router.patch('/me', asyncHandler(async (req, res) => {
  const userId = req.user.id
  const updates = req.body

  // 允许更新的字段
  const allowedFields = [
    'username', 'first_name', 'last_name', 'phone', 
    'timezone', 'language_code', 'avatar_url'
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

  updateFields.push(`updated_at = CURRENT_TIMESTAMP`)
  updateValues.push(userId)

  const updateQuery = `
    UPDATE users 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, username, first_name, last_name, email, 
             phone, timezone, language_code, avatar_url, 
             is_active, created_at, updated_at
  `

  const updatedResult = await query(updateQuery, updateValues)
  const updatedUser = updatedResult.rows[0]

  res.json({
    message: '用户资料更新成功',
    user: updatedUser
  })
}))

// 获取用户通知
router.get('/me/notifications', asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { page = 1, limit = 20 } = req.query
  
  const offset = (page - 1) * limit

  const notificationsResult = await query(`
    SELECT 
      n.id, n.type, n.title, n.content, n.is_read,
      n.scheduled_at, n.sent_at, n.created_at,
      t.title as task_title
    FROM notifications n
    LEFT JOIN tasks t ON n.task_id = t.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
    LIMIT $2 OFFSET $3
  `, [userId, limit, offset])

  const totalResult = await query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1',
    [userId]
  )

  res.json({
    notifications: notificationsResult.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(totalResult.rows[0].count),
      pages: Math.ceil(totalResult.rows[0].count / limit)
    }
  })
}))

// 标记通知为已读
router.patch('/me/notifications/read-all', asyncHandler(async (req, res) => {
  const userId = req.user.id

  await query(
    'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
    [userId]
  )

  res.json({
    message: '所有通知已标记为已读'
  })
}))

// 搜索用户
router.get('/search', asyncHandler(async (req, res) => {
  const { q: query_text, team_id } = req.query

  if (!query_text || query_text.length < 2) {
    throw new AppError('搜索关键词至少需要2个字符', 400, 'INVALID_QUERY')
  }

  let searchQuery = `
    SELECT 
      u.id, u.username, u.first_name, u.last_name, 
      u.email, u.avatar_url
    FROM users u
    WHERE u.is_active = true
    AND (
      u.username ILIKE $1 OR 
      u.first_name ILIKE $1 OR 
      u.last_name ILIKE $1 OR 
      u.email ILIKE $1
    )
  `
  let params = [`%${query_text}%`]

  // 如果指定了团队ID，只搜索团队成员
  if (team_id) {
    searchQuery += `
      AND EXISTS (
        SELECT 1 FROM team_members tm 
        WHERE tm.user_id = u.id AND tm.team_id = $2
      )
    `
    params.push(team_id)
  }

  searchQuery += ' ORDER BY u.username LIMIT 20'

  const searchResult = await query(searchQuery, params)

  res.json({
    users: searchResult.rows
  })
}))

export default router 