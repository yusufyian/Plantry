import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { v4 as uuidv4 } from 'uuid'
import Joi from 'joi'

const router = express.Router()

// 用户注册
router.post('/register', asyncHandler(async (req, res) => {
  const { username, first_name, last_name, email, password, telegram_id } = req.body

  // 验证输入数据
  const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    first_name: Joi.string().min(1).max(50).required(),
    last_name: Joi.string().min(1).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    telegram_id: Joi.string().allow(null).optional()
  })

  const { error } = registerSchema.validate({ username, first_name, last_name, email, password, telegram_id })
  if (error) {
    throw new AppError(`数据验证失败: ${error.details[0].message}`, 400, 'VALIDATION_ERROR')
  }

  // 检查用户名是否已存在
  const existingUserResult = await query(
    'SELECT id FROM users WHERE username = $1 OR email = $2',
    [username, email]
  )

  if (existingUserResult.rows.length > 0) {
    throw new AppError('用户名或邮箱已存在', 400, 'USER_EXISTS')
  }

  // 加密密码
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  // 创建用户
  const userId = uuidv4()
  const userResult = await query(`
    INSERT INTO users (
      id, username, first_name, last_name, email, password_hash, 
      telegram_id, is_active, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id, username, first_name, last_name, email, telegram_id, created_at
  `, [userId, username, first_name, last_name, email, hashedPassword, telegram_id])

  const newUser = userResult.rows[0]

  // 生成JWT令牌
  const token = jwt.sign(
    { userId: newUser.id, username: newUser.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.status(201).json({
    message: '注册成功',
    user: {
      id: newUser.id,
      username: newUser.username,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      telegram_id: newUser.telegram_id
    },
    token
  })
}))

// 用户登录
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // 验证输入数据
  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })

  const { error } = loginSchema.validate({ email, password })
  if (error) {
    throw new AppError(`数据验证失败: ${error.details[0].message}`, 400, 'VALIDATION_ERROR')
  }

  // 查找用户
  const userResult = await query(`
    SELECT id, username, first_name, last_name, email, password_hash, 
           telegram_id, is_active, avatar_url, timezone, language_code
    FROM users 
    WHERE email = $1
  `, [email])

  if (userResult.rows.length === 0) {
    throw new AppError('邮箱或密码错误', 401, 'INVALID_CREDENTIALS')
  }

  const user = userResult.rows[0]

  if (!user.is_active) {
    throw new AppError('账户已被禁用', 401, 'ACCOUNT_DISABLED')
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.password_hash)
  if (!isPasswordValid) {
    throw new AppError('邮箱或密码错误', 401, 'INVALID_CREDENTIALS')
  }

  // 更新最后登录时间
  await query(
    'UPDATE users SET last_seen_at = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  )

  // 生成JWT令牌
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({
    message: '登录成功',
    user: {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      telegram_id: user.telegram_id,
      avatar_url: user.avatar_url,
      timezone: user.timezone,
      language_code: user.language_code
    },
    token
  })
}))

// 用户登出
router.post('/logout', (req, res) => {
  // 在无状态的JWT认证中，服务器端登出主要是为了让客户端清除token。
  // 如果有token黑名单机制，会在这里将token加入黑名单。
  // 目前实现下，只需返回成功即可。
  res.json({
    message: '登出成功'
  })
})

// 演示账户登录
router.post('/demo', asyncHandler(async (req, res) => {
  // 查找或创建演示用户
  let demoUserResult = await query(`
    SELECT id, username, first_name, last_name, email, telegram_id, 
           avatar_url, timezone, language_code
    FROM users 
    WHERE email = 'demo@plantry.com'
  `)

  let demoUser

  if (demoUserResult.rows.length === 0) {
    // 创建演示用户
    const userId = uuidv4()
    const hashedPassword = await bcrypt.hash('demo123', 10)
    
    const createResult = await query(`
      INSERT INTO users (
        id, username, first_name, last_name, email, password_hash, 
        telegram_id, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, username, first_name, last_name, email, telegram_id, 
                avatar_url, timezone, language_code
    `, [userId, 'demo_user', '演示', '用户', 'demo@plantry.com', hashedPassword, null])
    
    demoUser = createResult.rows[0]
  } else {
    demoUser = demoUserResult.rows[0]
  }

  // 更新最后登录时间
  await query(
    'UPDATE users SET last_seen_at = CURRENT_TIMESTAMP WHERE id = $1',
    [demoUser.id]
  )

  // 生成JWT令牌
  const token = jwt.sign(
    { userId: demoUser.id, username: demoUser.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({
    message: '演示账户登录成功',
    user: {
      id: demoUser.id,
      username: demoUser.username,
      first_name: demoUser.first_name,
      last_name: demoUser.last_name,
      email: demoUser.email,
      telegram_id: demoUser.telegram_id,
      avatar_url: demoUser.avatar_url,
      timezone: demoUser.timezone,
      language_code: demoUser.language_code
    },
    token
  })
}))

// 验证令牌
router.get('/verify', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('缺少认证令牌', 401, 'MISSING_TOKEN')
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // 获取用户信息
    const userResult = await query(`
      SELECT id, username, first_name, last_name, email, telegram_id, 
             avatar_url, timezone, language_code, is_active
      FROM users 
      WHERE id = $1
    `, [decoded.userId])

    if (userResult.rows.length === 0) {
      throw new AppError('用户不存在', 401, 'USER_NOT_FOUND')
    }

    const user = userResult.rows[0]

    if (!user.is_active) {
      throw new AppError('账户已被禁用', 401, 'ACCOUNT_DISABLED')
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        telegram_id: user.telegram_id,
        avatar_url: user.avatar_url,
        timezone: user.timezone,
        language_code: user.language_code
      }
    })
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('无效的令牌', 401, 'INVALID_TOKEN')
    } else if (error.name === 'TokenExpiredError') {
      throw new AppError('令牌已过期', 401, 'TOKEN_EXPIRED')
    } else {
      throw error
    }
  }
}))

// 刷新令牌
router.post('/refresh', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('缺少认证令牌', 401, 'MISSING_TOKEN')
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // 检查用户是否存在且活跃
    const userResult = await query(`
      SELECT id, username, is_active
      FROM users 
      WHERE id = $1
    `, [decoded.userId])

    if (userResult.rows.length === 0) {
      throw new AppError('用户不存在', 401, 'USER_NOT_FOUND')
    }

    const user = userResult.rows[0]

    if (!user.is_active) {
      throw new AppError('账户已被禁用', 401, 'ACCOUNT_DISABLED')
    }

    // 生成新的JWT令牌
    const newToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: '令牌刷新成功',
      token: newToken
    })
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('无效的令牌', 401, 'INVALID_TOKEN')
    } else if (error.name === 'TokenExpiredError') {
      throw new AppError('令牌已过期', 401, 'TOKEN_EXPIRED')
    } else {
      throw error
    }
  }
}))

export default router 