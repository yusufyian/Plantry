// 全局错误处理中间件
export const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  })

  // 默认错误响应
  let error = {
    message: '服务器内部错误',
    code: 'SERVER_ERROR',
    status: 500
  }

  // 数据库错误
  if (err.code && err.code.startsWith('23')) { // PostgreSQL错误代码
    switch (err.code) {
      case '23505': // 唯一约束违反
        error = {
          message: '数据已存在，请检查重复项',
          code: 'DUPLICATE_ENTRY',
          status: 409,
          detail: err.detail
        }
        break
      case '23503': // 外键约束违反
        error = {
          message: '引用的数据不存在',
          code: 'FOREIGN_KEY_VIOLATION',
          status: 400,
          detail: err.detail
        }
        break
      case '23502': // 非空约束违反
        error = {
          message: '必填字段不能为空',
          code: 'NOT_NULL_VIOLATION',
          status: 400,
          detail: err.detail
        }
        break
      default:
        error.detail = err.detail
    }
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: '无效的访问令牌',
      code: 'INVALID_TOKEN',
      status: 401
    }
  } else if (err.name === 'TokenExpiredError') {
    error = {
      message: '访问令牌已过期',
      code: 'TOKEN_EXPIRED',
      status: 401
    }
  }

  // 验证错误（Joi）
  if (err.isJoi) {
    error = {
      message: '请求数据验证失败',
      code: 'VALIDATION_ERROR',
      status: 400,
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    }
  }

  // 文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: '文件大小超出限制',
      code: 'FILE_TOO_LARGE',
      status: 413
    }
  }

  // 自定义应用错误
  if (err.status) {
    error = {
      message: err.message,
      code: err.code || 'APPLICATION_ERROR',
      status: err.status,
      ...(err.details && { details: err.details })
    }
  }

  // 生产环境不暴露敏感信息
  if (process.env.NODE_ENV === 'production') {
    delete error.detail
    if (error.status === 500) {
      error.message = '服务器内部错误'
    }
  }

  res.status(error.status).json({
    error: error.message,
    code: error.code,
    ...(error.details && { details: error.details }),
    ...(error.detail && { detail: error.detail }),
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  })
}

// 创建应用错误的辅助函数
export class AppError extends Error {
  constructor(message, status = 500, code = 'APPLICATION_ERROR', details = null) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
    this.name = 'AppError'
  }
}

// 异步错误包装器
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
} 