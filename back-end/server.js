import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// 导入路由
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import teamRoutes from './routes/teams.js'
import taskRoutes from './routes/tasks.js'
import extractionRoutes from './routes/extractions.js'

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js'
import { authenticateToken } from './middleware/auth.js'

// 获取文件路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  }
})

// 中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://plantry.com', 'https://www.plantry.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}))
app.use(compression())
app.use(morgan('combined'))
app.use(limiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 静态文件服务
app.use('/uploads', express.static(join(__dirname, 'uploads')))

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/users', authenticateToken, userRoutes)
app.use('/api/teams', authenticateToken, teamRoutes)
app.use('/api/tasks', authenticateToken, taskRoutes)
app.use('/api/extractions', authenticateToken, extractionRoutes)

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'API端点不存在',
    path: req.originalUrl,
    method: req.method
  })
})

// 错误处理中间件
app.use(errorHandler)

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Plantry API服务器已启动`)
  console.log(`📍 地址: http://localhost:${PORT}`)
  console.log(`🌍 环境: ${process.env.NODE_ENV}`)
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN')}`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在优雅关闭服务器...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在优雅关闭服务器...')
  process.exit(0)
}) 