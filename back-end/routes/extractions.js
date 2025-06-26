import express from 'express'
import { query, withTransaction } from '../config/database.js'
import { checkTeamMember } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// 获取待确认的任务抽取
router.get('/pending', asyncHandler(async (req, res) => {
  const { team_id, page = 1, limit = 20 } = req.query
  const userId = req.user.id

  if (!team_id) {
    throw new AppError('团队ID是必需的', 400, 'TEAM_ID_REQUIRED')
  }

  // 检查团队成员权限
  req.params.teamId = team_id
  await checkTeamMember(req, res, () => {})

  const offset = (page - 1) * limit

  const extractionsResult = await query(`
    SELECT 
      tel.id, tel.team_id, tel.telegram_message_id, tel.original_message,
      tel.extracted_data, tel.confidence_score, tel.confidence_level,
      tel.is_confirmed, tel.confirmed_by, tel.confirmed_at, tel.task_id,
      tel.created_at,
      u.username as confirmed_by_username,
      u.first_name as confirmed_by_first_name,
      u.last_name as confirmed_by_last_name
    FROM task_extraction_logs tel
    LEFT JOIN users u ON tel.confirmed_by = u.id
    WHERE tel.team_id = $1 AND tel.is_confirmed IS NULL
    ORDER BY tel.created_at DESC
    LIMIT $2 OFFSET $3
  `, [team_id, limit, offset])

  const totalResult = await query(`
    SELECT COUNT(*) as count 
    FROM task_extraction_logs 
    WHERE team_id = $1 AND is_confirmed IS NULL
  `, [team_id])

  const extractions = extractionsResult.rows.map(row => ({
    id: row.id,
    team_id: row.team_id,
    telegram_message_id: row.telegram_message_id,
    original_message: row.original_message,
    extracted_data: row.extracted_data,
    confidence_score: parseFloat(row.confidence_score),
    confidence_level: row.confidence_level,
    is_confirmed: row.is_confirmed,
    confirmed_by: row.confirmed_by,
    confirmed_at: row.confirmed_at,
    task_id: row.task_id,
    created_at: row.created_at,
    confirmed_by_user: row.confirmed_by_username ? {
      username: row.confirmed_by_username,
      first_name: row.confirmed_by_first_name,
      last_name: row.confirmed_by_last_name
    } : null
  }))

  res.json({
    extractions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(totalResult.rows[0].count),
      pages: Math.ceil(totalResult.rows[0].count / limit)
    }
  })
}))

// 确认抽取的任务并创建真实任务
router.post('/:extractionId/confirm', asyncHandler(async (req, res) => {
  const { extractionId } = req.params
  const { task_data = {} } = req.body
  const userId = req.user.id

  // 获取抽取记录
  const extractionResult = await query(`
    SELECT tel.*, teams.id as team_id
    FROM task_extraction_logs tel
    JOIN teams ON tel.team_id = teams.id
    WHERE tel.id = $1
  `, [extractionId])

  if (extractionResult.rows.length === 0) {
    throw new AppError('抽取记录不存在', 404, 'EXTRACTION_NOT_FOUND')
  }

  const extraction = extractionResult.rows[0]

  // 检查团队成员权限
  req.params.teamId = extraction.team_id
  await checkTeamMember(req, res, () => {})

  if (extraction.is_confirmed !== null) {
    throw new AppError('该抽取记录已经处理过了', 400, 'ALREADY_PROCESSED')
  }

  // 使用事务创建任务并更新抽取记录
  const result = await withTransaction(async (client) => {
    // 创建任务
    const taskId = uuidv4()
    const taskData = {
      id: taskId,
      team_id: extraction.team_id,
      title: task_data.title || extraction.extracted_data.title,
      description: task_data.description || extraction.extracted_data.description || `从 Telegram 消息抽取：${extraction.original_message}`,
      status: task_data.status || 'seed',
      priority: task_data.priority || extraction.extracted_data.priority || 'medium',
      assignee_id: task_data.assignee_id || null,
      creator_id: userId,
      due_date: task_data.due_date || extraction.extracted_data.due_date || null,
      estimated_hours: task_data.estimated_hours || null,
      ai_extracted: true,
      ai_confidence: extraction.confidence_score,
      telegram_message_id: extraction.telegram_message_id,
      metadata: { ...extraction.extracted_data, ...task_data.metadata }
    }

    const taskResult = await client.query(`
      INSERT INTO tasks (
        id, team_id, title, description, status, priority, assignee_id, 
        creator_id, due_date, estimated_hours, ai_extracted, ai_confidence,
        telegram_message_id, metadata, position, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        COALESCE((SELECT MAX(position) + 1 FROM tasks WHERE team_id = $2 AND status = $5), 0),
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `, [
      taskData.id, taskData.team_id, taskData.title, taskData.description,
      taskData.status, taskData.priority, taskData.assignee_id, taskData.creator_id,
      taskData.due_date, taskData.estimated_hours, taskData.ai_extracted,
      taskData.ai_confidence, taskData.telegram_message_id, taskData.metadata
    ])

    // 更新抽取记录
    await client.query(`
      UPDATE task_extraction_logs
      SET is_confirmed = true, confirmed_by = $1, confirmed_at = CURRENT_TIMESTAMP, task_id = $2
      WHERE id = $3
    `, [userId, taskId, extractionId])

    return taskResult.rows[0]
  })

  res.json({
    message: '任务确认成功',
    task: result
  })
}))

// 拒绝抽取的任务
router.post('/:extractionId/reject', asyncHandler(async (req, res) => {
  const { extractionId } = req.params
  const { reason = '' } = req.body
  const userId = req.user.id

  // 获取抽取记录
  const extractionResult = await query(`
    SELECT tel.*, teams.id as team_id
    FROM task_extraction_logs tel
    JOIN teams ON tel.team_id = teams.id
    WHERE tel.id = $1
  `, [extractionId])

  if (extractionResult.rows.length === 0) {
    throw new AppError('抽取记录不存在', 404, 'EXTRACTION_NOT_FOUND')
  }

  const extraction = extractionResult.rows[0]

  // 检查团队成员权限
  req.params.teamId = extraction.team_id
  await checkTeamMember(req, res, () => {})

  if (extraction.is_confirmed !== null) {
    throw new AppError('该抽取记录已经处理过了', 400, 'ALREADY_PROCESSED')
  }

  // 更新抽取记录为拒绝状态
  await query(`
    UPDATE task_extraction_logs
    SET is_confirmed = false, confirmed_by = $1, confirmed_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `, [userId, extractionId])

  res.json({
    message: '任务已拒绝'
  })
}))

// 手动触发消息分析（模拟AI分析）
router.post('/analyze', asyncHandler(async (req, res) => {
  const { message, team_id } = req.body
  const userId = req.user.id

  if (!message || !team_id) {
    throw new AppError('消息内容和团队ID都是必需的', 400, 'MISSING_REQUIRED_FIELDS')
  }

  // 检查团队成员权限
  req.params.teamId = team_id
  await checkTeamMember(req, res, () => {})

  // 模拟AI分析结果
  const mockAnalysis = analyzeMessageForTasks(message)

  if (mockAnalysis.length === 0) {
    res.json({
      message: '未在消息中识别到任务',
      tasks: []
    })
    return
  }

  // 创建抽取记录
  const extractionPromises = mockAnalysis.map(async (analysis) => {
    const extractionId = uuidv4()
    
    const extractionResult = await query(`
      INSERT INTO task_extraction_logs (
        id, team_id, telegram_message_id, original_message, extracted_data,
        confidence_score, confidence_level, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      extractionId, team_id, Math.floor(Math.random() * 1000000), message,
      analysis.extracted_data, analysis.confidence, analysis.confidence_level
    ])

    return extractionResult.rows[0]
  })

  const extractions = await Promise.all(extractionPromises)

  res.json({
    message: `识别到 ${extractions.length} 个任务候选`,
    extractions: extractions.map(ext => ({
      id: ext.id,
      original_message: ext.original_message,
      extracted_data: ext.extracted_data,
      confidence_score: parseFloat(ext.confidence_score),
      confidence_level: ext.confidence_level,
      created_at: ext.created_at
    }))
  })
}))

// 简单的消息分析函数（模拟AI）
function analyzeMessageForTasks(message) {
  const tasks = []
  
  // 检测任务关键词
  const taskKeywords = ['需要', '要做', '任务', '完成', '处理', '解决', '实现', '开发', '设计', '测试']
  const hasTaskKeyword = taskKeywords.some(keyword => message.includes(keyword))
  
  if (!hasTaskKeyword) {
    return tasks
  }

  // 简单的任务提取逻辑
  let title = message.substring(0, 50)
  if (title.length < message.length) {
    title += '...'
  }

  // 检测优先级
  let priority = 'medium'
  if (message.includes('紧急') || message.includes('急')) {
    priority = 'urgent'
  } else if (message.includes('重要')) {
    priority = 'high'
  } else if (message.includes('不急')) {
    priority = 'low'
  }

  // 检测截止时间
  let dueDate = null
  const timeMatches = message.match(/(今天|明天|后天|本周|下周|(\d+)天后|(\d+)号)/g)
  if (timeMatches) {
    // 简单的时间解析（实际应用中需要更复杂的逻辑）
    const now = new Date()
    if (timeMatches.includes('明天')) {
      dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    } else if (timeMatches.includes('后天')) {
      dueDate = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()
    }
  }

  // 计算置信度
  let confidence = 0.5
  if (message.includes('@')) confidence += 0.2
  if (timeMatches) confidence += 0.15
  if (message.length > 20) confidence += 0.1
  if (hasTaskKeyword) confidence += 0.15

  confidence = Math.min(confidence, 0.95)

  const confidenceLevel = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low'

  tasks.push({
    extracted_data: {
      title: title.replace(/^@\w+\s*/, ''), // 移除开头的@用户名
      description: `从消息分析: ${message}`,
      priority,
      due_date: dueDate,
      assignee_username: null
    },
    confidence: parseFloat(confidence.toFixed(2)),
    confidence_level: confidenceLevel
  })

  return tasks
}

export default router 