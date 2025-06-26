import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'

// JWT认证中间件
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: '访问令牌缺失',
      code: 'TOKEN_MISSING'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // 验证用户是否仍然存在且活跃
    const userResult = await query(
      'SELECT id, email, username, is_active FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        error: '用户不存在',
        code: 'USER_NOT_FOUND'
      })
    }

    const user = userResult.rows[0]
    if (!user.is_active) {
      return res.status(401).json({ 
        error: '用户账户已被禁用',
        code: 'USER_INACTIVE'
      })
    }

    // 将用户信息附加到请求对象
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username
    }

    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: '访问令牌已过期',
        code: 'TOKEN_EXPIRED'
      })
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: '访问令牌无效',
        code: 'TOKEN_INVALID'
      })
    } else {
      console.error('JWT验证错误:', error)
      return res.status(500).json({ 
        error: '服务器内部错误',
        code: 'SERVER_ERROR'
      })
    }
  }
}

// 可选的认证中间件（不强制要求登录）
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    req.user = null
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userResult = await query(
      'SELECT id, email, username, is_active FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
      req.user = {
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        username: userResult.rows[0].username
      }
    } else {
      req.user = null
    }
  } catch (error) {
    req.user = null
  }

  next()
}

// 检查团队成员权限
export const checkTeamMember = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.body.team_id
    const userId = req.user.id

    if (!teamId) {
      return res.status(400).json({ 
        error: '团队ID缺失',
        code: 'TEAM_ID_MISSING'
      })
    }

    const memberResult = await query(
      `SELECT role FROM team_members 
       WHERE team_id = $1 AND user_id = $2`,
      [teamId, userId]
    )

    if (memberResult.rows.length === 0) {
      return res.status(403).json({ 
        error: '您不是该团队的成员',
        code: 'NOT_TEAM_MEMBER'
      })
    }

    req.teamRole = memberResult.rows[0].role
    next()
  } catch (error) {
    console.error('团队权限检查错误:', error)
    res.status(500).json({ 
      error: '服务器内部错误',
      code: 'SERVER_ERROR'
    })
  }
}

// 检查团队管理员权限
export const checkTeamAdmin = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.body.team_id
    const userId = req.user.id

    if (!teamId) {
      return res.status(400).json({ 
        error: '团队ID缺失',
        code: 'TEAM_ID_MISSING'
      })
    }

    const memberResult = await query(
      `SELECT role FROM team_members 
       WHERE team_id = $1 AND user_id = $2`,
      [teamId, userId]
    )

    if (memberResult.rows.length === 0) {
      return res.status(403).json({ 
        error: '您不是该团队的成员',
        code: 'NOT_TEAM_MEMBER'
      })
    }

    const role = memberResult.rows[0].role
    if (role !== 'admin') {
      return res.status(403).json({ 
        error: '需要团队管理员权限',
        code: 'ADMIN_REQUIRED'
      })
    }

    req.teamRole = role
    next()
  } catch (error) {
    console.error('团队管理员权限检查错误:', error)
    res.status(500).json({ 
      error: '服务器内部错误',
      code: 'SERVER_ERROR'
    })
  }
}

// 生成JWT令牌
export const generateToken = (userId, options = {}) => {
  const payload = { userId }
  const defaultOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET, { ...defaultOptions, ...options })
} 