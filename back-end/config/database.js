import pkg from 'pg'
import dotenv from 'dotenv'

const { Pool } = pkg
dotenv.config()

// 数据库连接池配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'plantry',
  user: process.env.DB_USER || 'yuyan',
  password: process.env.DB_PASSWORD || '',
  // 连接池配置
  min: 2, // 最小连接数
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 连接空闲超时
  connectionTimeoutMillis: 2000, // 连接超时
  // SSL配置（生产环境建议启用）
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
}

// 创建连接池
const pool = new Pool(dbConfig)

// 连接池事件监听
pool.on('connect', (client) => {
  console.log('📡 新的数据库连接已建立')
})

pool.on('error', (err, client) => {
  console.error('❌ 数据库连接池错误:', err)
})

pool.on('remove', (client) => {
  console.log('🔌 数据库连接已移除')
})

// 测试数据库连接
const testConnection = async () => {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW() as current_time, version() as version')
    console.log('✅ 数据库连接成功')
    console.log(`⏰ 服务器时间: ${result.rows[0].current_time}`)
    console.log(`📊 PostgreSQL版本: ${result.rows[0].version.split(',')[0]}`)
    client.release()
  } catch (err) {
    console.error('❌ 数据库连接失败:', err.message)
    process.exit(1)
  }
}

// 执行测试连接
testConnection()

// 查询执行函数
export const query = async (text, params) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 执行查询:', {
        text: text.replace(/\s+/g, ' ').trim(),
        duration: `${duration}ms`,
        rows: res.rows.length
      })
    }
    
    return res
  } catch (error) {
    console.error('❌ 查询执行失败:', {
      text: text.replace(/\s+/g, ' ').trim(),
      error: error.message,
      duration: `${Date.now() - start}ms`
    })
    throw error
  }
}

// 事务执行函数
export const withTransaction = async (callback) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// 获取连接池状态
export const getPoolStatus = () => {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  }
}

export default pool 